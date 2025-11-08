// src/js/previews.js
function ensureModal() {
  let modal = document.getElementById('modal');
  if (modal) return modal;
  modal = document.createElement('div');
  modal.id = 'modal';
  modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999';
  modal.innerHTML = `
    <div class="box" style="max-width:900px;margin:5vh auto;background:#111;border-radius:12px;overflow:hidden">
      <div class="top" style="display:flex;justify-content:flex-end;padding:.5rem">
        <button id="modal-close" style="background:#222;border:0;color:#fff;padding:.25rem .6rem;border-radius:8px;cursor:pointer">✕</button>
      </div>
      <div id="modal-body" style="padding:0 1rem 1rem;color:#ddd;line-height:1.6;max-height:78vh;overflow:auto"></div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('#modal-close').addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    modal.querySelector('#modal-body').innerHTML = '';
  });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.querySelector('#modal-close').click(); });
  return modal;
}

function stripTags(html) {
  const el = document.createElement('div');
  el.innerHTML = html || '';
  return el.textContent || el.innerText || '';
}

(async () => {
  const feed = document.getElementById('feed');
  const modal = ensureModal();
  const body = modal.querySelector('#modal-body');

  try {
    const r = await fetch('/api/ingest');
    const { items = [] } = await r.json();

    feed.innerHTML = items.map((it, i) => `
      <article class="card" data-idx="${i}">
        <h3>${it.title || 'No title'}</h3>
        <p>${stripTags(it.preview || '').slice(0, 200)}…</p>
        <button class="open" data-idx="${i}">Read</button>
      </article>
    `).join('');

    feed.addEventListener('click', (e) => {
      const btn = e.target.closest('button.open');
      if (!btn) return;
      const it = items[+btn.dataset.idx];
      body.innerHTML = `
        <h2 style="margin:0 0 .5rem 0">${it.title || ''}</h2>
        <div>${it.preview || ''}</div>
        <p style="margin-top:1rem"><a href="${it.link || '#'}" target="_blank" rel="noopener">Original ↗</a></p>
      `;
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    });
  } catch (err) {
    feed.innerHTML = `<p style="color:#f66">Failed to load feed (${err})</p>`;
  }
})();
