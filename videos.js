(() => {
  const en = document.documentElement.lang === 'en';
  const grid = document.querySelector('#video-grid');
  if (!grid) return;
  const input = document.querySelector('#video-search');
  const more = document.querySelector('#load-more');
  const status = document.querySelector('#video-status');
  const grouped = grid.dataset.collection === 'videos';
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
  function category(item) {
    if (['modelrisk', 'safran-risk', 'ealde', 'otros'].includes(item.categoria)) return item.categoria;
    if (normalize(item.fuente).includes('ealde')) return 'ealde';
    const text = normalize(`${item.titulo} ${item.tema || ''}`);
    return text.includes('modelrisk') ? 'modelrisk' : text.includes('safran') ? 'safran-risk' : 'otros';
  }
  const groups = [
    {id: 'modelrisk', label: 'ModelRisk'},
    {id: 'safran-risk', label: 'Safran Risk'},
    {id: 'ealde', label: en ? 'EALDE · Projects, MS Project & @RISK' : 'EALDE · Proyectos, MS Project y @RISK'},
    {id: 'otros', label: en ? 'Other topics & tools' : 'Otros temas y herramientas'}
  ];
  const entries = (window.VIDEOS || []).filter(item => (item.coleccion || 'videos') === grid.dataset.collection).map(item => ({...item, id: videoId(item.url)})).filter(item => item.id && item.titulo);
  const openGroups = new Set();
  let limit = 12;
  function card(item) {
    const article = document.createElement('article'); article.className = 'video-card';
    const media = document.createElement('div'); media.className = 'video-media';
    const play = document.createElement('button'); play.type = 'button'; play.className = 'video-play'; play.setAttribute('aria-label', `${en ? 'Play' : 'Reproducir'}: ${item.titulo}`);
    const image = document.createElement('img'); image.src = `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`; image.alt = ''; image.loading = 'lazy'; image.width = 480; image.height = 360;
    const icon = document.createElement('span'); icon.className = 'video-play-icon'; icon.textContent = '▶'; icon.setAttribute('aria-hidden', 'true');
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
    article.append(media, body); return article;
  }
  function accordion(group, items, query) {
    const details = document.createElement('details'); details.className = 'video-accordion'; details.open = Boolean(query) || openGroups.has(group.id);
    const summary = document.createElement('summary');
    const heading = document.createElement('span'); heading.className = 'accordion-label'; heading.textContent = group.label;
    const count = document.createElement('span'); count.className = 'accordion-count'; count.textContent = `${items.length} videos`;
    const indicator = document.createElement('span'); indicator.className = 'accordion-indicator'; indicator.setAttribute('aria-hidden', 'true'); indicator.textContent = '+';
    summary.append(heading, count, indicator);
    const content = document.createElement('div'); content.className = 'accordion-content';
    const cards = document.createElement('div'); cards.className = 'video-grid';
    const next = document.createElement('button'); next.type = 'button'; next.className = 'button accordion-more'; next.textContent = en ? 'Show more' : 'Mostrar más'; next.setAttribute('aria-label', `${en ? 'Show more' : 'Mostrar más'}: ${group.label}`);
    let visible = 0;
    function appendBatch() {
      items.slice(visible, visible + 12).forEach(item => cards.append(card(item)));
      visible = Math.min(visible + 12, items.length); next.hidden = visible >= items.length;
    }
    appendBatch(); next.addEventListener('click', appendBatch);
    content.append(cards, next); details.append(summary, content);
    details.addEventListener('toggle', () => {
      if (!input.value.trim()) { if (details.open) openGroups.add(group.id); else openGroups.delete(group.id); }
      // Closing a category stops any videos playing inside it.
      if (!details.open) content.querySelectorAll('iframe').forEach(frame => {
        const item = items.find(entry => frame.src.includes(`/embed/${entry.id}`));
        if (item) frame.closest('.video-card').replaceWith(card(item));
      });
    });
    return details;
  }
  function render() {
    const query = normalize(input.value.trim());
    const results = entries.filter(item => normalize([item.titulo, item.tema, item.organizador, groups.find(group => group.id === category(item))?.label].join(' ')).includes(query));
    grid.replaceChildren();
    document.querySelector('#video-count').textContent = `${entries.length} ${grouped ? 'videos' : en ? 'talks' : 'charlas'}`;
    if (grouped) {
      grid.className = 'video-accordions';
      groups.forEach(group => {
        const items = results.filter(item => category(item) === group.id);
        if (items.length) grid.append(accordion(group, items, query));
      });
      more.hidden = true;
    } else {
      results.slice(0, limit).forEach(item => grid.append(card(item)));
      more.hidden = results.length <= limit;
    }
    status.textContent = !entries.length
      ? (en ? 'New talks coming soon. Recordings will be added here.' : 'Próximamente: nuevas charlas. Las grabaciones se incorporarán aquí.')
      : !results.length
        ? (en ? 'No videos found for this search.' : 'No se encontraron videos para esta búsqueda.')
        : grouped
          ? (en ? `${results.length} videos. Expand a category to explore.` : `${results.length} videos. Abre una categoría para explorar.`)
          : (en ? `Showing ${Math.min(limit, results.length)} of ${results.length}.` : `Mostrando ${Math.min(limit, results.length)} de ${results.length}.`);
  }
  input.addEventListener('input', () => { limit = 12; render(); });
  more.addEventListener('click', () => { limit += 12; render(); });
  render();
})();
