(() => {
  const key = 'homepage-theme';
  const root = document.documentElement;
  try {
    if (localStorage.getItem(key) === 'dark') root.dataset.theme = 'dark';
  } catch {}
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.theme-switch');
    function render() {
      const dark = root.dataset.theme === 'dark';
      button.textContent = dark ? button.dataset.light : button.dataset.dark;
      button.hidden = false;
    }
    button.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, root.dataset.theme); } catch {}
      render();
    });
    render();
  });
})();
