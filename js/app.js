(function () {
  const storage = window.SkillSwapStorage;
  const data = window.SkillSwapData;
  const matching = window.SkillSwapMatching;
  const initial = storage.loadData(data);
  const state = {
    offers: initial.offers,
    favorites: initial.favorites,
    profile: initial.profile || Object.assign({}, data.defaultProfile),
    settings: initial.settings || { activeView: 'home', activeMood: null, filters: {} },
    view: initial.settings && initial.settings.activeView ? initial.settings.activeView : 'home',
    filters: initial.settings && initial.settings.filters ? initial.settings.filters : {},
    createdNotice: false,
    activeMood: initial.settings && initial.settings.activeMood ? initial.settings.activeMood : null,
    detailOfferId: null
  };
  const root = document.getElementById('view-root');
  const modal = document.getElementById('app-modal');
  const modalContent = document.getElementById('modal-content');
  const nav = document.getElementById('primary-nav');
  const mobileMenu = document.querySelector('.mobile-menu-button');

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function initials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toLocaleUpperCase('ru');
  }

  function avatar(name, color, size) {
    return '<span class="avatar ' + (size || '') + '" style="--avatar-bg:' + escapeHTML(color || '#7886ed') + '" aria-hidden="true">' + escapeHTML(initials(name)) + '</span>';
  }

  function saveSettings() {
    state.settings = Object.assign({}, state.settings, { activeView: state.view, activeMood: state.activeMood, filters: state.filters });
    if (!storage.saveSettings(state.settings)) showToast('Не удалось сохранить настройки в этом браузере.', 'error');
  }

  function persistOffers() { if (!storage.saveOffers(state.offers)) showToast('Не удалось сохранить предложение. Проверьте настройки браузера.', 'error'); }
  function persistFavorites() { if (!storage.saveFavorites(state.favorites)) showToast('Не удалось сохранить избранное.', 'error'); }
  function persistProfile() { if (!storage.saveProfile(state.profile)) showToast('Не удалось сохранить профиль.', 'error'); }

  function showToast(message, kind) {
    const region = document.getElementById('toast-region');
    const toast = document.createElement('div');
    toast.className = 'toast ' + (kind || '');
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(function () { toast.remove(); }, 3300);
  }

  function updateNavigation() {
    document.querySelectorAll('[data-route]').forEach(function (link) {
      link.classList.toggle('active', link.dataset.route === state.view);
    });
    document.getElementById('favorite-count').textContent = String(state.favorites.length);
    document.getElementById('nav-avatar').textContent = initials(state.profile.name);
    document.getElementById('nav-avatar').style.setProperty('--avatar-bg', state.profile.color || '#6575e8');
    const exactCount = matching.findMatches(state.profile, state.offers).filter(function (offer) { return offer.match.type === 'exact'; }).length;
    document.querySelector('.nav-match-dot').style.background = exactCount ? '#9bd557' : '#d2d4dd';
  }

  function goTo(view, options) {
    const validViews = ['home', 'explore', 'create', 'matches', 'favorites', 'profile'];
    state.view = validViews.includes(view) ? view : 'home';
    if (!options || !options.keepMood) state.activeMood = null;
    state.createdNotice = Boolean(options && options.created);
    saveSettings();
    nav.classList.remove('is-open');
    mobileMenu.setAttribute('aria-expanded', 'false');
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function button(label, action, style) {
    return '<button class="button ' + (style || 'button-primary') + '" type="button" data-action="' + action + '">' + label + '</button>';
  }

  function renderHome() {
    const featured = state.offers.filter(function (offer) { return offer.ownerId !== 'self'; }).slice(0, 3);
    return '<div class="page-shell">' +
      '<section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">Обмен навыками без барьеров</p><h1 id="hero-title">Обменивайся знаниями. <span>Получай новые навыки.</span></h1><p>Ты умеешь чему-то — кто-то хочет этому научиться. Найди своего человека и растите вместе.</p><div class="hero-actions"><button class="button button-primary" type="button" data-route="explore">Найти навык <span aria-hidden="true">→</span></button><button class="button button-secondary" type="button" data-route="create">Предложить навык <span aria-hidden="true">↗</span></button></div><div class="social-proof"><span class="avatar-stack">' +
      state.offers.slice(0, 4).map(function (offer) { return avatar(offer.userName, offer.color, 'avatar-small'); }).join('') +
      '</span><span><strong>' + state.offers.filter(function (offer) { return offer.ownerId !== 'self'; }).length + '+</strong> людей уже делятся знаниями</span></div></div>' +
      '<div class="hero-visual" aria-label="Пример взаимного обмена"><div class="orbit-card orbit-card-back"><div class="orbit-top">' + avatar('Данияр', '#6d82dc', 'avatar-small') + '<div><p class="person-name">Данияр</p><p class="person-meta">Разговорный английский</p></div></div><div class="swap-skill"><span>Хочет научиться</span><strong>Photoshop</strong></div></div><div class="orbit-card orbit-card-front"><div class="orbit-top">' + avatar(state.profile.name, state.profile.color) + '<div><p class="person-name">' + escapeHTML(state.profile.name) + '</p><p class="person-meta">Ваш будущий партнёр</p></div></div><div class="swap-line"><div class="swap-skill"><span>Могу научить</span><strong>' + escapeHTML((state.profile.teachSkills || ['Ваш навык'])[0]) + '</strong></div><span class="swap-arrow" aria-hidden="true">⇄</span><div class="swap-skill"><span>Хочу изучить</span><strong>' + escapeHTML((state.profile.learnSkills || ['Новый навык'])[0]) + '</strong></div></div></div><div class="match-stamp"><span aria-hidden="true">✳</span> Обмен найден</div></div></section>' +
      '<section class="section-block" aria-labelledby="mood-title"><div class="section-heading"><div><p class="eyebrow">Начни с настроения</p><h2 id="mood-title">Что хочешь сегодня?</h2></div><span class="results-count">Выбери направление</span></div><div class="mood-grid">' + data.moods.map(function (mood, index) { return '<button type="button" class="mood-card" data-mood="' + mood.id + '" style="--mood-bg:' + ['#f2edff', '#e9efff', '#e7f5f2', '#fff3e4', '#ffedf0', '#e9f5df'][index] + '"><span class="mood-emoji" aria-hidden="true">' + mood.emoji + '</span><strong>' + escapeHTML(mood.title) + '</strong><span class="card-hint">' + escapeHTML(mood.hint) + '</span></button>'; }).join('') + '</div></section>' +
      '<section class="section-block"><div class="section-heading"><div><p class="eyebrow">То, что ищут чаще</p><h2>Популярные навыки</h2></div><button class="text-link" type="button" data-route="explore">Весь каталог <span aria-hidden="true">→</span></button></div><div class="popular-list">' + ['Английский', 'Дизайн интерфейсов', 'Python', 'Фотография', 'Figma', 'Гитара', 'Видеомонтаж'].map(function (skill) { return '<button type="button" class="popular-chip" data-search-skill="' + escapeHTML(skill) + '">' + escapeHTML(skill) + '</button>'; }).join('') + '</div></section>' +
      '<section class="section-block"><div class="section-heading"><div><p class="eyebrow">Встречайте друг друга</p><h2>Свежие предложения</h2></div><button class="text-link" type="button" data-route="explore">Смотреть все <span aria-hidden="true">→</span></button></div><div class="card-grid">' + featured.map(renderSkillCard).join('') + '</div></section>' +
      '<section class="section-block"><div class="section-heading"><div><p class="eyebrow">Просто и по-человечески</p><h2>Как работает обмен</h2></div></div><div class="steps-strip"><article class="step-item"><span class="step-number">01</span><h3>Расскажи о себе</h3><p>Укажи, чему можешь научить и какой навык хочешь освоить.</p></article><article class="step-item"><span class="step-number">02</span><h3>Найди совпадение</h3><p>Мы сопоставим твои интересы с предложениями сообщества.</p></article><article class="step-item"><span class="step-number">03</span><h3>Обменивайтесь</h3><p>Договоритесь о формате и учитесь друг у друга в своём ритме.</p></article></div></section>' +
      '</div>';
  }

  function renderSkillCard(offer, match) {
    const isFavorite = state.favorites.includes(offer.id);
    const matchBadge = match ? '<span class="match-badge ' + match.type + '">' + (match.type === 'exact' ? '🔥 ' : match.type === 'good' ? '✨ ' : '') + escapeHTML(match.label) + '</span>' : '';
    return '<article class="skill-card"><div class="skill-card-top">' + avatar(offer.userName, offer.color) + '<div class="card-user"><p class="person-name">' + escapeHTML(offer.userName) + '</p><p class="card-region">' + escapeHTML(offer.city || 'Сообщество SkillSwap') + '</p></div>' + matchBadge + '<button class="favorite-button ' + (isFavorite ? 'is-favorite' : '') + '" type="button" data-action="favorite" data-id="' + escapeHTML(offer.id) + '" aria-label="' + (isFavorite ? 'Убрать из избранного' : 'Добавить в избранное') + '" aria-pressed="' + isFavorite + '">' + (isFavorite ? '♥' : '♡') + '</button></div><div class="card-skill-pair"><div class="card-skill"><small>Могу научить</small><strong>' + escapeHTML(offer.teach) + '</strong></div><div class="card-skill learn"><small>Хочу научиться</small><strong>' + escapeHTML(offer.learn) + '</strong></div></div><div class="card-meta"><span class="meta-tag">' + escapeHTML(offer.category) + '</span><span class="meta-tag">' + escapeHTML(offer.level) + '</span><span class="meta-tag">' + escapeHTML(offer.format) + '</span></div><p class="card-description">' + escapeHTML(offer.description) + '</p><div class="card-actions"><button class="button button-quiet" type="button" data-action="details" data-id="' + escapeHTML(offer.id) + '">Подробнее <span aria-hidden="true">↗</span></button><span class="card-hint">' + escapeHTML(offer.availability || 'Время по договорённости') + '</span></div></article>';
  }

  function renderEmpty(icon, title, message, actionLabel, action) {
    return '<div class="empty-state"><span class="empty-icon" aria-hidden="true">' + icon + '</span><h2>' + escapeHTML(title) + '</h2><p>' + escapeHTML(message) + '</p>' + (actionLabel ? '<button class="button button-primary" type="button" data-route="' + action + '">' + escapeHTML(actionLabel) + '</button>' : '') + '</div>';
  }

  function renderExplore() {
    const filters = state.filters;
    const categories = Array.from(new Set(state.offers.map(function (offer) { return offer.category; }))).sort(function (a, b) { return a.localeCompare(b, 'ru'); });
    let offers = state.offers.filter(function (offer) { return offer.ownerId !== 'self'; });
    if (filters.query) {
      const query = filters.query.toLocaleLowerCase('ru');
      offers = offers.filter(function (offer) { return [offer.userName, offer.teach, offer.learn, offer.category, offer.description, offer.city].join(' ').toLocaleLowerCase('ru').includes(query); });
    }
    if (filters.category) offers = offers.filter(function (offer) { return offer.category === filters.category; });
    if (filters.level) offers = offers.filter(function (offer) { return offer.level === filters.level; });
    if (filters.format) offers = offers.filter(function (offer) { return offer.format === filters.format; });
    if (state.activeMood) {
      const mood = data.moods.find(function (item) { return item.id === state.activeMood; });
      if (mood) offers = offers.filter(function (offer) { return mood.categories.includes(offer.category); });
    }
    if (filters.sort === 'name') offers.sort(function (a, b) { return a.userName.localeCompare(b.userName, 'ru'); });
    else if (filters.sort === 'skill') offers.sort(function (a, b) { return a.teach.localeCompare(b.teach, 'ru'); });
    else offers.sort(function (a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });
    return '<div class="page-shell"><div class="page-title-row"><div><p class="eyebrow">Каталог сообщества</p><h1>Найти навык</h1><p>Выбери человека, с которым хочется обменяться знаниями.</p></div><span class="results-count">Найдено: ' + offers.length + '</span></div>' +
      '<div class="filter-panel"><label class="search-wrap"><span class="search-icon" aria-hidden="true">⌕</span><input class="field-control" type="search" name="search" value="' + escapeHTML(filters.query || '') + '" placeholder="Навык, имя или тема" aria-label="Поиск по предложениям" data-filter="query"></label><select class="field-control" aria-label="Категория" data-filter="category"><option value="">Все категории</option>' + categories.map(function (category) { return '<option value="' + escapeHTML(category) + '" ' + (filters.category === category ? 'selected' : '') + '>' + escapeHTML(category) + '</option>'; }).join('') + '</select><select class="field-control" aria-label="Уровень" data-filter="level"><option value="">Любой уровень</option>' + ['Начинающий', 'Средний', 'Продвинутый'].map(function (level) { return '<option ' + (filters.level === level ? 'selected' : '') + '>' + level + '</option>'; }).join('') + '</select><select class="field-control" aria-label="Формат обучения" data-filter="format"><option value="">Любой формат</option>' + ['Онлайн', 'Очно', 'Гибрид'].map(function (format) { return '<option ' + (filters.format === format ? 'selected' : '') + '>' + format + '</option>'; }).join('') + '</select><select class="field-control" aria-label="Сортировка" data-filter="sort"><option value="recent" ' + (!filters.sort || filters.sort === 'recent' ? 'selected' : '') + '>Сначала новые</option><option value="name" ' + (filters.sort === 'name' ? 'selected' : '') + '>По имени</option><option value="skill" ' + (filters.sort === 'skill' ? 'selected' : '') + '>По навыку</option></select></div>' +
      (state.activeMood ? '<div class="mood-filter-note"><span>Подборка: <strong>' + escapeHTML((data.moods.find(function (mood) { return mood.id === state.activeMood; }) || {}).title || '') + '</strong></span><button type="button" data-action="clear-mood">Сбросить подборку ×</button></div>' : '') +
      (offers.length ? '<div class="card-grid">' + offers.map(renderSkillCard).join('') + '</div>' : renderEmpty('⌕', state.offers.length ? 'Ничего не нашлось' : 'Каталог пока пуст', state.offers.length ? 'Попробуй изменить запрос или сбросить фильтры.' : 'Стань первым, кто поделится навыком с сообществом.', state.offers.length ? 'Сбросить фильтры' : 'Предложить навык', state.offers.length ? 'explore-reset' : 'create')) + '</div>';
  }

  function renderCreate() {
    const profile = state.profile;
    const notice = state.createdNotice ? '<div class="success-banner"><span aria-hidden="true">✓</span><strong>Предложение опубликовано и уже доступно в каталоге.</strong></div>' : '';
    return '<div class="page-shell"><div class="page-title-row"><div><p class="eyebrow">Поделись тем, что умеешь</p><h1>Предложить навык</h1><p>Расскажи о себе — подходящий человек найдётся быстрее.</p></div></div>' + notice + '<div class="form-layout"><form class="form-panel" id="offer-form" novalidate><div class="form-grid"><div class="form-field"><label for="offer-name">Как тебя зовут</label><input id="offer-name" name="name" maxlength="50" required value="' + escapeHTML(profile.name) + '" placeholder="Например, Алина"><span class="field-error" data-error="name"></span></div><div class="form-field"><label for="offer-city">Город</label><input id="offer-city" name="city" maxlength="50" value="' + escapeHTML(profile.city || '') + '" placeholder="Алматы"></div><div class="form-field"><label for="offer-teach">Могу научить</label><input id="offer-teach" name="teach" maxlength="60" required placeholder="Например, Figma"><span class="field-error" data-error="teach"></span></div><div class="form-field"><label for="offer-learn">Хочу научиться</label><input id="offer-learn" name="learn" maxlength="60" required placeholder="Например, английский"><span class="field-error" data-error="learn"></span></div><div class="form-field"><label for="offer-category">Категория</label><select id="offer-category" name="category" required><option value="">Выбери категорию</option>' + ['Дизайн', 'Карьера', 'Языки', 'Музыка', 'Фото и видео', 'Саморазвитие', 'Коммуникация', 'Хобби'].map(function (category) { return '<option>' + category + '</option>'; }).join('') + '</select><span class="field-error" data-error="category"></span></div><div class="form-field"><label for="offer-level">Твой уровень</label><select id="offer-level" name="level" required><option value="">Выбери уровень</option><option>Начинающий</option><option>Средний</option><option>Продвинутый</option></select><span class="field-error" data-error="level"></span></div><div class="form-field"><label for="offer-format">Формат обучения</label><select id="offer-format" name="format" required><option value="">Выбери формат</option><option>Онлайн</option><option>Очно</option><option>Гибрид</option></select><span class="field-error" data-error="format"></span></div><div class="form-field"><label for="offer-time">Когда удобно</label><input id="offer-time" name="availability" maxlength="80" placeholder="Например, вечера по будням"></div><div class="form-field full"><label for="offer-description">Немного о предложении</label><textarea id="offer-description" name="description" maxlength="500" required placeholder="Чему именно ты можешь научить и какой формат обмена тебе подходит?"></textarea><span class="form-hint">Не добавляй личные контакты — сначала найдите общие интересы.</span><span class="field-error" data-error="description"></span></div></div><div class="form-actions"><span class="form-hint">Поля со значениями навыка, категории и формата обязательны.</span><button class="button button-primary" type="submit">Опубликовать <span aria-hidden="true">→</span></button></div></form><aside class="side-note"><div class="side-note-art"><span class="note-orbit" aria-hidden="true">↗</span></div><h3>Обмен — это в обе стороны</h3><p>Лучшие знакомства начинаются с интереса друг к другу. Укажи, чему хочешь научиться, чтобы мы нашли взаимное совпадение.</p></aside></div></div>';
  }

  function renderMatches() {
    const ranked = matching.findMatches(state.profile, state.offers);
    const exact = ranked.filter(function (offer) { return offer.match.type === 'exact'; });
    const good = ranked.filter(function (offer) { return offer.match.type === 'good'; });
    const others = ranked.filter(function (offer) { return offer.match.type === 'regular'; });
    const sections = [
      { title: 'Точное совпадение', subtitle: 'Вы обмениваетесь именно тем, что ищете друг у друга.', items: exact, empty: 'Пока нет взаимного обмена. Обнови свои навыки в профиле или загляни позже.' },
      { title: 'Хорошо подходят', subtitle: 'Уже есть общая точка для начала разговора.', items: good, empty: '' },
      { title: 'Другие предложения', subtitle: 'Возможно, здесь найдётся новое направление.', items: others, empty: '' }
    ];
    return '<div class="page-shell"><div class="page-title-row"><div><p class="eyebrow">Подбор на основе твоих навыков</p><h1>Совпадения</h1><p>Никакой случайности: только то, чем ты хочешь обменяться.</p></div></div><div class="matches-intro"><div class="matches-intro-copy"><span class="match-flower" aria-hidden="true">✳</span><div><h2>' + (exact.length ? 'Нашли совпадение!' : 'Ищем твою пару навыков') + '</h2><p>' + (exact.length ? 'Есть взаимный интерес — можно начинать обмен.' : 'Заполни оба навыка в профиле, чтобы точнее настроить подбор.') + '</p></div></div><div class="match-legend"><span class="match-badge exact">🔥 точное</span><span class="match-badge good">✨ хорошее</span></div></div>' + sections.map(function (section, index) {
      if (index > 0 && !section.items.length) return '';
      return '<section class="matches-section"><div class="section-heading"><div><h2>' + section.title + '</h2><p>' + section.subtitle + '</p></div><span class="results-count">' + section.items.length + '</span></div>' + (section.items.length ? '<div class="card-grid">' + section.items.map(function (offer) { return renderSkillCard(offer, offer.match); }).join('') + '</div>' : (index === 0 ? renderEmpty('⇄', 'Пока без взаимных совпадений', section.empty + ' Твои навыки: ' + ((state.profile.teachSkills || []).join(', ') || 'не указаны') + ' → ' + ((state.profile.learnSkills || []).join(', ') || 'не указаны') + '.', 'Настроить профиль', 'profile') : '')) + '</section>';
    }).join('') + '</div>';
  }

  function renderFavorites() {
    const saved = state.offers.filter(function (offer) { return state.favorites.includes(offer.id); });
    return '<div class="page-shell"><div class="page-title-row"><div><p class="eyebrow">Твои заметки на потом</p><h1>Избранное</h1><p>Предложения, к которым хочется вернуться.</p></div><span class="results-count">' + saved.length + ' сохранено</span></div>' + (saved.length ? '<div class="card-grid">' + saved.map(renderSkillCard).join('') + '</div>' : renderEmpty('♡', 'Здесь пока пусто', 'Сохраняй интересные предложения, чтобы вернуться к ним позже.', 'Найти навык', 'explore')) + '</div>';
  }

  function renderProfile() {
    const ownOffers = state.offers.filter(function (offer) { return offer.ownerId === 'self'; });
    const exactCount = matching.findMatches(state.profile, state.offers).filter(function (offer) { return offer.match.type === 'exact'; }).length;
    const teachSkills = state.profile.teachSkills || [];
    const learnSkills = state.profile.learnSkills || [];
    return '<div class="page-shell"><div class="page-title-row"><div><p class="eyebrow">Твоя страница в сообществе</p><h1>Профиль</h1><p>Здесь собраны навыки и предложения для обмена.</p></div></div><section class="profile-hero">' + avatar(state.profile.name, state.profile.color, 'avatar-large') + '<div class="profile-main"><h2>' + escapeHTML(state.profile.name) + '</h2><p>' + escapeHTML(state.profile.city || 'Город не указан') + (state.profile.about ? ' · ' + escapeHTML(state.profile.about) : '') + '</p></div><button type="button" class="button button-secondary" data-action="edit-profile">Изменить профиль <span aria-hidden="true">↗</span></button></section><div class="profile-stats"><div class="stat-box"><strong>' + ownOffers.length + '</strong><span>Моих предложений</span></div><div class="stat-box"><strong>' + exactCount + '</strong><span>Точных совпадений</span></div><div class="stat-box"><strong>' + state.favorites.length + '</strong><span>В избранном</span></div></div><div class="profile-details"><section class="profile-skill-box"><h3>Могу поделиться</h3><div class="skill-pills">' + (teachSkills.length ? teachSkills.map(function (skill) { return '<span class="skill-pill">' + escapeHTML(skill) + '</span>'; }).join('') : '<span class="muted">Добавь навык в предложении</span>') + '</div></section><section class="profile-skill-box"><h3>Хочу научиться</h3><div class="skill-pills">' + (learnSkills.length ? learnSkills.map(function (skill) { return '<span class="skill-pill wants">' + escapeHTML(skill) + '</span>'; }).join('') : '<span class="muted">Добавь интерес в предложении</span>') + '</div></section></div><div class="section-heading profile-offers-title"><div><h2>Мои предложения</h2><p>Опубликованные предложения сообщества.</p></div><button class="button button-primary" type="button" data-route="create">+ Новое</button></div>' + (ownOffers.length ? '<div class="card-grid">' + ownOffers.map(renderSkillCard).join('') + '</div>' : renderEmpty('↗', 'Ты ещё не публиковал предложения', 'Расскажи, чему можешь научить, и найди подходящего партнёра.', 'Предложить навык', 'create')) + '</div>';
  }

  function render() {
    updateNavigation();
    const views = { home: renderHome, explore: renderExplore, create: renderCreate, matches: renderMatches, favorites: renderFavorites, profile: renderProfile };
    root.innerHTML = (views[state.view] || renderHome)();
    root.setAttribute('aria-busy', 'false');
  }

  function toggleFavorite(id) {
    if (state.favorites.includes(id)) {
      state.favorites = state.favorites.filter(function (favoriteId) { return favoriteId !== id; });
      showToast('Убрали из избранного.', 'success');
    } else {
      state.favorites = state.favorites.concat(id);
      showToast('Сохранили в избранное.', 'success');
    }
    persistFavorites();
    render();
  }

  function openDetails(id) {
    const offer = state.offers.find(function (item) { return item.id === id; });
    if (!offer) return;
    state.detailOfferId = id;
    const isFavorite = state.favorites.includes(id);
    modalContent.innerHTML = '<button class="modal-close" type="button" data-action="close-modal" aria-label="Закрыть">×</button><p class="eyebrow">Предложение сообщества</p><div class="detail-person">' + avatar(offer.userName, offer.color, 'avatar-large') + '<div><h2>' + escapeHTML(offer.userName) + '</h2><p class="person-meta">' + escapeHTML(offer.city || 'Сообщество SkillSwap') + '</p></div></div><div class="detail-pair"><div class="detail-skill"><small>Могу научить</small><strong>' + escapeHTML(offer.teach) + '</strong></div><div class="detail-skill learn"><small>Хочу научиться</small><strong>' + escapeHTML(offer.learn) + '</strong></div></div><p class="detail-description">' + escapeHTML(offer.description) + '</p><div class="detail-meta"><div><small>Категория</small><strong>' + escapeHTML(offer.category) + '</strong></div><div><small>Уровень</small><strong>' + escapeHTML(offer.level) + '</strong></div><div><small>Формат</small><strong>' + escapeHTML(offer.format) + '</strong></div><div><small>Доступное время</small><strong>' + escapeHTML(offer.availability || 'По договорённости') + '</strong></div></div><div class="modal-actions"><button class="button button-secondary" type="button" data-action="favorite" data-id="' + escapeHTML(id) + '">' + (isFavorite ? '♥ В избранном' : '♡ В избранное') + '</button><button class="button button-primary" type="button" data-action="create-from-match">Предложить обмен <span aria-hidden="true">→</span></button></div>';
    modal.showModal();
  }

  function openProfileEditor() {
    modalContent.innerHTML = '<button class="modal-close" type="button" data-action="close-modal" aria-label="Закрыть">×</button><p class="eyebrow">Профиль сообщества</p><h2>Расскажи о себе</h2><form id="profile-form" novalidate><div class="form-grid"><div class="form-field full"><label for="profile-name">Имя</label><input id="profile-name" name="name" required maxlength="50" value="' + escapeHTML(state.profile.name) + '"><span class="field-error" data-error="name"></span></div><div class="form-field full"><label for="profile-city">Город</label><input id="profile-city" name="city" maxlength="50" value="' + escapeHTML(state.profile.city || '') + '"></div><div class="form-field full"><label for="profile-about">О себе</label><textarea id="profile-about" name="about" maxlength="220">' + escapeHTML(state.profile.about || '') + '</textarea></div><div class="form-field full"><label for="profile-teach">Могу поделиться навыками</label><input id="profile-teach" name="teachSkills" maxlength="180" value="' + escapeHTML((state.profile.teachSkills || []).join(', ')) + '"><span class="form-hint">Перечисли через запятую.</span></div><div class="form-field full"><label for="profile-learn">Хочу научиться</label><input id="profile-learn" name="learnSkills" maxlength="180" value="' + escapeHTML((state.profile.learnSkills || []).join(', ')) + '"><span class="form-hint">По этим навыкам мы найдём взаимные совпадения.</span></div></div><div class="form-actions"><button class="button button-secondary" type="button" data-action="close-modal">Отмена</button><button class="button button-primary" type="submit">Сохранить профиль</button></div></form>';
    modal.showModal();
  }

  function formValue(form, name) { return String(new FormData(form).get(name) || '').trim(); }

  function showFieldError(form, name, message) {
    const field = form.elements.namedItem(name);
    const error = form.querySelector('[data-error="' + name + '"]');
    if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message || '';
  }

  function onOfferSubmit(form) {
    const required = ['name', 'teach', 'learn', 'category', 'level', 'format', 'description'];
    const values = {};
    let firstInvalid = null;
    required.forEach(function (name) {
      values[name] = formValue(form, name);
      const error = values[name] ? '' : 'Заполни это поле.';
      showFieldError(form, name, error);
      if (error && !firstInvalid) firstInvalid = form.elements.namedItem(name);
    });
    if (values.teach && values.learn && values.teach.toLocaleLowerCase('ru') === values.learn.toLocaleLowerCase('ru')) {
      showFieldError(form, 'learn', 'Выбери другой навык для обмена.');
      firstInvalid = firstInvalid || form.elements.namedItem('learn');
    }
    if (firstInvalid) { firstInvalid.focus(); return; }
    const city = formValue(form, 'city') || state.profile.city || '';
    const offer = {
      id: 'offer-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      ownerId: 'self', userName: values.name, city: city, teach: values.teach, learn: values.learn,
      category: values.category, level: values.level, format: values.format, description: values.description,
      availability: formValue(form, 'availability'), createdAt: new Date().toISOString(), color: state.profile.color || '#6575e8'
    };
    state.offers = [offer].concat(state.offers);
    state.profile = Object.assign({}, state.profile, {
      name: values.name, city: city,
      teachSkills: uniqueSkills((state.profile.teachSkills || []).concat(values.teach)),
      learnSkills: uniqueSkills((state.profile.learnSkills || []).concat(values.learn))
    });
    persistOffers();
    persistProfile();
    state.createdNotice = true;
    state.view = 'create';
    saveSettings();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Предложение опубликовано.', 'success');
  }

  function uniqueSkills(skills) {
    const seen = new Set();
    return skills.map(function (skill) { return String(skill).trim(); }).filter(function (skill) {
      const key = skill.toLocaleLowerCase('ru');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function onProfileSubmit(form) {
    const name = formValue(form, 'name');
    showFieldError(form, 'name', name ? '' : 'Имя обязательно.');
    if (!name) { form.elements.namedItem('name').focus(); return; }
    state.profile = Object.assign({}, state.profile, {
      name: name,
      city: formValue(form, 'city'),
      about: formValue(form, 'about'),
      teachSkills: uniqueSkills(formValue(form, 'teachSkills').split(',')),
      learnSkills: uniqueSkills(formValue(form, 'learnSkills').split(','))
    });
    persistProfile();
    modal.close();
    render();
    showToast('Профиль обновлён.', 'success');
  }

  function clearFilters() {
    state.filters = {};
    state.activeMood = null;
    saveSettings();
    render();
  }

  document.addEventListener('click', function (event) {
    const route = event.target.closest('[data-route]');
    if (route) {
      event.preventDefault();
      if (route.dataset.route === 'explore-reset') clearFilters();
      else goTo(route.dataset.route);
      return;
    }
    const mood = event.target.closest('[data-mood]');
    if (mood) {
      state.activeMood = mood.dataset.mood;
      state.view = 'explore';
      saveSettings();
      render();
      return;
    }
    const searchSkill = event.target.closest('[data-search-skill]');
    if (searchSkill) {
      state.filters.query = searchSkill.dataset.searchSkill;
      state.activeMood = null;
      state.view = 'explore';
      saveSettings();
      render();
      return;
    }
    const action = event.target.closest('[data-action]');
    if (!action) return;
    if (action.dataset.action === 'favorite') {
      const id = action.dataset.id;
      const wasFavorite = state.favorites.includes(id);
      toggleFavorite(id);
      if (modal.open && state.detailOfferId === id) openDetails(id);
      return;
    }
    if (action.dataset.action === 'details') { openDetails(action.dataset.id); return; }
    if (action.dataset.action === 'edit-profile') { openProfileEditor(); return; }
    if (action.dataset.action === 'close-modal') { modal.close(); return; }
    if (action.dataset.action === 'clear-mood') { state.activeMood = null; render(); return; }
    if (action.dataset.action === 'create-from-match') {
      const offer = state.offers.find(function (item) { return item.id === state.detailOfferId; });
      if (offer) {
        state.profile.teachSkills = uniqueSkills((state.profile.teachSkills || []).concat(offer.learn));
        state.profile.learnSkills = uniqueSkills((state.profile.learnSkills || []).concat(offer.teach));
        persistProfile();
        modal.close();
        goTo('create');
        showToast('Навыки добавлены в профиль. Опубликуй предложение, чтобы начать обмен.', 'success');
      }
    }
  });

  document.addEventListener('input', function (event) {
    if (event.target.matches('[data-filter="query"]')) {
      state.filters.query = event.target.value;
      state.activeMood = null;
      saveSettings();
      const cursor = event.target.selectionStart;
      render();
      const nextInput = root.querySelector('[data-filter="query"]');
      nextInput.focus();
      nextInput.setSelectionRange(cursor, cursor);
    }
  });

  document.addEventListener('change', function (event) {
    if (event.target.matches('[data-filter]') && event.target.dataset.filter !== 'query') {
      state.filters[event.target.dataset.filter] = event.target.value;
      saveSettings();
      render();
    }
  });

  document.addEventListener('submit', function (event) {
    if (event.target.id === 'offer-form') { event.preventDefault(); onOfferSubmit(event.target); }
    if (event.target.id === 'profile-form') { event.preventDefault(); onProfileSubmit(event.target); }
  });

  mobileMenu.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('is-open');
    mobileMenu.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  modal.addEventListener('click', function (event) {
    if (event.target === modal) modal.close();
  });

  modal.addEventListener('close', function () { state.detailOfferId = null; });

  render();
})();