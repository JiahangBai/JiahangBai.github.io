const likeControl = document.querySelector('.site-like');

if (likeControl) {
  const counterUrl = 'https://tick.rs/c/7ibf4S76BssZ';
  const storageKey = 'jiahangbai-homepage-liked';
  const button = likeControl.querySelector('.like-button');
  const label = likeControl.querySelector('.like-label');
  const heart = likeControl.querySelector('.like-heart');
  const count = likeControl.querySelector('.like-count');
  const status = likeControl.querySelector('.like-status');
  const formatCount = new Intl.NumberFormat(document.documentElement.lang);
  let liked = savedLike();
  let pending = false;
  let total = 0;

  function savedLike() {
    try {
      return localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  }

  function render() {
    likeControl.dataset.liked = String(liked);
    button.setAttribute('aria-disabled', String(pending || liked));
    if (liked) {
      heart.textContent = '♥';
      label.textContent = likeControl.dataset.likedLabel;
    }
  }

  function counterRequest(options = {}) {
    return fetch(counterUrl, {
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout?.(8000),
      ...options,
    });
  }

  async function refreshCount() {
    try {
      const response = await counterRequest();
      if (!response.ok) return;
      const value = Number((await response.text()).trim());
      if (!Number.isSafeInteger(value) || value <= 0) return;
      total = Math.max(total, value);
      count.textContent = formatCount.format(total);
      count.hidden = false;
    } catch {
      // Keep the button usable if the count cannot be loaded.
    }
  }

  async function recordLike() {
    if (!liked && !savedLike()) {
      // Tick.rs acknowledges an increment with a redirect. Read the total separately.
      const response = await counterRequest({method: 'POST', redirect: 'manual'});
      if (!response.ok && response.type !== 'opaqueredirect') throw new Error('Like failed');
      try {
        localStorage.setItem(storageKey, '1');
      } catch {
        // The current page still remembers the confirmed like.
      }
    }
    liked = true;
    refreshCount();
  }

  button.addEventListener('click', async () => {
    if (pending || liked) return;
    pending = true;
    status.textContent = '';
    render();
    try {
      if (navigator.locks) await navigator.locks.request(storageKey, recordLike);
      else await recordLike();
    } catch {
      status.textContent = likeControl.dataset.errorLabel;
    } finally {
      pending = false;
      render();
    }
  });

  window.addEventListener('storage', event => {
    if (event.key !== storageKey || event.newValue !== '1') return;
    liked = true;
    status.textContent = '';
    render();
    refreshCount();
  });

  render();
  likeControl.hidden = false;
  refreshCount();
}
