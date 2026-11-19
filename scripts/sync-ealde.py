"""Import EALDE videos explicitly credited to Guz/Gustavo Vinueza.
Requires yt-dlp. Run: python scripts/sync-ealde.py
"""
from pathlib import Path
import concurrent.futures
import importlib.util
import json
import re
import subprocess
import sys
import urllib.parse

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('ferryfield_sync', ROOT / 'scripts' / 'sync-youtube.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)
CLUES = re.compile(r'proyect|project|@risk|vinueza|monte.?carlo', re.I)
CHANNEL = 'https://www.youtube.com/@EaldeEs'

def merge(videos, total):
    matched = [v for v in videos if sync.CREDIT.search(v['title'] + '\n' + v['description'])]
    if not matched:
        raise ValueError('No credited EALDE videos found; existing library left unchanged.')
    path = ROOT / 'videos-data.js'
    previous = json.loads(path.read_text(encoding='utf-8-sig').split('window.VIDEOS =', 1)[1].strip().rstrip(';'))
    ids = set()
    entries = []
    for video in matched:
        if video['id'] in ids:
            continue
        ids.add(video['id'])
        text = video['title'].lower()
        topic = '@RISK' if '@risk' in text else 'MS Project' if 'project' in text else 'Monte Carlo' if 'monte carlo' in text else 'Proyectos'
        entries.append({'titulo': video['title'], 'url': 'https://youtu.be/' + video['id'], 'tema': topic, 'coleccion': 'videos', 'fuente': 'EALDE Business School', 'categoria': 'ealde'})
    retained = []
    for item in previous:
        url = urllib.parse.urlparse(item['url'])
        video_id = urllib.parse.parse_qs(url.query).get('v', [url.path.rstrip('/').rsplit('/', 1)[-1]])[0]
        if video_id not in ids or item.get('coleccion', 'videos') != 'videos':
            retained.append(item)
    header = '// Edita esta lista para añadir videos. Conserva el formato JSON (comillas dobles).\n// categoria: "modelrisk", "safran-risk", "ealde" u "otros".\nwindow.VIDEOS = '
    path.write_text(header + json.dumps(retained + entries, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    report = {'channel': CHANNEL, 'catalog_entries': total, 'candidate_descriptions_reviewed': len(videos), 'selection': 'Project / MS Project / @RISK / Monte Carlo title clues; explicit Guz/Gustavo Vinueza credit required.', 'credited': len(entries), 'matches': [{'id': v['id'], 'title': v['title'], 'credit_location': 'title' if sync.CREDIT.search(v['title']) else 'description'} for v in matched]}
    (ROOT / 'ealde-import-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Added {len(entries)} confirmed EALDE videos; total library entries: {len(retained) + len(entries)}.')

if __name__ == '__main__':
    entries = {}
    for tab in ('videos', 'streams'):
        catalog = json.loads(subprocess.check_output([sys.executable, '-m', 'yt_dlp', '--flat-playlist', '--dump-single-json', '--skip-download', CHANNEL + '/' + tab], text=True, encoding='utf-8'))
        entries.update({v['id']: v for v in catalog['entries']})
    candidates = [v for v in entries.values() if CLUES.search(v['title'])]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        videos = list(pool.map(sync.metadata, candidates))
    # Do not modify the library unless all candidate descriptions have loaded.
    merge(videos, len(entries))
