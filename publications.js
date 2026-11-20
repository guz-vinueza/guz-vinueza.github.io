(() => {
  const list = document.querySelector('#publication-list');
  if (!list) return;
  const en = document.documentElement.lang === 'en';
  const input = document.querySelector('#search');
  const status = document.querySelector('#publication-status');
  const entries = [...(window.PUBLICATIONS || [])].sort((a, b) => b.year - a.year);
  const labels = en ? {book: 'Book', article: 'Article', conference: 'Conference contribution'} : {book: 'Libro', article: 'Artículo', conference: 'Contribución a conferencia'};
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let filter = 'all';
  function externalLink(url, text) {
    const link = document.createElement('a'); link.href = url; link.textContent = text; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.className = 'text-link'; return link;
  }
  function render() {
    const query = normalize(input.value.trim());
    const results = entries.filter(item => (filter === 'all' || item.tipo === filter) && normalize([item.titulo, item.autores, item.referencia, item.year, labels[item.tipo]].join(' ')).includes(query));
    list.replaceChildren();
    document.querySelector('#publication-count').textContent = `${entries.length} ${en ? 'publications' : 'publicaciones'}`;
    results.forEach(item => {
      const article = document.createElement('article'); article.className = 'publication-card';
      const meta = document.createElement('div'); meta.className = 'publication-meta';
      const year = document.createElement('span'); year.className = 'publication-year'; year.textContent = item.year;
      const type = document.createElement('span'); type.className = 'publication-type'; type.textContent = labels[item.tipo]; meta.append(year, type);
      const content = document.createElement('div'); content.className = 'publication-detail';
      const title = document.createElement('h3'); title.textContent = item.titulo;
      const authors = document.createElement('p'); authors.className = 'publication-authors'; authors.textContent = item.autores;
      content.append(title, authors);
      if (item.referencia) { const venue = document.createElement('p'); venue.className = 'publication-venue'; venue.textContent = item.referencia; content.append(venue); }
      const actions = document.createElement('div'); actions.className = 'publication-actions'; if (item.url) actions.append(externalLink(item.url, en ? 'View Scholar record' : 'Ver ficha en Scholar'));
      if (item.source === 'cv') { const source = document.createElement('p'); source.className = 'publication-venue'; source.textContent = en ? 'Listed in the author’s CV; external record not linked.' : 'Incluida en el CV del autor; sin enlace a ficha externa.'; content.append(source); }
      if (item.amazon) actions.append(externalLink(item.amazon, en ? 'View on Amazon' : 'Ver en Amazon'));
      content.append(actions); article.append(meta, content); list.append(article);
    });
    status.textContent = results.length ? (en ? `Showing ${results.length} of ${entries.length} publications.` : `Mostrando ${results.length} de ${entries.length} publicaciones.`) : (en ? 'No publications match your search and filter.' : 'No hay publicaciones que coincidan con la búsqueda y el filtro.');
  }
  input.addEventListener('input', render);
  document.querySelectorAll('[data-publication-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.publicationFilter;
    document.querySelectorAll('[data-publication-filter]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
    render();
  }));
  render();
})();
