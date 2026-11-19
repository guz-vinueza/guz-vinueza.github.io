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
