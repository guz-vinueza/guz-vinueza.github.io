(() => {
  const en = document.documentElement.lang === 'en';
  const grid = document.querySelector('#video-grid');
  if (!grid) return;
  const input = document.querySelector('#video-search');
  const more = document.querySelector('#load-more');
  const status = document.querySelector('#video-status');
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function videoId(value) {
    try {
      const url = new URL(value);
      if (!['https:', 'http:'].includes(url.protocol)) return null;
      const host = url.hostname.replace(/^www\./, '');
      const id = host === 'youtu.be' ? url.pathname.slice(1) : ['youtube.com', 'm.youtube.com'].includes(host) ? (url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1]) : null;
      return /^[\w-]{11}$/.test(id || '') ? id : null;
    } catch (_) { return null; }
  }
  const entries = (window.VIDEOS || []).filter(item => (item.coleccion || 'videos') === grid.dataset.collection).map(item => ({...item, id: videoId(item.url)})).filter(item => item.id && item.titulo);
  let limit = 12;
  function render() {
    const query = normalize(input.value.trim());
    const results = entries.filter(item => normalize([item.titulo, item.tema, item.organizador].join(' ')).includes(query));
    grid.replaceChildren();
    document.querySelector('#video-count').textContent = `${entries.length} ${grid.dataset.collection === 'charlas' ? (en ? 'talks' : 'charlas') : 'videos'}`;
    results.slice(0, limit).forEach(item => {
      const card = document.createElement('article'); card.className = 'video-card';
      const media = document.createElement('div'); media.className = 'video-media';
      const play = document.createElement('button'); play.className = 'video-play'; play.setAttribute('aria-label', `${en ? 'Play' : 'Reproducir'}: ${item.titulo}`);
      const image = document.createElement('img'); image.src = `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`; image.alt = ''; image.loading = 'lazy'; image.width = 480; image.height = 360;
      const icon = document.createElement('span'); icon.className = 'video-play-icon'; icon.textContent = '▶';
      play.append(image, icon);
      play.addEventListener('click', () => {
        const frame = document.createElement('iframe');
        frame.src = `https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1`;
        frame.title = item.titulo; frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin';
        media.replaceChildren(frame); frame.focus();
      });
      media.append(play);
      const body = document.createElement('div'); body.className = 'video-body';
      if (item.tema) { const topic = document.createElement('p'); topic.className = 'eyebrow'; topic.textContent = item.tema; body.append(topic); }
      const title = document.createElement('h3'); title.textContent = item.titulo; body.append(title);
      if (item.fecha || item.organizador) { const metadata = document.createElement('p'); metadata.className = 'video-meta'; metadata.textContent = [item.fecha, item.organizador].filter(Boolean).join(' · '); body.append(metadata); }
      const link = document.createElement('a'); link.href = `https://www.youtube.com/watch?v=${item.id}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.className = 'text-link'; link.textContent = en ? 'Watch on YouTube' : 'Ver en YouTube'; body.append(link);
      card.append(media, body); grid.append(card);
    });
    status.textContent = en
      ? (!entries.length ? 'New talks coming soon. Recordings will be added here.' : !results.length ? 'No videos found for this search.' : `Showing ${Math.min(limit, results.length)} of ${results.length}.`)
      : (!entries.length ? 'Próximamente: nuevas charlas. Las grabaciones se incorporarán aquí.' : !results.length ? 'No se encontraron videos para esta búsqueda.' : `Mostrando ${Math.min(limit, results.length)} de ${results.length}.`);
    more.hidden = results.length <= limit;
  }
  input.addEventListener('input', () => { limit = 12; render(); });
  more.addEventListener('click', () => { limit += 12; render(); });
  render();
})();
