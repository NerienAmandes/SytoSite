/* ============================================================
 * Админ-панель «Сыто»
 * Общается с PHP API: /api/auth.php, /api/products.php,
 * /api/categories.php, /api/upload.php
 * ============================================================ */

/* ---------- Базовый путь к API ---------- */
const API_BASE = (() => {
  const path = window.location.pathname;
  const idx = path.indexOf('/admin');
  const base = idx >= 0 ? path.substring(0, idx) : path.replace(/\/+$/, '');
  return base + '/api/';
})();

/* ---------- Состояние ---------- */
const state = {
  admin: null,
  products: [],
  categories: [],
};

/* ============================================================
 *  Утилиты
 * ============================================================ */
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return [...root.querySelectorAll(sel)]; }

async function api(method, endpoint, body = null) {
  const opts = {
    method,
    credentials: 'same-origin',
    headers: {},
  };
  if (body instanceof FormData) {
    opts.body = body;
  } else if (body !== null) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(API_BASE + endpoint, opts);
  let data = null;
  try { data = await res.json(); } catch (e) { data = { ok: false, error: 'Сервер не вернул JSON' }; }
  if (!res.ok || (data && data.ok === false)) {
    throw new Error((data && data.error) || `Ошибка ${res.status}`);
  }
  return data;
}

let toastTimer = null;
function showToast(msg, type = 'success') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s ?? '';
  return div.innerHTML;
}

function formatPrice(n) {
  if (n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString('ru-RU') + ' ₽';
}

function minPrice(product) {
  const prices = (product.variants || []).map(v => Number(v.price)).filter(n => isFinite(n));
  return prices.length ? Math.min(...prices) : null;
}

/* ============================================================
 *  Авторизация
 * ============================================================ */
async function checkAuth() {
  try {
    const data = await api('GET', 'auth.php');
    if (data.is_admin) {
      state.admin = { username: data.username || 'admin' };
      showApp();
    } else {
      showLogin();
    }
  } catch (e) {
    showLogin();
  }
}

function showLogin() {
  $('#login-screen').classList.remove('hidden');
  $('#app').classList.add('hidden');
}

function showApp() {
  $('#login-screen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  $('#admin-user').textContent = state.admin?.username || '';
  loadAll();
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = $('#login-username').value.trim();
  const password = $('#login-password').value;
  const err = $('#login-error');
  err.textContent = '';
  try {
    const data = await api('POST', 'auth.php', { action: 'login', username, password });
    state.admin = { username: data.username || username };
    showApp();
  } catch (e) {
    err.textContent = e.message;
  }
});

$('#logout-btn').addEventListener('click', async () => {
  try { await api('POST', 'auth.php', { action: 'logout' }); } catch (e) {}
  state.admin = null;
  showLogin();
  $('#login-form').reset();
});

/* ============================================================
 *  Переключение разделов
 * ============================================================ */
$$('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    $$('.view').forEach(v => v.classList.add('hidden'));
    $('#view-' + view).classList.remove('hidden');
  });
});

/* ============================================================
 *  Загрузка всех данных
 * ============================================================ */
async function loadAll() {
  await Promise.all([loadCategories(), loadProducts()]);
  renderProducts();
  renderCategories();
}

/* ============================================================
 *  КАТЕГОРИИ
 * ============================================================ */
async function loadCategories() {
  try {
    const data = await api('GET', 'categories.php');
    state.categories = data.categories || [];
  } catch (e) {
    showToast('Не удалось загрузить категории: ' + e.message, 'error');
    state.categories = [];
  }
}

function renderCategories() {
  const tbody = $('#categories-tbody');
  tbody.innerHTML = '';
  if (!state.categories.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:24px;">Категорий нет</td></tr>';
    return;
  }
  for (const c of state.categories) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.image ? `<img src="${escapeHtml(c.image)}" class="row-thumb" alt="">` : '<div class="row-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:10px;">—</div>'}</td>
      <td><strong>${escapeHtml(c.title)}</strong></td>
      <td><code>${escapeHtml(c.slug)}</code></td>
      <td class="row-actions">
        <button class="btn btn-ghost btn-sm" data-action="edit-cat" data-id="${c.id}">Изменить</button>
        <button class="btn btn-danger btn-sm" data-action="del-cat" data-id="${c.id}">Удалить</button>
      </td>`;
    tbody.appendChild(tr);
  }
}

$('#add-category-btn').addEventListener('click', () => openCategoryModal(null));

tbodyEvent('categories-tbody', 'edit-cat', (id) => {
  const cat = state.categories.find(c => c.id === id);
  if (cat) openCategoryModal(cat);
});

tbodyEvent('categories-tbody', 'del-cat', (id) => {
  if (confirm('Удалить категорию? Товары останутся, но потеряют привязку.')) {
    api('DELETE', 'categories.php?id=' + id)
      .then(() => { showToast('Категория удалена'); loadCategories().then(renderCategories); })
      .catch(e => showToast(e.message, 'error'));
  }
});

/* ----- Модалка категории ----- */
function openCategoryModal(cat) {
  $('#c-id').value = cat ? cat.id : '';
  $('#c-title').value = cat ? cat.title : '';
  $('#c-slug').value = cat ? cat.slug : '';
  $('#c-short').value = cat ? (cat.shortDescription || '') : '';
  $('#c-image').value = cat ? (cat.image || '') : '';
  setImagePreview('#c-image-preview', cat ? cat.image : '');
  $('#category-modal-title').textContent = cat ? 'Редактировать категорию' : 'Новая категория';
  openModal('category-modal');
}

$('#category-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#c-id').value;
  const payload = {
    title: $('#c-title').value.trim(),
    slug: $('#c-slug').value.trim(),
    shortDescription: $('#c-short').value.trim(),
    image: $('#c-image').value.trim(),
  };
  try {
    if (id) {
      await api('PUT', 'categories.php?id=' + id, payload);
      showToast('Категория обновлена');
    } else {
      await api('POST', 'categories.php', payload);
      showToast('Категория создана');
    }
    closeModal('category-modal');
    await loadCategories();
    renderCategories();
    /* обновить выпадающий список категорий в форме товара */
    fillCategorySelect();
  } catch (e) {
    showToast(e.message, 'error');
  }
});

/* Загрузка картинки категории */
$('#c-image-upload').addEventListener('change', (e) => {
  uploadImage(e.target.files[0], '#c-image', '#c-image-preview');
  e.target.value = '';
});

/* ============================================================
 *  ТОВАРЫ
 * ============================================================ */
async function loadProducts() {
  try {
    const data = await api('GET', 'products.php');
    state.products = data.products || [];
  } catch (e) {
    showToast('Не удалось загрузить товары: ' + e.message, 'error');
    state.products = [];
  }
}

function categoryTitle(slug) {
  const c = state.categories.find(c => c.slug === slug);
  return c ? c.title : '—';
}

function renderProducts() {
  const tbody = $('#products-tbody');
  tbody.innerHTML = '';
  if (!state.products.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px;">Товаров нет</td></tr>';
    return;
  }
  for (const p of state.products) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.image ? `<img src="${escapeHtml(p.image)}" class="row-thumb" alt="">` : '<div class="row-thumb" style="display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:10px;">—</div>'}</td>
      <td>
        <strong>${escapeHtml(p.title)}</strong>
        <div style="color:var(--muted);font-size:12px;">${escapeHtml(p.slug)}</div>
      </td>
      <td>${escapeHtml(categoryTitle(p.category))}</td>
      <td>${formatPrice(minPrice(p))}</td>
      <td>${p.available ? '<span style="color:var(--success)">Да</span>' : '<span style="color:var(--danger)">Нет</span>'}</td>
      <td class="row-actions">
        <button class="btn btn-ghost btn-sm" data-action="edit-prod" data-id="${p.id}">Изменить</button>
        <button class="btn btn-danger btn-sm" data-action="del-prod" data-id="${p.id}">Удалить</button>
      </td>`;
    tbody.appendChild(tr);
  }
}

$('#add-product-btn').addEventListener('click', () => openProductModal(null));

tbodyEvent('products-tbody', 'edit-prod', (id) => {
  const p = state.products.find(x => x.id === id);
  if (p) openProductModal(p);
});

tbodyEvent('products-tbody', 'del-prod', (id) => {
  if (confirm('Удалить товар? Это действие необратимо.')) {
    api('DELETE', 'products.php?id=' + id)
      .then(() => { showToast('Товар удалён'); loadProducts().then(renderProducts); })
      .catch(e => showToast(e.message, 'error'));
  }
});

/* ----- Заполнить select категорий ----- */
function fillCategorySelect() {
  const sel = $('#p-category');
  sel.innerHTML = '<option value="">— Без категории —</option>' +
    state.categories.map(c => `<option value="${escapeHtml(c.slug)}">${escapeHtml(c.title)}</option>`).join('');
}

/* ----- Модалка товара ----- */
function openProductModal(product) {
  fillCategorySelect();
  $('#p-id').value = product ? product.id : '';
  $('#p-title').value = product ? product.title : '';
  $('#p-slug').value = product ? product.slug : '';
  $('#p-category').value = product ? (product.category || '') : '';
  $('#p-pricePer').value = product ? (product.pricePer || '') : '';
  $('#p-short').value = product ? (product.shortDescription || '') : '';
  $('#p-desc').value = product ? (product.description || '') : '';
  $('#p-image').value = product ? (product.image || '') : '';
  setImagePreview('#p-image-preview', product ? product.image : '');
  $('#p-tags').value = product ? (product.tags || []).join(', ') : '';
  $('#p-available').checked = product ? !!product.available : true;
  $('#p-featured').checked = product ? !!product.featured : false;

  /* Варианты */
  const variantsBox = $('#p-variants');
  variantsBox.innerHTML = '';
  const variants = product && product.variants && product.variants.length
    ? product.variants
    : [{ label: '', price: '', image: '' }];
  for (const v of variants) addVariantRow(v);

  $('#product-modal-title').textContent = product ? 'Редактировать товар' : 'Новый товар';
  openModal('product-modal');
}

function addVariantRow(v = { label: '', price: '', image: '' }) {
  const box = $('#p-variants');
  const row = document.createElement('div');
  row.className = 'variant-row';
  row.innerHTML = `
    <input type="text" class="v-label" placeholder="Фасовка (напр. 0,5 л)" value="${escapeHtml(v.label || '')}" />
    <input type="number" class="v-price" placeholder="Цена" value="${v.price ?? ''}" step="0.01" min="0" />
    <button type="button" class="variant-del" title="Удалить">×</button>`;
  row.querySelector('.variant-del').addEventListener('click', () => row.remove());
  box.appendChild(row);
}

$('#add-variant-btn').addEventListener('click', () => addVariantRow());

/* Загрузка картинки товара */
$('#p-image-upload').addEventListener('change', (e) => {
  uploadImage(e.target.files[0], '#p-image', '#p-image-preview');
  e.target.value = '';
});

/* Сохранение товара */
$('#product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#p-id').value;

  const variants = $$('#p-variants .variant-row').map(row => ({
    label: row.querySelector('.v-label').value.trim(),
    price: parseFloat(row.querySelector('.v-price').value) || 0,
  })).filter(v => v.label !== '');

  const payload = {
    title: $('#p-title').value.trim(),
    slug: $('#p-slug').value.trim(),
    category: $('#p-category').value,
    pricePer: $('#p-pricePer').value.trim(),
    shortDescription: $('#p-short').value.trim(),
    description: $('#p-desc').value,
    image: $('#p-image').value.trim(),
    tags: $('#p-tags').value.split(',').map(t => t.trim()).filter(Boolean),
    available: $('#p-available').checked,
    featured: $('#p-featured').checked,
    variants,
  };

  try {
    if (id) {
      await api('PUT', 'products.php?id=' + id, payload);
      showToast('Товар обновлён');
    } else {
      await api('POST', 'products.php', payload);
      showToast('Товар создан');
    }
    closeModal('product-modal');
    await loadProducts();
    renderProducts();
  } catch (e) {
    showToast(e.message, 'error');
  }
});

/* ============================================================
 *  ЗАГРУЗКА ИЗОБРАЖЕНИЙ
 * ============================================================ */
async function uploadImage(file, inputSel, previewSel) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Можно загружать только изображения', 'error');
    return;
  }
  const fd = new FormData();
  fd.append('file', file);
  try {
    showToast('Загрузка…');
    const data = await api('POST', 'upload.php', fd);
    $(inputSel).value = data.url;
    setImagePreview(previewSel, data.url);
    showToast('Изображение загружено');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

function setImagePreview(sel, url) {
  const el = $(sel);
  if (url) {
    el.innerHTML = `<img src="${escapeHtml(url)}" alt="">`;
  } else {
    el.innerHTML = '<span class="empty">нет фото</span>';
  }
}

/* ============================================================
 *  МОДАЛКИ
 * ============================================================ */
function openModal(id) { $('#' + id).classList.remove('hidden'); }
function closeModal(id) { $('#' + id).classList.add('hidden'); }

$$('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

$$('.modal').forEach(m => {
  m.addEventListener('click', (e) => {
    if (e.target === m) m.classList.add('hidden');
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $$('.modal:not(.hidden)').forEach(m => m.classList.add('hidden'));
  }
});

/* ============================================================
 *  Помощник: делегирование кликов по tbody
 * ============================================================ */
function tbodyEvent(tbodyId, action, handler) {
  $('#' + tbodyId).addEventListener('click', (e) => {
    const btn = e.target.closest(`button[data-action="${action}"]`);
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    handler(id);
  });
}

/* ============================================================
 *  Старт
 * ============================================================ */
checkAuth();
