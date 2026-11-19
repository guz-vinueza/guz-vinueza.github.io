const english = document.documentElement.lang === 'en';
const themeButton = document.querySelector('.theme');
function updateThemeLabel() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', dark ? (english ? 'Enable light mode' : 'Activar modo claro') : (english ? 'Enable dark mode' : 'Activar modo oscuro'));
  themeButton.setAttribute('aria-pressed', String(dark));
}
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('gv-theme', theme); } catch (_) {}
  updateThemeLabel();
});
updateThemeLabel();
document.querySelector('#year').textContent = new Date().getFullYear();
const current = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a').forEach(link => {
  if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
});
const search = document.querySelector('#search');
let selectedFilter = 'all';
function updateLibrary() {
  const message = document.querySelector('.empty-state h3');
  const query = search.value.trim();
  message.textContent = english
    ? (query ? `No publications found for “${query}”.` : selectedFilter === 'all' ? 'A library in the making.' : 'There are no publications in this topic yet.')
    : (query ? `No hay publicaciones para «${query}».` : selectedFilter === 'all' ? 'Una biblioteca en construcción.' : 'Todavía no hay publicaciones en este tema.');
}
if (search) {
  search.addEventListener('input', updateLibrary);
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      selectedFilter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateLibrary();
    });
  });
}

