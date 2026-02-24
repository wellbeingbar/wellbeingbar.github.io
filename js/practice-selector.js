/**
 * practice-selector.js - Searchable practice dropdown for nav
 */
const PracticeSelector = (() => {
  let _panel = null;
  let _btn = null;
  let _searchInput = null;
  let _list = null;

  function init() {
    const container = document.getElementById('practice-selector');
    if (!container) return;

    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'practice-selector-wrap';

    _btn = document.createElement('button');
    _btn.className = 'practice-selector-btn';
    _btn.textContent = I18n.t('nav.practice_search');
    _btn.type = 'button';

    _panel = document.createElement('div');
    _panel.className = 'practice-selector-panel';

    _searchInput = document.createElement('input');
    _searchInput.className = 'practice-selector-search';
    _searchInput.type = 'text';
    _searchInput.setAttribute('data-i18n-placeholder', 'nav.practice_search');
    _searchInput.placeholder = I18n.t('nav.practice_search');

    _list = document.createElement('div');
    _list.className = 'practice-selector-list';

    _panel.appendChild(_searchInput);
    _panel.appendChild(_list);
    wrap.appendChild(_btn);
    wrap.appendChild(_panel);
    container.appendChild(wrap);

    _btn.addEventListener('click', _toggle);
    _searchInput.addEventListener('input', _filter);
    document.addEventListener('click', _outsideClick);
    document.addEventListener('keydown', _onKey);
    document.addEventListener('wb-lang-change', _rebuild);

    _renderList();
  }

  function _toggle(e) {
    e.stopPropagation();
    const isOpen = _panel.classList.contains('open');
    if (isOpen) {
      _close();
    } else {
      _panel.classList.add('open');
      _searchInput.value = '';
      _renderList();
      _searchInput.focus();
    }
  }

  function _close() {
    if (_panel) _panel.classList.remove('open');
  }

  function _outsideClick(e) {
    if (_panel && !_panel.contains(e.target) && e.target !== _btn) {
      _close();
    }
  }

  function _onKey(e) {
    if (e.key === 'Escape') _close();
  }

  function _filter() {
    const q = _searchInput.value.toLowerCase();
    const items = _list.querySelectorAll('a');
    items.forEach(a => {
      const name = a.getAttribute('data-name').toLowerCase();
      a.style.display = name.includes(q) ? '' : 'none';
    });
  }

  function _renderList() {
    if (!_list) return;
    const practices = Data.getAllPractices();
    const lang = I18n.getLang();

    const sorted = practices.map(p => ({
      id: p.id,
      name: I18n.getPracticeName(p),
      cat: p.category,
      emoji: p.emoji || ''
    })).sort((a, b) => a.name.localeCompare(b.name, lang));

    _list.innerHTML = sorted.map(p =>
      `<a href="practice-detail.html?id=${p.id}" data-name="${p.name}">
        <span>${p.emoji} ${p.name}</span>
        <span class="practice-cat-badge">${I18n.t('cat.' + p.cat.replace(/-/g, '_'))}</span>
      </a>`
    ).join('');
  }

  function _rebuild() {
    if (_btn) _btn.textContent = I18n.t('nav.practice_search');
    if (_searchInput) _searchInput.placeholder = I18n.t('nav.practice_search');
    _renderList();
  }

  return { init };
})();
