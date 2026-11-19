"""Refresh the video library from public Ferryfield channel metadata.
Requires: python -m pip install yt-dlp
Run from any directory: python scripts/sync-youtube.py
"""
from pathlib import Path
import concurrent.futures
import datetime
import json
import re
import subprocess
import sys
import urllib.request
import urllib.parse

ROOT = Path(__file__).resolve().parents[1]
CHANNEL = 'https://www.youtube.com/@FerryfieldGroup/videos'
CREDIT = re.compile(r'\b(?:guz|gus|gustavo)\s+vinueza\b', re.I)

def metadata(video):
    request = urllib.request.Request('https://www.youtube.com/watch?v=' + video['id'], headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-US,en;q=0.9'})
    with urllib.request.urlopen(request, timeout=30) as response:
        html = response.read().decode('utf-8', 'replace')
    match = re.search(r'(?:var\s+)?ytInitialPlayerResponse\s*=\s*', html)
    if not match:
        raise ValueError('Missing public metadata: ' + video['id'])
    details = json.JSONDecoder().raw_decode(html[match.end():])[0].get('videoDetails', {})
    if not details:
        raise ValueError('Missing video details: ' + video['id'])
    return {'id': video['id'], 'title': details.get('title', video['title']), 'description': details.get('shortDescription', '')}

def topic(title):
    for name in ('ModelRisk', 'ModelChoice', 'Safran Risk Manager', 'Safran Risk', 'Tamara'):
        if name.lower() in title.lower():
            return name
    return 'Monte Carlo' if 'monte carlo' in title.lower() else 'QRA'

def write_library(videos):
    path = ROOT / 'videos-data.js'
    previous = json.loads(path.read_text(encoding='utf-8-sig').split('window.VIDEOS =', 1)[1].strip().rstrip(';'))
    matched = [v for v in videos if CREDIT.search(v['title'] + '\n' + v['description'])]
    if not matched:
        raise ValueError('No credited videos found; existing library left unchanged.')
    entries = []
    audit = []
    for video in matched:
        evidence = 'title' if CREDIT.search(video['title']) else 'description'
        entries.append({'titulo': video['title'], 'url': 'https://youtu.be/' + video['id'], 'tema': topic(video['title']), 'coleccion': 'videos', 'fuente': 'Ferryfield Group'})
        audit.append({'id': video['id'], 'title': video['title'], 'credit_location': evidence})
    ids = {v['id'] for v in matched}
    # Preserve manual entries, speaking recordings and previously verified videos.
    for entry in previous:
        url = urllib.parse.urlparse(entry['url'])
        video_id = urllib.parse.parse_qs(url.query).get('v', [url.path.rstrip('/').rsplit('/', 1)[-1]])[0]
        if video_id not in ids or entry.get('coleccion', 'videos') != 'videos':
            entries.append(entry)
    header = '// Edita esta lista para añadir videos. Conserva el formato JSON (comillas dobles).\n// Para charlas usa coleccion: "charlas".\nwindow.VIDEOS = '
    path.write_text(header + json.dumps(entries, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    (ROOT / 'youtube-import-report.json').write_text(json.dumps({'channel': CHANNEL, 'reviewed_on': datetime.date.today().isoformat(), 'reviewed': len(videos), 'credited': len(matched), 'matches': audit, 'excluded': [{'id': v['id'], 'title': v['title']} for v in videos if v not in matched]}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Reviewed {len(videos)} videos; imported {len(matched)} credited videos. Total entries: {len(entries)}.')

if __name__ == '__main__':
    catalog = json.loads(subprocess.check_output([sys.executable, '-m', 'yt_dlp', '--flat-playlist', '--dump-single-json', '--skip-download', CHANNEL], text=True, encoding='utf-8'))
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        videos = list(pool.map(metadata, catalog['entries']))
    # Write only after all metadata requests succeed.
    write_library(videos)
