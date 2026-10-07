(function () {
  const storage = window.SkillSwapStorage;
  const data = window.SkillSwapData;
  const matching = window.SkillSwapMatching;
  storage.initialize(data);
  let currentUser = storage.getCurrentUser();
  const initial = storage.loadData(data) || {
    offers: storage.getOffers(),
    favorites: [],
    profile: Object.assign({}, data.defaultProfile),
    settings: { activeView: 'home', activeMood: null, filters: {} }
  };
  const savedView = initial.settings && initial.settings.activeView;
  const state = {
    offers: initial.offers,
    favorites: initial.favorites,
    profile: initial.profile || Object.assign({}, data.defaultProfile),
    settings: initial.settings || { activeView: 'home', activeMood: null, filters: {} },
    view: currentUser ? (savedView && savedView !== 'home' ? savedView : 'overview') : 'home',
    filters: initial.settings && initial.settings.filters ? initial.settings.filters : {},
    createdNotice: false,
    activeMood: initial.settings && initial.settings.activeMood ? initial.settings.activeMood : null,
    detailOfferId: null,
    chats: storage.getChats(),
    support: storage.getSupport(),
    reviews: storage.getReviews(),
    reports: storage.getReports(),
    activeChatId: null,
    supportNotice: false,
    contactNotice: false,
    reviewNotice: false,
    aboutSection: 'about-platform',
    pendingDeleteOfferId: null,
    homeFeature: 'exchange',
    pendingRegistration: null
  };
  const root = document.getElementById('view-root');
  const modal = document.getElementById('app-modal');
  const modalContent = document.getElementById('modal-content');
  const nav = document.getElementById('primary-nav');
  const mobileMenu = document.querySelector('.mobile-menu-button');
  const themeSwitch = document.getElementById('theme-switch');
  const avatarPresets = data.demoOffers.slice(0, 6).map(function (offer) { return offer.avatarUrl; });

  function setTheme(theme) {
    const selectedTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = selectedTheme;
    themeSwitch.querySelectorAll('[data-theme-choice]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === selectedTheme));
    });
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = selectedTheme === 'dark' ? '#171923' : '#f7f8fc';
    try { window.localStorage.setItem('skillswap_theme', selectedTheme); } catch (error) {}
  }

  let savedTheme = 'light';
  try { savedTheme = window.localStorage.getItem('skillswap_theme') || 'light'; } catch (error) {}
  setTheme(savedTheme);
  themeSwitch.addEventListener('click', function (event) {
    const button = event.target.closest('[data-theme-choice]');
    if (button) setTheme(button.dataset.themeChoice);
  });

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function initials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toLocaleUpperCase('ru');
  }

  const mockPresence = [
    { online: true },
    { online: false },
    { online: false },
    { online: false },
    { online: true },
    { online: false },
    { online: false },
    { online: true },
    { online: false },
    { online: false },
    { online: true },
    { online: false }
  ];

  function getPresence(userId) {
    if (!userId) return null;
    if (currentUser && userId === currentUser.id) return { online: true };
    const demoIndex = data.demoUsers.findIndex(function (user) { return user.id === userId; });
    return demoIndex >= 0 ? mockPresence[demoIndex % mockPresence.length] : { online: false };
  }

  function presenceMarkup(userId) {
    const presence = getPresence(userId);
    if (!presence) return '';
    const statusText = presence.online ? 'В сети' : 'Не в сети';
    return '<span class="user-presence ' + (presence.online ? 'is-online' : 'is-offline') + '" aria-label="' + statusText + '"><span class="presence-indicator" aria-hidden="true"></span><span>' + statusText + '</span></span>';
  }

  function avatar(name, color, size, imageUrl) {
    const ownProfileImage = currentUser && state.profile.name === name ? state.profile.avatarUrl : '';
    const matchedUser = storage.getUsers().find(function (user) { return user.name === name; });
    const matchedProfile = matchedUser && storage.getProfile(matchedUser.id);
    const matchedOffer = state.offers.find(function (offer) { return offer.userName === name && offer.avatarUrl; });
    const demoOffer = data.demoOffers.find(function (offer) { return offer.userName === name && offer.avatarUrl; });
    const userId = currentUser && state.profile.name === name ? currentUser.id : (matchedUser ? matchedUser.id : (matchedOffer ? resolveOfferUserId(matchedOffer) : (demoOffer ? resolveOfferUserId(demoOffer) : '')));
    const photo = imageUrl || ownProfileImage || (matchedProfile && matchedProfile.avatarUrl) || (matchedOffer && matchedOffer.avatarUrl) || (demoOffer && demoOffer.avatarUrl) || (!name ? avatarPresets[0] : '');
    const content = photo ? '<img class="avatar-image" src="' + escapeHTML(photo) + '" alt="" loading="lazy">' : escapeHTML(initials(name));
    const presence = getPresence(userId);
    return '<span class="avatar ' + (size || '') + '" style="--avatar-bg:' + escapeHTML(color || '#7886ed') + '"' + (userId ? ' data-user-id="' + escapeHTML(userId) + '"' : '') + ' aria-hidden="true">' + content + (presence ? '<span class="presence-indicator ' + (presence.online ? 'is-online' : 'is-offline') + '" aria-hidden="true"></span>' : '') + '</span>';
  }

  function addPresenceLabels(container) {
    const placements = [
      ['.skill-card-top', '.card-user .person-name'],
      ['.home-offer-author', 'strong'],
      ['.hero-offer-copy > div', 'p'],
      ['.review-top', 'strong'],
      ['.profile-hero', '.profile-main h2'],
      ['.detail-person', 'h2'],
      ['.dialog-item', '.dialog-item-copy strong'],
      ['.chat-header', 'h2']
    ];
    container.querySelectorAll('.avatar[data-user-id]').forEach(function (userAvatar) {
      const userId = userAvatar.dataset.userId;
      const placement = placements.find(function (item) { return userAvatar.closest(item[0]); });
      if (placement) {
        const holder = userAvatar.closest(placement[0]);
        const name = holder && holder.querySelector(placement[1]);
        if (name) name.insertAdjacentHTML('afterend', presenceMarkup(userId));
      }
      const supportPerson = userAvatar.closest('.home-support-person');
      if (supportPerson) {
        const descriptor = supportPerson.querySelector(':scope > span:not(.avatar)');
        if (descriptor) descriptor.insertAdjacentHTML('afterend', presenceMarkup(userId));
      }
    });
  }

  function saveSettings() {
    state.settings = Object.assign({}, state.settings, { activeView: state.view, activeMood: state.activeMood, filters: state.filters });
    if (currentUser && !storage.saveSettings(currentUser.id, state.settings)) showToast('Не удалось сохранить настройки в этом браузере.', 'error');
  }

  function persistOffers() { if (!storage.saveOffers(state.offers)) showToast('Не удалось сохранить предложение. Проверьте настройки браузера.', 'error'); }
  function persistFavorites() { if (currentUser && !storage.saveFavorites(currentUser.id, state.favorites)) showToast('Не удалось сохранить избранное.', 'error'); }
  function persistProfile() { if (currentUser && !storage.saveProfile(currentUser.id, state.profile)) showToast('Не удалось сохранить профиль.', 'error'); }
  function persistChats() { if (!storage.saveChats(state.chats)) showToast('Не удалось сохранить сообщения.', 'error'); }
  function persistSupport() { if (!storage.saveSupport(state.support)) showToast('Не удалось сохранить обращения.', 'error'); }
  function persistReviews() { if (!storage.saveReviews(state.reviews)) showToast('Не удалось сохранить отзывы.', 'error'); }
  function persistReports() { if (!storage.saveReports(state.reports)) showToast('Не удалось сохранить жалобу.', 'error'); }

  function showToast(message, kind) {
    const region = document.getElementById('toast-region');
    const toast = document.createElement('div');
    toast.className = 'toast ' + (kind || '');
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(function () { toast.remove(); }, 3300);
  }

  function openAuthModal(mode, message) {
    const register = mode === 'register';
    modalContent.innerHTML = '<button class="modal-close" type="button" data-action="close-modal" aria-label="Закрыть">×</button><p class="eyebrow">SkillSwap</p><h2>' + (register ? 'Создать аккаунт' : 'Войти в SkillSwap') + '</h2><p class="auth-lead">Обменивайся знаниями. Получай новые навыки.</p><form id="' + (register ? 'register-form' : 'login-form') + '" class="auth-form" novalidate>' + (register ? '<div class="form-field"><label for="auth-name">Имя</label><input id="auth-name" name="name" required autocomplete="name"><span class="field-error" data-error="name"></span></div>' : '') + '<div class="form-field"><label for="auth-email">Email</label><input id="auth-email" name="email" type="email" required autocomplete="email"><span class="field-error" data-error="email"></span></div><div class="form-field"><label for="auth-password">Пароль</label><input id="auth-password" name="password" type="password" required autocomplete="' + (register ? 'new-password' : 'current-password') + '"><span class="field-error" data-error="password"></span></div>' + (register ? '<div class="form-field"><label for="auth-confirm">Подтверждение пароля</label><input id="auth-confirm" name="confirm" type="password" required autocomplete="new-password"><span class="field-error" data-error="confirm"></span></div>' : '') + '<p class="auth-error" role="alert">' + escapeHTML(message || '') + '</p><button class="button button-primary" type="submit">' + (register ? 'Зарегистрироваться' : 'Войти') + '</button></form><p class="auth-switch">' + (register ? 'Уже есть аккаунт? ' : 'Нет аккаунта? ') + '<button type="button" data-action="' + (register ? 'open-login' : 'open-register') + '">' + (register ? 'Войти' : 'Зарегистрироваться') + '</button></p>';
    modal.showModal();
  }

  function openAgreementModal() {
    modalContent.innerHTML = '<button class="modal-close" type="button" data-action="cancel-registration" aria-label="Закрыть">×</button><p class="eyebrow">Перед началом</p><h2>Пользовательское соглашение SkillSwap</h2><div class="agreement-summary"><p>Пользуясь платформой, вы соглашаетесь:</p><ul><li>соблюдать правила использования SkillSwap;</li><li>не публиковать запрещённый или незаконный контент;</li><li>уважать других участников и правила общения;</li><li>не использовать сервис для мошенничества или введения в заблуждение;</li><li>обрабатывать и хранить данные в соответствии с политикой платформы;</li><li>нести ответственность за свои действия и опубликованные материалы.</li></ul></div><a class="agreement-full-link" href="terms.html" target="_blank" rel="noopener">Прочитать полное соглашение</a><label class="agreement-check"><input id="agreement-accept" type="checkbox"><span>Я прочитал(а) и принимаю пользовательское соглашение</span></label><div class="agreement-actions"><button class="button button-secondary" type="button" data-action="cancel-registration">Отменить регистрацию</button><button class="button button-primary" type="button" data-action="confirm-registration" disabled>Подтвердить и продолжить</button></div>';
    modal.showModal();
  }

  function completeRegistration() {
    const registration = state.pendingRegistration;
    if (!registration || !modalContent.querySelector('#agreement-accept:checked')) return;
    const users = storage.getUsers();
    if (users.some(function (user) { return user.email.toLocaleLowerCase('ru') === registration.email; })) {
      state.pendingRegistration = null;
      openAuthModal('register', 'Этот email уже зарегистрирован.');
      return;
    }
    const user = { id: 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), name: registration.name, email: registration.email, password: registration.password };
    users.push(user);
    storage.saveUsers(users);
    storage.saveProfile(user.id, Object.assign({}, data.defaultProfile, { name: user.name, email: user.email }));
    storage.saveCurrentUser({ id: user.id, name: user.name, email: user.email });
    storage.saveSettings(user.id, Object.assign({}, storage.getSettings(user.id), { activeView: 'overview' }));
    state.pendingRegistration = null;
    window.location.reload();
  }

  function openAuthPrompt(message) {
    modalContent.innerHTML = '<button class="modal-close" type="button" data-action="close-modal" aria-label="Закрыть">×</button><p class="eyebrow">Доступ участника</p><h2>' + escapeHTML(message) + '</h2><p class="auth-lead">Войдите или зарегистрируйтесь, чтобы продолжить.</p><div class="modal-actions"><button class="button button-secondary" type="button" data-action="open-login">Войти</button><button class="button button-primary" type="button" data-action="open-register">Регистрация</button></div>';
    modal.showModal();
  }

  function openInfoModal(message) {
    modalContent.innerHTML = '<button class="modal-close" type="button" data-action="close-modal" aria-label="Закрыть">×</button><p class="eyebrow">Сообщения</p><h2>' + escapeHTML(message) + '</h2>';
    modal.showModal();
  }

  function openDeleteConfirmation(offerId) {
    currentUser = storage.getCurrentUser();
    const offer = state.offers.find(function (item) { return item.id === offerId; });
    if (!currentUser || !offer || resolveOfferUserId(offer) !== currentUser.id) {
      openInfoModal('Удалять можно только собственные предложения.');
      return;
    }
    state.pendingDeleteOfferId = offerId;
    modalContent.innerHTML = '<button class="modal-close" type="button" data-action="close-modal" aria-label="Закрыть">×</button><p class="eyebrow">Удаление предложения</p><h2>Вы уверены, что хотите удалить это предложение?</h2><p class="auth-lead">Оно исчезнет из каталога и вашего профиля.</p><div class="modal-actions"><button class="button button-secondary" type="button" data-action="close-modal">Отмена</button><button class="button button-danger" type="button" data-action="confirm-delete">Удалить</button></div>';
    modal.showModal();
  }

  function reportReasons(type) {
    return type === 'dialog' ? ['Спам или навязчивая реклама', 'Оскорбления или травля', 'Мошенничество или подозрительные предложения', 'Неприемлемое поведение', 'Нарушение правил платформы', 'Другая причина'] : ['Спам или реклама', 'Мошенничество или обман', 'Оскорбительный или неподобающий контент', 'Ложная или вводящая в заблуждение информация', 'Нарушение правил платформы', 'Другая причина'];
  }

  function openReportModal(type, objectId) {
    if (!currentUser) {
      openAuthPrompt('Чтобы отправить жалобу, необходимо войти в аккаунт.');
      return;
    }
    const objectType = type === 'dialog' ? 'dialog' : 'offer';
    const reasons = reportReasons(objectType);
    const targetOffer = objectType === 'offer' ? state.offers.find(function (item) { return item.id === objectId; }) : null;
    const targetChat = objectType === 'dialog' ? state.chats.find(function (chat) { return chat.id === objectId; }) : null;
    if (targetOffer && resolveOfferUserId(targetOffer) === currentUser.id) {
      openInfoModal('Нельзя пожаловаться на собственное предложение.');
      return;
    }
    if (objectType === 'offer' && !targetOffer || objectType === 'dialog' && (!targetChat || !targetChat.participants.includes(currentUser.id))) {
      openInfoModal('Объект жалобы недоступен.');
      return;
    }
    const targetUserId = targetOffer ? resolveOfferUserId(targetOffer) : targetChat.participants.find(function (id) { return id !== currentUser.id; });
    const title = objectType === 'dialog' ? 'Пожаловаться на диалог' : 'Пожаловаться на предложение';
    modalContent.innerHTML = '<button class="modal-close" type="button" data-action="close-modal" aria-label="Закрыть">×</button><p class="eyebrow">Жалоба</p><h2>' + title + '</h2><form id="report-form" novalidate data-report-type="' + objectType + '" data-report-id="' + escapeHTML(objectId) + '" data-target-user-id="' + escapeHTML(targetUserId || '') + '"><div class="form-field"><label for="report-reason">Причина</label><select id="report-reason" name="reason" required><option value="">Выберите причину</option>' + reasons.map(function (reason) { return '<option>' + escapeHTML(reason) + '</option>'; }).join('') + '</select><span class="field-error" data-error="reason"></span></div><div class="form-field"><label for="report-details">Подробности (необязательно)</label><textarea id="report-details" name="details" maxlength="1000" placeholder="Опишите ситуацию..."></textarea></div><div class="form-actions"><button class="button button-secondary" type="button" data-action="close-modal">Отмена</button><button class="button button-primary" type="submit">Отправить жалобу</button></div></form>';
    modal.showModal();
  }

  function deleteOffer(offerId) {
    currentUser = storage.getCurrentUser();
    const offer = state.offers.find(function (item) { return item.id === offerId; });
    if (!currentUser || !offer || resolveOfferUserId(offer) !== currentUser.id) {
      openInfoModal('Удалять можно только собственные предложения.');
      return;
    }
    state.offers = state.offers.filter(function (item) { return item.id !== offerId; });
    state.favorites = state.favorites.filter(function (id) { return id !== offerId; });
    persistOffers();
    persistFavorites();
    state.pendingDeleteOfferId = null;
    if (state.detailOfferId === offerId) state.detailOfferId = null;
    if (modal.open) modal.close();
    render();
    showToast('Предложение удалено.', 'success');
  }

  function onReportSubmit(form) {
    currentUser = storage.getCurrentUser();
    if (!currentUser) { openAuthPrompt('Чтобы отправить жалобу, необходимо войти в аккаунт.'); return; }
    const reason = formValue(form, 'reason');
    const objectType = form.dataset.reportType;
    const objectId = form.dataset.reportId;
    const targetUserId = form.dataset.targetUserId || null;
    showFieldError(form, 'reason', reason ? '' : 'Выберите причину жалобы.');
    const targetOffer = objectType === 'offer' ? state.offers.find(function (item) { return item.id === objectId; }) : null;
    const targetChat = objectType === 'dialog' ? state.chats.find(function (chat) { return chat.id === objectId; }) : null;
    if (!reason || !objectType || !objectId || objectType === 'offer' && (!targetOffer || resolveOfferUserId(targetOffer) === currentUser.id) || objectType === 'dialog' && (!targetChat || !targetChat.participants.includes(currentUser.id))) return;
    const duplicate = state.reports.some(function (report) {
      return report.reporterId === currentUser.id && report.objectType === objectType && report.objectId === objectId && ['new', 'in_review'].includes(report.status);
    });
    if (duplicate) {
      modal.close();
      showToast('Вы уже отправляли жалобу на этот объект.', 'error');
      return;
    }
    state.reports.push({ id: 'report-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7), objectType: objectType, objectId: objectId, reporterId: currentUser.id, targetUserId: targetUserId, reason: reason, details: formValue(form, 'details'), createdAt: new Date().toISOString(), status: 'new' });
    persistReports();
    modal.close();
    showToast('Жалоба успешно отправлена.', 'success');
  }

  function onAuthSubmit(form, register) {
    const email = formValue(form, 'email').toLocaleLowerCase('ru');
    const password = formValue(form, 'password');
    const users = storage.getUsers();
    if (!register) {
      const user = users.find(function (item) { return item.email.toLocaleLowerCase('ru') === email && item.password === password; });
      if (!user) { openAuthModal('login', 'Неверный email или пароль'); return; }
      storage.saveCurrentUser({ id: user.id, name: user.name, email: user.email });
      storage.saveSettings(user.id, Object.assign({}, storage.getSettings(user.id), { activeView: 'overview' }));
      window.location.reload();
      return;
    }
    const name = formValue(form, 'name');
    const confirm = formValue(form, 'confirm');
    const errors = {
      name: name ? '' : 'Имя обязательно.',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Укажи корректный email.',
      password: password.length >= 6 ? '' : 'Минимум 6 символов.',
      confirm: password === confirm ? '' : 'Пароли не совпадают.'
    };
    if (users.some(function (user) { return user.email.toLocaleLowerCase('ru') === email; })) errors.email = 'Этот email уже зарегистрирован.';
    Object.keys(errors).forEach(function (nameKey) { showFieldError(form, nameKey, errors[nameKey]); });
    const firstError = Object.keys(errors).find(function (nameKey) { return errors[nameKey]; });
    if (firstError) { form.elements.namedItem(firstError).focus(); return; }
    state.pendingRegistration = { name: name, email: email, password: password };
    openAgreementModal();
  }

  function updateNavigation() {
    const navigationItems = currentUser ? [
      { label: 'Обзор', route: 'overview', href: '#overview' },
      { label: 'Найти людей', route: 'explore', href: '#explore' },
      { label: 'Обмен навыками', route: 'create', href: '#create' },
      { label: 'Сообщения', route: 'messages', href: '#messages' },
      { label: 'Профиль', route: 'profile', href: '#profile' }
    ] : [
      { label: 'Главная', route: 'home', href: '#home' },
      { label: 'Как это работает', route: 'about', href: '#about-platform', section: 'about-platform' },
      { label: 'Найти людей', route: 'explore', href: '#explore' }
    ];
    nav.innerHTML = navigationItems.map(function (item) {
      return '<a href="' + item.href + '" data-route="' + item.route + '"' + (item.section ? ' data-about-section="' + item.section + '"' : '') + '>' + item.label + (item.route === 'matches' ? ' <span class="nav-match-dot" aria-hidden="true"></span>' : '') + '</a>';
    }).join('');
    document.querySelectorAll('[data-route]').forEach(function (link) {
      link.classList.toggle('active', link.dataset.route === state.view);
    });
    const accountActions = document.getElementById('account-actions');
    if (currentUser) {
      const unread = getUnreadCount();
      accountActions.innerHTML = '<button class="account-button" type="button" data-action="toggle-account">' + avatar(state.profile.name, state.profile.color, 'nav-avatar') + '<span>' + escapeHTML(state.profile.name) + '</span><span aria-hidden="true">⌄</span></button><div class="account-menu" id="account-menu"><button type="button" data-route="profile">Мой профиль</button><button type="button" data-route="profile">Мои предложения</button><button type="button" data-route="favorites">Избранное</button><button type="button" data-route="matches">Совпадения</button><button type="button" data-route="messages">Сообщения' + (unread ? ' <span class="count-badge">' + unread + '</span>' : '') + '</button><button type="button" data-route="support">Поддержка</button><button type="button" data-action="logout">Выйти</button></div>';
    } else {
      accountActions.innerHTML = '<button class="button button-secondary header-auth-button" type="button" data-action="open-login">Войти</button><button class="button button-primary header-auth-button" type="button" data-action="open-register">Регистрация</button>';
    }
    const matchDot = document.querySelector('.nav-match-dot');
    if (matchDot) {
      const exactCount = currentUser ? matching.findMatches(state.profile, state.offers, currentUser.id).filter(function (offer) { return offer.match.type === 'exact'; }).length : 0;
      matchDot.style.background = exactCount ? '#9bd557' : '#d2d4dd';
    }
  }

  function isOtherOffer(offer) {
    return !currentUser || (offer.userId !== currentUser.id && offer.ownerId !== 'self');
  }

  function goTo(view, options) {
    const validViews = ['home', 'overview', 'explore', 'create', 'matches', 'favorites', 'profile', 'messages', 'support', 'about'];
    state.view = validViews.includes(view) ? view : 'home';
    if (currentUser && state.view === 'home') state.view = 'overview';
    if (!currentUser && ['overview', 'create', 'matches', 'favorites', 'profile', 'messages'].includes(state.view)) {
      openAuthPrompt(state.view === 'create' ? 'Создайте аккаунт, чтобы предложить свой навык.' : 'Войдите, чтобы открыть персональный раздел.');
      return;
    }
    if (!options || !options.keepMood) state.activeMood = null;
    state.createdNotice = Boolean(options && options.created);
    saveSettings();
    nav.classList.remove('is-open');
    mobileMenu.setAttribute('aria-expanded', 'false');
    render();
    if (state.view === 'about' && state.aboutSection) {
      window.setTimeout(function () {
        const section = document.getElementById(state.aboutSection);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function button(label, action, style) {
    return '<button class="button ' + (style || 'button-primary') + '" type="button" data-action="' + action + '">' + label + '</button>';
  }

  function skillOptionsMarkup() {
    return '<datalist id="skill-options"><option value="Программирование"></option><option value="Веб-разработка"></option><option value="Дизайн"></option><option value="Photoshop"></option><option value="Figma"></option><option value="Английский язык"></option><option value="Другие языки"></option><option value="Фотография"></option><option value="Видеомонтаж"></option><option value="Музыка"></option><option value="Гитара"></option><option value="Рисование"></option><option value="Маркетинг"></option><option value="SMM"></option><option value="Excel"></option><option value="Математика"></option><option value="Публичные выступления"></option></datalist>';
  }

  function getUnreadCount() {
    if (!currentUser) return 0;
    return state.chats.reduce(function (total, chat) {
      return total + chat.messages.filter(function (message) { return message.receiverId === currentUser.id && !(message.readBy || []).includes(currentUser.id); }).length;
    }, 0);
  }

  function getUserName(userId, fallback) {
    const user = storage.getUsers().find(function (item) { return item.id === userId; });
    const profile = storage.getProfile(userId);
    return (user && user.name) || (profile && profile.name) || fallback || 'Пользователь';
  }

  function getTargetUser(userId, offer) {
    const user = storage.getUsers().find(function (item) { return item.id === userId; });
    if (user) return user;
    const profile = storage.getProfile(userId);
    if (profile) return { id: userId, name: profile.name || (offer && offer.userName) || 'Пользователь', email: profile.email || '' };
    const demoUser = data.demoUsers.find(function (item) { return item.id === userId; });
    if (demoUser) return demoUser;
    if (offer && resolveOfferUserId(offer) === userId) return { id: userId, name: offer.userName || 'Пользователь', email: '' };
    return null;
  }

  function resolveOfferUserId(offer) {
    if (offer.userId) return offer.userId;
    const matchingDemo = data.demoOffers.find(function (item) { return item.id === offer.id; });
    if (matchingDemo && matchingDemo.userId) return matchingDemo.userId;
    const matchingUser = storage.getUsers().find(function (user) { return user.name === offer.userName; });
    return matchingUser ? matchingUser.id : '';
  }

  function chatPartner(chat) {
    return chat.participants.find(function (participant) { return participant !== currentUser.id; });
  }

  function chatTime(timestamp) {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
  }

  function renderHeroOfferCard(offer, index) {
    return '<article class="hero-offer-card hero-offer-card-' + (index + 1) + '"><img src="' + escapeHTML(offer.imageUrl || '') + '" alt="" loading="lazy"><div class="hero-offer-copy"><span>' + escapeHTML(offer.category) + '</span><h3>' + escapeHTML(offer.title || offer.teach) + '</h3><div>' + avatar(offer.userName, offer.color, 'avatar-small') + '<p>' + escapeHTML(offer.userName) + '</p></div></div></article>';
  }

  function renderHomeSupport() {
    const features = [
      { id: 'exchange', label: 'Обмен навыками', title: 'Обменивайся знаниями и навыками', description: 'Предлагай другим свои знания и находи людей, которые могут научить тебя чему-то новому.', image: data.demoOffers[0].imageUrl, tag: 'Паста ↔ английский', route: 'create', action: 'Предложить навык', person: data.demoOffers[0] },
      { id: 'people', label: 'Поиск людей', title: 'Находи людей с похожими интересами', description: 'Общайся с пользователями, находи подходящие предложения и создавай полезные знакомства.', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&h=800&q=88', tag: '31 участник', route: 'explore', action: 'Найти людей', person: data.demoOffers[1] },
      { id: 'learning', label: 'Обучение', title: 'Учись у людей с реальным опытом', description: 'Находи интересные навыки, задавай вопросы и развивайся вместе с другими пользователями.', image: data.demoOffers[3].imageUrl, tag: 'Учимся на практике', route: 'explore', action: 'Выбрать навык', person: data.demoOffers[3] },
      { id: 'community', label: 'Сообщество', title: 'Развивайся вместе с сообществом', description: 'Общайся, помогай другим и находи людей, которым интересно то же, что и тебе.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=800&q=88', tag: 'Навыки объединяют', route: 'about', action: 'О сообществе', person: data.demoOffers[2] }
    ];
    const active = features.find(function (feature) { return feature.id === state.homeFeature; }) || features[0];
    const tabs = features.map(function (feature) {
      const selected = feature.id === active.id;
      return '<button id="home-tab-' + feature.id + '" class="home-feature-tab" type="button" role="tab" aria-selected="' + selected + '" aria-controls="home-feature-panel" tabindex="' + (selected ? '0' : '-1') + '" data-home-feature="' + feature.id + '">' + feature.label + '</button>';
    }).join('');
    const supportingCards = [
      { title: 'Свободно делись знаниями', text: 'Создавай предложения и находи людей, которым нужны твои навыки.', image: data.demoOffers[1].imageUrl, route: 'create', action: 'Поделиться навыком' },
      { title: 'Учись в удобном формате', text: 'Выбирай интересующие тебя предложения и договаривайся с другими пользователями.', image: data.demoOffers[9].imageUrl, route: 'explore', action: 'Смотреть предложения' }
    ];
    return '<section class="section-block home-support-section" aria-labelledby="home-support-title"><div class="section-heading"><div><p class="eyebrow">Рядом на каждом шаге</p><h2 id="home-support-title">Поддерживаем и помогаем</h2></div><p class="home-support-intro">От первого интереса до живого обмена опытом.</p></div><div class="home-support-shell"><div class="home-support-tabs" role="tablist" aria-label="Возможности SkillSwap">' + tabs + '</div><div id="home-feature-panel" class="home-support-panel" role="tabpanel" aria-labelledby="home-tab-' + active.id + '"><div class="home-support-copy"><p class="eyebrow">' + active.label + '</p><h3>' + active.title + '</h3><p>' + active.description + '</p><button class="button button-primary" type="button" data-route="' + active.route + '">' + active.action + ' <span aria-hidden="true">→</span></button></div><div class="home-support-art"><img src="' + escapeHTML(active.image) + '" alt="" loading="lazy"><span class="home-support-art-tag">' + escapeHTML(active.tag) + '</span><div class="home-support-person">' + avatar(active.person.userName, active.person.color, 'avatar-small') + '<span>Опыт участников</span></div></div></div></div><div class="home-support-cards">' + supportingCards.map(function (card) { return '<article class="home-support-card"><img src="' + escapeHTML(card.image) + '" alt="" loading="lazy"><div><h3>' + card.title + '</h3><p>' + card.text + '</p><button class="text-link" type="button" data-route="' + card.route + '">' + card.action + ' <span aria-hidden="true">→</span></button></div></article>'; }).join('') + '</div></section>';
  }

  function renderHomeOfferCard(offer, index) {
    const isFavorite = state.favorites.includes(offer.id);
    return '<article class="skill-card home-offer-card home-offer-card-' + (index + 1) + '"><div class="home-offer-image"><img src="' + escapeHTML(offer.imageUrl || '') + '" alt="" loading="lazy"><span>' + escapeHTML(offer.category) + '</span></div><div class="home-offer-content"><div class="home-offer-author">' + avatar(offer.userName, offer.color, 'avatar-small') + '<div><strong>' + escapeHTML(offer.userName) + '</strong><span>' + escapeHTML(offer.city || 'Сообщество SkillSwap') + '</span></div><button class="favorite-button ' + (isFavorite ? 'is-favorite' : '') + '" type="button" data-action="favorite" data-id="' + escapeHTML(offer.id) + '" aria-label="' + (isFavorite ? 'Убрать из избранного' : 'Добавить в избранное') + '" aria-pressed="' + isFavorite + '">' + (isFavorite ? '♥' : '♡') + '</button></div><h3>' + escapeHTML(offer.title || offer.teach) + '</h3><p class="home-offer-description">' + escapeHTML(offer.description) + '</p><div class="home-offer-swap"><div><span>Чему научу</span><strong>' + escapeHTML(offer.teach) + '</strong></div><span class="home-offer-swap-arrow" aria-hidden="true">⇄</span><div><span>Хочу взамен</span><strong>' + escapeHTML(offer.learn) + '</strong></div></div><div class="card-actions"><button class="button button-quiet" type="button" data-action="details" data-id="' + escapeHTML(offer.id) + '">Подробнее <span aria-hidden="true">↗</span></button><span class="card-hint">' + escapeHTML(offer.availability || 'Время по договорённости') + '</span></div></div></article>';
  }

  function renderHome() {
    const preferredOfferIds = ['demo-alice', 'demo-daniyar', 'demo-alina', 'demo-arman', 'demo-sofia', 'demo-maxim'];
    const publicOffers = state.offers.filter(isOtherOffer);
    const preferredOffers = preferredOfferIds.map(function (id) { return state.offers.find(function (offer) { return offer.id === id; }); }).filter(function (offer) { return offer && isOtherOffer(offer); });
    const featured = preferredOffers.concat(publicOffers.filter(function (offer) { return !preferredOfferIds.includes(offer.id); })).slice(0, 6);
    const heroOffers = featured.slice(0, 4);
    const userCount = new Set(state.offers.map(resolveOfferUserId).filter(Boolean)).size;
    const skillCount = new Set(state.offers.reduce(function (skills, offer) { return skills.concat([offer.teach, offer.learn]); }, []).filter(Boolean)).size;
    const categories = ['Программирование', 'Дизайн', 'Языки', 'Готовка', 'Рукоделие', 'Музыка', 'Спорт', 'Технологии', 'Другое'];
    const benefits = [
      { title: 'Обмен навыками', text: 'Учи других тому, что умеешь сам.', visual: 'exchange', label: 'Передавай опыт' },
      { title: 'Люди рядом', text: 'Находи пользователей с похожими интересами.', visual: 'community', label: 'Знакомься и общайся' },
      { title: 'Взаимовыгодное обучение', text: 'Помогай другим и развивай собственные навыки.', visual: 'growth', label: 'Расти вместе' },
      { title: 'Умные совпадения', text: 'Находи людей, чьи навыки подходят твоим целям.', visual: 'matching', label: 'Подбор по интересам' }
    ];
    return '<div class="page-shell home-shell"><section class="hero home-hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">Сообщество взаимного обучения</p><h1 id="hero-title">Учись новому. <span>Делись тем, что умеешь.</span></h1><p>Находи людей, обменивайся навыками и развивайся вместе.</p><div class="hero-actions"><button class="button button-primary" type="button" data-route="explore">Найти навык <span aria-hidden="true">→</span></button><button class="button button-secondary" type="button" data-route="create">Предложить навык <span aria-hidden="true">↗</span></button></div><div class="home-stats"><div><strong>' + userCount + '</strong><span>участников</span></div><div><strong>' + state.offers.length + '</strong><span>предложений</span></div><div><strong>' + skillCount + '</strong><span>навыков</span></div></div><div class="home-categories" aria-label="Категории навыков">' + categories.map(function (category) { return '<button type="button" class="home-category" data-category-filter="' + escapeHTML(category) + '">' + escapeHTML(category) + '</button>'; }).join('') + '</div></div><div class="hero-visual home-hero-visual" aria-label="Предложения участников SkillSwap"><div class="hero-offer-stack">' + heroOffers.map(renderHeroOfferCard).join('') + '</div><span class="hero-stack-note">Обменивайся опытом каждый день</span></div></section>' +
      '<section class="section-block benefit-section" aria-labelledby="benefits-title"><div class="section-heading"><div><p class="eyebrow">Учимся друг у друга</p><h2 id="benefits-title">Почему SkillSwap?</h2></div><p class="benefit-intro">Навыки, люди и взаимная поддержка — в одном сообществе.</p></div><div class="benefit-feature-grid">' + benefits.map(function (benefit, index) { return '<article class="benefit-feature benefit-feature-' + (index + 1) + '" data-visual="' + benefit.visual + '"><div class="benefit-art" aria-hidden="true"><span class="benefit-art-line"></span><span class="benefit-art-shape benefit-art-shape-a"></span><span class="benefit-art-shape benefit-art-shape-b"></span><span class="benefit-art-shape benefit-art-shape-c"></span><span class="benefit-art-dot"></span></div><div class="benefit-feature-copy"><span>' + escapeHTML(benefit.label) + '</span><h3>' + escapeHTML(benefit.title) + '</h3><p>' + escapeHTML(benefit.text) + '</p></div></article>'; }).join('') + '</div></section>' +
      '<section class="section-block home-offers-section" aria-labelledby="home-offers-title"><div class="section-heading"><div><p class="eyebrow">Навыки сообщества</p><h2 id="home-offers-title">Предложения участников</h2></div><button class="text-link" type="button" data-route="explore">Все предложения <span aria-hidden="true">→</span></button></div><div class="home-offers-grid">' + featured.map(renderHomeOfferCard).join('') + '</div></section>' +
      '<section class="section-block" aria-labelledby="mood-title"><div class="section-heading"><div><p class="eyebrow">Начни с настроения</p><h2 id="mood-title">Что хочешь сегодня?</h2></div><span class="results-count">Выбери направление</span></div><div class="mood-grid">' + data.moods.map(function (mood) { return '<button type="button" class="mood-card" data-mood="' + mood.id + '"><img class="mood-photo" src="' + escapeHTML(mood.photo) + '" alt="" loading="lazy"><strong>' + escapeHTML(mood.title) + '</strong><span class="card-hint">' + escapeHTML(mood.hint) + '</span></button>'; }).join('') + '</div></section>' +
      '<section class="section-block"><div class="section-heading"><div><p class="eyebrow">То, что ищут чаще</p><h2>Популярные навыки</h2></div><button class="text-link" type="button" data-route="explore">Весь каталог <span aria-hidden="true">→</span></button></div><div class="popular-list">' + ['Английский', 'Дизайн интерфейсов', 'Python', 'Фотография', 'Figma', 'Гитара', 'Видеомонтаж'].map(function (skill) { return '<button type="button" class="popular-chip" data-search-skill="' + escapeHTML(skill) + '">' + escapeHTML(skill) + '</button>'; }).join('') + '</div></section>' +
      '<section class="section-block"><div class="section-heading"><div><p class="eyebrow">Просто и по-человечески</p><h2>Как работает обмен</h2></div></div><div class="steps-strip"><article class="step-item"><span class="step-number">01</span><h3>Расскажи о себе</h3><p>Укажи, чему можешь научить и какой навык хочешь освоить.</p></article><article class="step-item"><span class="step-number">02</span><h3>Найди совпадение</h3><p>Мы сопоставим твои интересы с предложениями сообщества.</p></article><article class="step-item"><span class="step-number">03</span><h3>Обменивайтесь</h3><p>Договоритесь о формате и учитесь друг у друга в своём ритме.</p></article></div></section></div>';
  }

  function renderSkillCard(offer, match) {
    const isFavorite = state.favorites.includes(offer.id);
    const matchBadge = match ? '<span class="match-badge ' + match.type + '">' + escapeHTML(match.label) + '</span>' : '';
    return '<article class="skill-card"><div class="skill-card-image"><img src="' + escapeHTML(offer.imageUrl || '') + '" alt="" loading="lazy"><span>' + escapeHTML(offer.category) + '</span></div><div class="skill-card-top">' + avatar(offer.userName, offer.color) + '<div class="card-user"><p class="person-name">' + escapeHTML(offer.userName) + '</p><p class="card-region">' + escapeHTML(offer.city || 'Сообщество SkillSwap') + '</p></div>' + matchBadge + '<button class="favorite-button ' + (isFavorite ? 'is-favorite' : '') + '" type="button" data-action="favorite" data-id="' + escapeHTML(offer.id) + '" aria-label="' + (isFavorite ? 'Убрать из избранного' : 'Добавить в избранное') + '" aria-pressed="' + isFavorite + '">' + (isFavorite ? '♥' : '♡') + '</button></div><h3 class="catalog-offer-title">' + escapeHTML(offer.title || offer.teach) + '</h3><div class="card-skill-pair"><div class="card-skill"><small>Могу научить</small><strong>' + escapeHTML(offer.teach) + '</strong></div><div class="card-skill learn"><small>Хочу научиться</small><strong>' + escapeHTML(offer.learn) + '</strong></div></div><div class="card-meta"><span class="meta-tag">' + escapeHTML(offer.category) + '</span><span class="meta-tag">' + escapeHTML(offer.level) + '</span><span class="meta-tag">' + escapeHTML(offer.format) + '</span></div><p class="card-description">' + escapeHTML(offer.description) + '</p><div class="card-actions"><button class="button button-quiet" type="button" data-action="details" data-id="' + escapeHTML(offer.id) + '">Подробнее <span aria-hidden="true">↗</span></button><span class="card-hint">' + escapeHTML(offer.availability || 'Время по договорённости') + '</span></div></article>';
  }

  function renderEmpty(icon, title, message, actionLabel, action) {
    return '<div class="empty-state"><span class="empty-icon" aria-hidden="true">' + icon + '</span><h2>' + escapeHTML(title) + '</h2><p>' + escapeHTML(message) + '</p>' + (actionLabel ? '<button class="button button-primary" type="button" data-route="' + action + '">' + escapeHTML(actionLabel) + '</button>' : '') + '</div>';
  }

  function renderOverview() {
    const ownOffers = state.offers.filter(function (offer) { return resolveOfferUserId(offer) === currentUser.id; });
    const ranked = matching.findMatches(state.profile, state.offers, currentUser.id);
    const recommendations = ranked.slice(0, 3);
    const ownChats = state.chats.filter(function (chat) { return chat.participants.includes(currentUser.id); });
    const popularSkills = ['Английский', 'Дизайн интерфейсов', 'Python', 'Фотография', 'Figma', 'Гитара'];
    const firstName = String(state.profile.name || currentUser.name || '').trim().split(/\s+/)[0] || 'участник';

    return '<div class="page-shell overview-shell">' +
      '<section class="overview-welcome"><div class="overview-welcome-copy"><p class="eyebrow">Твоё пространство SkillSwap</p><h1>С возвращением, ' + escapeHTML(firstName) + '!</h1><p>Найди человека, который поможет освоить новый навык, и предложи свои знания взамен.</p><div class="overview-actions"><button class="button button-primary" type="button" data-route="explore">Найти людей <span aria-hidden="true">→</span></button><button class="button button-secondary" type="button" data-route="create">Добавить свой навык <span aria-hidden="true">↗</span></button></div></div><div class="overview-summary" aria-label="Сводка активности"><div><strong>' + ownOffers.length + '</strong><span>предложения</span></div><div><strong>' + recommendations.length + '</strong><span>рекомендации</span></div><div><strong>' + ownChats.length + '</strong><span>диалоги</span></div></div></section>' +
      '<div class="overview-grid">' +
        '<section class="overview-panel overview-recommendations"><div class="section-heading"><div><p class="eyebrow">Подбор для тебя</p><h2>Рекомендации</h2></div><button class="text-link" type="button" data-route="matches">Все совпадения <span aria-hidden="true">→</span></button></div>' + (recommendations.length ? '<div class="card-grid">' + recommendations.map(function (offer) { return renderSkillCard(offer, offer.match); }).join('') + '</div>' : renderEmpty('⌕', 'Пока нет рекомендаций', 'Загляни в каталог — новые предложения появляются в сообществе.', 'Найти людей', 'explore')) + '</section>' +
        '<section class="overview-panel"><div class="section-heading"><div><p class="eyebrow">Продолжай общение</p><h2>Сообщения</h2></div><button class="text-link" type="button" data-route="messages">Открыть <span aria-hidden="true">→</span></button></div><p class="overview-panel-copy">' + (ownChats.length ? 'У тебя ' + ownChats.length + ' диалог(а). Продолжай договариваться об обмене.' : 'Здесь появятся диалоги с участниками, с которыми ты начнёшь обмен.') + '</p><button class="button button-secondary" type="button" data-route="' + (ownChats.length ? 'messages' : 'explore') + '">' + (ownChats.length ? 'Перейти к сообщениям' : 'Найти партнёра') + '</button></section>' +
        '<section class="overview-panel"><div class="section-heading"><div><p class="eyebrow">Идеи для обмена</p><h2>Популярные навыки</h2></div></div><div class="popular-list">' + popularSkills.map(function (skill) { return '<button type="button" class="popular-chip" data-search-skill="' + escapeHTML(skill) + '">' + escapeHTML(skill) + '</button>'; }).join('') + '</div></section>' +
      '</div></div>';
  }

  function renderExplore() {
    const filters = state.filters;
    const categories = Array.from(new Set(state.offers.map(function (offer) { return offer.category; }))).sort(function (a, b) { return a.localeCompare(b, 'ru'); });
    let offers = state.offers.filter(isOtherOffer);
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
    const ranked = matching.findMatches(state.profile, state.offers, currentUser && currentUser.id);
    const exact = ranked.filter(function (offer) { return offer.match.type === 'exact'; });
    const good = ranked.filter(function (offer) { return offer.match.type === 'good'; });
    const others = ranked.filter(function (offer) { return offer.match.type === 'regular'; });
    const sections = [
      { title: 'Точное совпадение', subtitle: 'Вы обмениваетесь именно тем, что ищете друг у друга.', items: exact, empty: 'Пока нет взаимного обмена. Обнови свои навыки в профиле или загляни позже.' },
      { title: 'Хорошо подходят', subtitle: 'Уже есть общая точка для начала разговора.', items: good, empty: '' },
      { title: 'Другие предложения', subtitle: 'Возможно, здесь найдётся новое направление.', items: others, empty: '' }
    ];
    return '<div class="page-shell"><div class="page-title-row"><div><p class="eyebrow">Подбор на основе твоих навыков</p><h1>Совпадения</h1><p>Никакой случайности: только то, чем ты хочешь обменяться.</p></div></div><div class="matches-intro"><div class="matches-intro-copy"><span class="match-flower" aria-hidden="true"></span><div><h2>' + (exact.length ? 'Нашли совпадение!' : 'Ищем твою пару навыков') + '</h2><p>' + (exact.length ? 'Есть взаимный интерес — можно начинать обмен.' : 'Заполни оба навыка в профиле, чтобы точнее настроить подбор.') + '</p></div></div><div class="match-legend"><span class="match-badge exact">Точное совпадение</span><span class="match-badge good">Хорошее совпадение</span></div></div>' + sections.map(function (section, index) {
      if (index > 0 && !section.items.length) return '';
      return '<section class="matches-section"><div class="section-heading"><div><h2>' + section.title + '</h2><p>' + section.subtitle + '</p></div><span class="results-count">' + section.items.length + '</span></div>' + (section.items.length ? '<div class="card-grid">' + section.items.map(function (offer) { return renderSkillCard(offer, offer.match); }).join('') + '</div>' : (index === 0 ? renderEmpty('⇄', 'Пока без взаимных совпадений', section.empty + ' Твои навыки: ' + ((state.profile.teachSkills || []).join(', ') || 'не указаны') + ' → ' + ((state.profile.learnSkills || []).join(', ') || 'не указаны') + '.', 'Настроить профиль', 'profile') : '')) + '</section>';
    }).join('') + '</div>';
  }

  function renderFavorites() {
    const saved = state.offers.filter(function (offer) { return state.favorites.includes(offer.id); });
    return '<div class="page-shell"><div class="page-title-row"><div><p class="eyebrow">Твои заметки на потом</p><h1>Избранное</h1><p>Предложения, к которым хочется вернуться.</p></div><span class="results-count">' + saved.length + ' сохранено</span></div>' + (saved.length ? '<div class="card-grid">' + saved.map(renderSkillCard).join('') + '</div>' : renderEmpty('♡', 'Здесь пока пусто', 'Сохраняй интересные предложения, чтобы вернуться к ним позже.', 'Найти навык', 'explore')) + '</div>';
  }

  function renderProfile() {
    const ownOffers = state.offers.filter(function (offer) { return currentUser && offer.userId === currentUser.id; });
    const exactCount = matching.findMatches(state.profile, state.offers, currentUser && currentUser.id).filter(function (offer) { return offer.match.type === 'exact'; }).length;
    const teachSkills = state.profile.teachSkills || [];
    const learnSkills = state.profile.learnSkills || [];
    return '<div class="page-shell"><div class="page-title-row"><div><p class="eyebrow">Твоя страница в сообществе</p><h1>Профиль</h1><p>Здесь собраны навыки и предложения для обмена.</p></div></div><section class="profile-hero">' + avatar(state.profile.name, state.profile.color, 'avatar-large') + '<div class="profile-main"><h2>' + escapeHTML(state.profile.name) + '</h2><p>' + escapeHTML(state.profile.city || 'Город не указан') + (state.profile.about ? ' · ' + escapeHTML(state.profile.about) : '') + '</p></div><button type="button" class="button button-secondary" data-action="edit-profile">Изменить профиль <span aria-hidden="true">↗</span></button></section><div class="profile-stats"><div class="stat-box"><strong>' + ownOffers.length + '</strong><span>Моих предложений</span></div><div class="stat-box"><strong>' + exactCount + '</strong><span>Точных совпадений</span></div><div class="stat-box"><strong>' + state.favorites.length + '</strong><span>В избранном</span></div></div><div class="profile-details"><section class="profile-skill-box"><h3>Могу поделиться</h3><div class="skill-pills">' + (teachSkills.length ? teachSkills.map(function (skill) { return '<span class="skill-pill">' + escapeHTML(skill) + '</span>'; }).join('') : '<span class="muted">Добавь навык в предложении</span>') + '</div></section><section class="profile-skill-box"><h3>Хочу научиться</h3><div class="skill-pills">' + (learnSkills.length ? learnSkills.map(function (skill) { return '<span class="skill-pill wants">' + escapeHTML(skill) + '</span>'; }).join('') : '<span class="muted">Добавь интерес в предложении</span>') + '</div></section></div><div class="section-heading profile-offers-title"><div><h2>Мои предложения</h2><p>Опубликованные предложения сообщества.</p></div><button class="button button-primary" type="button" data-route="create">+ Новое</button></div>' + (ownOffers.length ? '<div class="card-grid">' + ownOffers.map(renderSkillCard).join('') + '</div>' : renderEmpty('↗', 'Ты ещё не публиковал предложения', 'Расскажи, чему можешь научить, и найди подходящего партнёра.', 'Предложить навык', 'create')) + '</div>';
  }

  function renderMessages() {
    const ownChats = state.chats.filter(function (chat) { return chat.participants.includes(currentUser.id); }).sort(function (first, second) {
      const firstMessage = first.messages[first.messages.length - 1];
      const secondMessage = second.messages[second.messages.length - 1];
      return String(secondMessage ? secondMessage.timestamp : second.createdAt).localeCompare(String(firstMessage ? firstMessage.timestamp : first.createdAt));
    });
    const active = ownChats.find(function (chat) { return chat.id === state.activeChatId; }) || ownChats[0];
    if (active) {
      active.messages.forEach(function (message) {
        if (message.receiverId === currentUser.id) message.readBy = Array.from(new Set((message.readBy || []).concat(currentUser.id)));
      });
      persistChats();
      state.activeChatId = active.id;
    }
    const dialogItems = ownChats.length ? ownChats.map(function (chat) {
      const partnerId = chatPartner(chat);
      const last = chat.messages[chat.messages.length - 1];
      const unread = chat.messages.filter(function (message) { return message.receiverId === currentUser.id && !(message.readBy || []).includes(currentUser.id); }).length;
      const partnerName = getUserName(partnerId, chat.partnerName);
      return '<button class="dialog-item ' + (active && active.id === chat.id ? 'is-active' : '') + '" type="button" data-action="open-chat" data-id="' + escapeHTML(chat.id) + '">' + avatar(partnerName, '#7886ed', 'avatar-small') + '<span class="dialog-item-copy"><strong>' + escapeHTML(partnerName) + '</strong><span>' + escapeHTML(last ? last.text : 'Новый диалог') + '</span></span><time>' + chatTime(last && last.timestamp) + '</time>' + (unread ? '<b class="count-badge">' + unread + '</b>' : '') + '</button>';
    }).join('') : '<p class="muted dialog-empty">Здесь появятся ваши диалоги.</p>';
    let conversation = '<div class="chat-empty"><span class="empty-icon">✉</span><h2>Выберите диалог</h2><p>Откройте карточку предложения и нажмите «Написать».</p></div>';
    if (active) {
      const partnerId = chatPartner(active);
      const partnerName = getUserName(partnerId, active.partnerName);
      const offer = state.offers.find(function (item) { return item.id === active.offerId; });
      conversation = '<div class="chat-header">' + avatar(partnerName, '#7886ed') + '<div><h2>' + escapeHTML(partnerName) + '</h2><p>' + escapeHTML(offer ? offer.teach + ' ↔ ' + offer.learn : 'Обмен навыками') + '</p></div></div><div class="chat-messages">' + (active.messages.length ? active.messages.map(function (message) { return '<div class="chat-message ' + (message.senderId === currentUser.id ? 'is-own' : '') + '"><p>' + escapeHTML(message.text) + '</p><time>' + chatTime(message.timestamp) + '</time></div>'; }).join('') : '<p class="muted chat-no-messages">Начните разговор первым.</p>') + '</div><form class="chat-form" id="chat-form"><input name="text" required maxlength="1000" autocomplete="off" placeholder="Введите сообщение..."><button class="button button-primary" type="submit" aria-label="Отправить">➤</button></form>';
    }
    return '<div class="page-shell"><div class="page-title-row"><div><p class="eyebrow">Личное общение</p><h1>Сообщения</h1><p>Договоритесь об обмене навыками.</p></div></div><div class="messages-layout"><aside class="dialog-sidebar"><h2>Диалоги</h2><div class="dialog-list">' + dialogItems + '</div></aside><section class="chat-panel">' + conversation + '</section></div></div>';
  }

  function renderSupport() {
    const ownTickets = state.support.filter(function (ticket) { return currentUser && ticket.userId === currentUser.id; }).sort(function (first, second) { return String(second.createdAt).localeCompare(String(first.createdAt)); });
    const notice = state.supportNotice ? '<div class="success-banner"><span aria-hidden="true">✓</span><strong>Спасибо! Обращение сохранено в этом браузере.</strong></div>' : '';
    return '<div class="page-shell"><div class="page-title-row"><div><p class="eyebrow">Помощь по SkillSwap</p><h1>Поддержка SkillSwap</h1><p>Не нашли ответ на свой вопрос? Опишите проблему, и мы постараемся помочь.</p></div></div>' + notice + '<div class="support-layout"><section class="form-panel"><h2>Обратиться в поддержку</h2><form id="support-form" novalidate><div class="form-field"><label for="support-subject">Тема</label><select id="support-subject" name="subject" required><option value="">Выберите тему</option><option>Проблема с аккаунтом</option><option>Проблема с предложением</option><option>Проблема с чатом</option><option>Проблема с совпадением</option><option>Ошибка на сайте</option><option>Другое</option></select><span class="field-error" data-error="subject"></span></div><div class="form-field"><label for="support-message">Сообщение</label><textarea id="support-message" name="message" required maxlength="1000" placeholder="Опишите вашу проблему..."></textarea><span class="field-error" data-error="message"></span></div><button class="button button-primary" type="submit">Отправить обращение</button></form></section><aside class="support-faq"><h2>Часто задаваемые вопросы</h2><details><summary>Как создать предложение?</summary><p>Авторизуйтесь и перейдите в раздел «Предложить навык».</p></details><details><summary>Как найти человека для обмена навыками?</summary><p>Используйте поиск, фильтры и карточки предложений.</p></details><details><summary>Как начать общение?</summary><p>Откройте карточку пользователя и нажмите «Написать».</p></details><details><summary>Как работает совпадение?</summary><p>Система ищет пользователей, чьи навыки и желания соответствуют друг другу.</p></details><details><summary>Сохраняются ли мои данные?</summary><p>Да. Данные сохраняются локально в браузере через localStorage.</p></details></aside></div>' + (currentUser ? '<section class="support-tickets"><h2>Мои обращения</h2>' + (ownTickets.length ? ownTickets.map(function (ticket) { return '<article class="support-ticket"><strong>#' + escapeHTML(ticket.id.slice(-6)) + '</strong><span>' + escapeHTML(ticket.subject) + '</span><small>Статус: ' + (ticket.status === 'new' ? 'Новое' : 'Решено') + '</small></article>'; }).join('') : '<p class="muted">Вы ещё не отправляли обращений.</p>') + '</section>' : '') + '</div>';
  }

  function renderCreatorsSection() {
    return '<section class="page-shell creators-section" id="about-creators" aria-labelledby="creators-title"><div class="creators-layout"><figure class="creators-photo"><img class="media-image" src="5343586967687470815.jpg" alt="Создатели SkillSwap вместе за работой"><figcaption>Команда SkillSwap</figcaption></figure><div class="creators-content"><p class="eyebrow">Люди за платформой</p><h2 id="creators-title">О создателях</h2><p class="creators-subtitle">Люди, которые создали SkillSwap</p><div class="creators-people"><article class="creators-person"><span>01</span><div><h3>Р. Алишер</h3><p>Сооснователь / Разработчик</p><small>Создаёт инструменты для поиска и обмена навыками.</small></div></article><article class="creators-person"><span>02</span><div><h3>Т. Аймухан</h3><p>Сооснователь / Дизайнер</p><small>Продумывает визуальный язык и удобные сценарии обучения.</small></div></article></div><p class="creators-mission">Мы создали SkillSwap, чтобы люди могли обмениваться знаниями, находить единомышленников и развивать навыки вместе. Наша цель — сделать обучение более доступным, живым и взаимовыгодным.</p><p class="creators-signature">Создано людьми для людей.</p></div></div></section>';
  }

  function observeCreatorsSection() {
    const section = root.querySelector('#about-creators');
    if (!section) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      section.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    observer.observe(section);
  }

  function renderAbout() {
    const faq = [
      ['Что такое SkillSwap?', 'SkillSwap — платформа, на которой пользователи находят друг друга для обмена знаниями, навыками и опытом.'],
      ['Как начать пользоваться платформой?', 'Зарегистрируйся, заполни профиль, укажи навыки, которыми можешь поделиться, и найди интересующие тебя предложения.'],
      ['Нужно ли создавать аккаунт?', 'Для профиля, создания предложений и переписки необходимо зарегистрироваться и войти в аккаунт.'],
      ['Как найти человека для обмена навыками?', 'Воспользуйся каталогом, поиском и фильтрами, чтобы найти подходящего пользователя.'],
      ['Как написать другому пользователю?', 'Открой предложение пользователя и нажми «Написать». Откроется соответствующий диалог.'],
      ['Можно ли предлагать собственные навыки?', 'Да. Заполни профиль и создай предложение, описав навык, которым готов поделиться.'],
      ['Нужно ли ждать ответа, чтобы начать переписку?', 'Нет. Авторизованный пользователь может самостоятельно начать диалог и отправить сообщение.'],
      ['Что делать, если возникла проблема?', 'Перейди в раздел «Поддержка» и опиши проблему в форме обращения.']
    ];
    const steps = [
      ['01', 'Создай профиль', 'Расскажи о своих навыках, интересах и том, чему хочешь научиться.', '✦'],
      ['02', 'Найди своего человека', 'Изучай предложения сообщества и используй поиск с фильтрами.', '⌕'],
      ['03', 'Начни общение', 'Напиши выбранному пользователю через встроенные диалоги.', '↗'],
      ['04', 'Обменивайся знаниями', 'Договоритесь о формате и развивайтесь в своём ритме.', '⇄']
    ];
    const benefits = ['Обмен навыками между пользователями', 'Единомышленники по интересам', 'Поиск по навыкам и форматам', 'Встроенные личные сообщения', 'Возможность делиться опытом', 'Практика через совместную деятельность'];
    const reviews = state.reviews.slice().sort(function (first, second) { return String(second.createdAt).localeCompare(String(first.createdAt)); });
    const reviewNotice = state.reviewNotice ? '<div class="success-banner"><span aria-hidden="true">✓</span><strong>Спасибо! Отзыв сохранён в этом браузере.</strong></div>' : '';
    const reviewForm = currentUser ? '<form id="review-form" class="about-review-form" novalidate><div class="form-field"><label for="review-rating">Оценка</label><select id="review-rating" name="rating" required><option value="">Выберите оценку</option><option value="5">5 — отлично</option><option value="4">4 — хорошо</option><option value="3">3 — нормально</option><option value="2">2 — есть вопросы</option><option value="1">1 — нужно улучшить</option></select></div><div class="form-field"><label for="review-text">Ваш отзыв</label><textarea id="review-text" name="text" required maxlength="500" placeholder="Расскажите о своём опыте..."></textarea><span class="field-error" data-error="text"></span></div><button class="button button-primary" type="submit">Оставить отзыв</button></form>' : '<p class="muted">Отзывы могут оставлять авторизованные пользователи.</p><button class="button button-secondary" type="button" data-action="open-login">Войти, чтобы оставить отзыв</button>';
    return '<div class="about-page"><section class="about-hero page-shell"><div class="about-hero-copy"><p class="eyebrow">Пространство для взаимного роста</p><h1>SkillSwap — обменивайся навыками, делись опытом, развивайся вместе</h1><p>Находи людей, у которых можно научиться новому, и делись собственными знаниями.</p><div class="hero-actions"><button class="button button-primary" type="button" data-route="explore">Начать обмен <span aria-hidden="true">→</span></button><button class="button button-secondary" type="button" data-about-scroll="about-platform">Как это работает <span aria-hidden="true">↓</span></button></div></div><div class="about-hero-art" aria-label="Схема обмена навыками"><div class="about-orbit about-orbit-a"><span>Дизайн</span><b>↗</b></div><div class="about-orbit about-orbit-b"><span>Английский</span><b>↙</b></div><div class="about-art-center">⇄<small>обмен</small></div><div class="about-art-tag">люди · навыки · опыт</div></div></section><nav class="about-subnav" aria-label="Разделы о SkillSwap"><div><a href="#about-platform" data-route="about" data-about-section="about-platform">О платформе</a><a href="#about-faq" data-route="about" data-about-section="about-faq">FAQ</a><a href="#about-contacts" data-route="about" data-about-section="about-contacts">Контакты</a><a href="#about-reviews" data-route="about" data-about-section="about-reviews">Отзывы</a></div></nav><section class="page-shell about-section" id="about-platform"><div class="about-intro"><div><p class="eyebrow">Что такое SkillSwap?</p><h2>Знания растут, когда ими делятся</h2></div><p>SkillSwap — платформа для поиска людей, обмена навыками, общения и совместного обучения. Здесь можно предложить свои умения, найти подходящего собеседника и развиваться через взаимность.</p></div><div class="about-section-heading"><p class="eyebrow">Путь от интереса к обмену</p><h2>Как работает платформа</h2></div><div class="about-steps">' + steps.map(function (step) { return '<article class="about-step"><span class="about-step-icon">' + step[3] + '</span><small>' + step[0] + '</small><h3>' + step[1] + '</h3><p>' + step[2] + '</p></article>'; }).join('') + '</div><div class="about-section-heading"><p class="eyebrow">Зачем присоединяться</p><h2>Преимущества SkillSwap</h2></div><div class="benefits-grid">' + benefits.map(function (benefit, index) { return '<article class="benefit-item"><span>' + ['✦', '◌', '⌕', '✉', '↗', '⇄'][index] + '</span><strong>' + benefit + '</strong></article>'; }).join('') + '</div></section><section class="page-shell about-section" id="about-faq"><div class="about-section-heading"><p class="eyebrow">Ответы рядом</p><h2>Часто задаваемые вопросы</h2><p>Коротко о том, как устроен обмен навыками.</p></div><div class="about-faq-list">' + faq.map(function (item) { return '<details><summary>' + item[0] + '<span aria-hidden="true">+</span></summary><p>' + item[1] + '</p></details>'; }).join('') + '</div></section><section class="page-shell about-section" id="about-contacts"><div class="about-section-heading"><p class="eyebrow">Мы на связи</p><h2>Свяжитесь с нами</h2><p>Не нашли ответ? Опишите вопрос, и обращение сохранится в этом браузере для вашего аккаунта.</p></div>' + (state.contactNotice ? '<div class="success-banner"><span aria-hidden="true">✓</span><strong>Обращение сохранено в этом браузере.</strong></div>' : '') + '<div class="contact-layout"><div class="contact-card"><span class="contact-card-icon">✉</span><h3>Контактный адрес</h3><p>support@skillswap.com</p><a class="button button-quiet" href="mailto:support@skillswap.com">Написать нам</a></div><form id="contact-form" class="form-panel about-contact-form" novalidate><div class="form-grid"><div class="form-field"><label for="contact-name">Имя</label><input id="contact-name" name="name" required value="' + escapeHTML(currentUser ? state.profile.name : '') + '"><span class="field-error" data-error="name"></span></div><div class="form-field"><label for="contact-email">Электронная почта</label><input id="contact-email" name="email" type="email" required value="' + escapeHTML(currentUser ? currentUser.email : '') + '"><span class="field-error" data-error="email"></span></div><div class="form-field full"><label for="contact-subject">Тема обращения</label><select id="contact-subject" name="subject" required><option value="">Выберите тему</option><option>Вопрос о платформе</option><option>Проблема с аккаунтом</option><option>Предложение по улучшению</option><option>Другое</option></select><span class="field-error" data-error="subject"></span></div><div class="form-field full"><label for="contact-message">Сообщение</label><textarea id="contact-message" name="message" required maxlength="1000" placeholder="Напишите нам..."></textarea><span class="field-error" data-error="message"></span></div></div><button class="button button-primary" type="submit">Отправить сообщение</button></form></div></section><section class="page-shell about-section" id="about-reviews"><div class="about-section-heading"><p class="eyebrow">Опыт сообщества</p><h2>Отзывы пользователей</h2><p>Демо-отзывы отмечены как примеры. Новые отзывы сохраняются локально.</p></div>' + reviewNotice + '<div class="reviews-grid">' + reviews.map(function (review) { return '<article class="review-card"><div class="review-top">' + avatar(review.author, '#7886ed', 'avatar-small') + '<div><strong>' + escapeHTML(review.author) + '</strong><time>' + new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(review.createdAt)) + '</time></div></div><div class="review-stars" aria-label="Оценка: ' + review.rating + ' из 5">' + '★'.repeat(Number(review.rating || 0)) + '<span>' + '★'.repeat(5 - Number(review.rating || 0)) + '</span></div><p>' + escapeHTML(review.text) + '</p>' + (review.demo ? '<small class="review-demo-label">Демо-отзыв</small>' : '') + '</article>'; }).join('') + '</div><div class="review-form-panel"><h3>Оставить отзыв</h3>' + reviewForm + '</div></section><section class="about-cta" id="about-join"><div><p class="eyebrow">Твоя следующая история</p><h2>Готов поделиться знаниями и освоить что-то новое?</h2><p>Присоединяйся к SkillSwap, находи единомышленников и развивайся вместе с другими.</p></div><button class="button button-primary" type="button" data-action="about-join">Присоединиться <span aria-hidden="true">→</span></button></section></div>';
  }

  function addWriteButtons() {
    root.querySelectorAll('.skill-card').forEach(function (card) {
      const details = card.querySelector('[data-action="details"]');
      if (!details) return;
      const offer = state.offers.find(function (item) { return item.id === details.dataset.id; });
      const userId = offer && resolveOfferUserId(offer);
      if (!offer || !userId) return;
      const writeButton = document.createElement('button');
      writeButton.className = 'button button-quiet write-button';
      writeButton.type = 'button';
      writeButton.dataset.action = 'start-chat';
      writeButton.dataset.userId = userId;
      writeButton.dataset.offerId = offer.id;
      writeButton.textContent = 'Написать';
      details.parentElement.insertBefore(writeButton, details.nextSibling);
    });
  }

  function addModerationButtons() {
    root.querySelectorAll('.skill-card').forEach(function (card) {
      const details = card.querySelector('[data-action="details"]');
      if (!details) return;
      const offer = state.offers.find(function (item) { return item.id === details.dataset.id; });
      if (!offer) return;
      const ownerId = resolveOfferUserId(offer);
      const actionButton = document.createElement('button');
      actionButton.className = 'button button-quiet moderation-button';
      actionButton.type = 'button';
      if (currentUser && ownerId === currentUser.id) {
        actionButton.dataset.action = 'delete-offer';
        actionButton.dataset.id = offer.id;
        actionButton.setAttribute('aria-label', 'Удалить предложение');
        actionButton.textContent = 'Удалить';
      } else {
        actionButton.classList.add('report-button');
        actionButton.dataset.action = 'report-offer';
        actionButton.dataset.id = offer.id;
        actionButton.setAttribute('aria-label', 'Пожаловаться на предложение');
        actionButton.title = 'Пожаловаться';
        actionButton.textContent = '⚑';
      }
      const hint = details.parentElement.querySelector('.card-hint');
      if (hint) details.parentElement.insertBefore(actionButton, hint);
      else details.parentElement.appendChild(actionButton);
    });
  }

  function addChatReportButton() {
    if (state.view !== 'messages' || !state.activeChatId) return;
    const header = root.querySelector('.chat-header');
    if (!header) return;
    const reportButton = document.createElement('button');
    reportButton.className = 'button button-quiet chat-report-button';
    reportButton.type = 'button';
    reportButton.dataset.action = 'report-dialog';
    reportButton.dataset.id = state.activeChatId;
    reportButton.setAttribute('aria-label', 'Пожаловаться на диалог');
    reportButton.textContent = 'Пожаловаться';
    header.appendChild(reportButton);
  }

  function prepareImageTransitions(container) {
    container.querySelectorAll('img').forEach(function (image) {
      image.classList.add('media-image');
      if (image.complete && image.naturalWidth > 0) image.classList.add('is-loaded');
    });
  }

  function render() {
    updateNavigation();
    const views = { home: renderHome, overview: renderOverview, explore: renderExplore, create: renderCreate, matches: renderMatches, favorites: renderFavorites, profile: renderProfile, about: renderAbout };
    views.messages = renderMessages;
    views.support = renderSupport;
    root.innerHTML = (views[state.view] || renderHome)();
    if (state.view === 'about') {
      const platformSection = root.querySelector('#about-platform');
      const aboutSubnav = root.querySelector('.about-subnav > div');
      if (platformSection) platformSection.insertAdjacentHTML('afterend', renderCreatorsSection());
      if (aboutSubnav) aboutSubnav.insertAdjacentHTML('beforeend', '<a href="#about-creators" data-route="about" data-about-section="about-creators">Создатели</a>');
      prepareImageTransitions(root);
      observeCreatorsSection();
    }
    if (state.view === 'home') {
      const homeOffersSection = root.querySelector('.home-offers-section');
      if (homeOffersSection) homeOffersSection.insertAdjacentHTML('beforebegin', renderHomeSupport());
    }
    if (state.view === 'create') {
      root.querySelector('#offer-teach').setAttribute('list', 'skill-options');
      root.querySelector('#offer-learn').setAttribute('list', 'skill-options');
      const categorySelect = root.querySelector('#offer-category');
      ['Программирование', 'Дизайн', 'Языки', 'Готовка', 'Рукоделие', 'Пчеловодство', 'Фотография', 'Музыка', 'Спорт', 'Садоводство', 'Технологии', 'Другое', 'Карьера', 'Фото и видео', 'Саморазвитие', 'Коммуникация', 'Хобби'].forEach(function (category) {
        if (Array.from(categorySelect.options).some(function (option) { return option.value === category; })) return;
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
      root.insertAdjacentHTML('beforeend', skillOptionsMarkup());
    }
    if (state.view === 'profile') {
      root.querySelectorAll('.profile-skill-box').forEach(function (box) {
        const empty = box.querySelector('.muted');
        if (!empty) return;
        empty.textContent = 'Вы ещё не указали навыки';
        const addButton = document.createElement('button');
        addButton.className = 'text-link profile-add-skill';
        addButton.type = 'button';
        addButton.dataset.action = 'edit-profile';
        addButton.textContent = 'Добавить навык';
        box.appendChild(addButton);
      });
    }
    if (['home', 'explore', 'matches', 'favorites', 'profile'].includes(state.view)) {
      addWriteButtons();
      addModerationButtons();
    }
    addChatReportButton();
    addPresenceLabels(root);
    prepareImageTransitions(root);
    root.setAttribute('aria-busy', 'false');
  }

  function toggleFavorite(id) {
    if (!currentUser) {
      openAuthPrompt('Чтобы добавить предложение в избранное, необходимо войти в аккаунт.');
      return;
    }
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
    const detailActions = modalContent.querySelector('.modal-actions');
    const detailOwnerId = resolveOfferUserId(offer);
    const detailButton = document.createElement('button');
    detailButton.className = 'button button-quiet';
    detailButton.type = 'button';
    detailButton.dataset.id = offer.id;
    if (currentUser && detailOwnerId === currentUser.id) {
      detailButton.dataset.action = 'delete-offer';
      detailButton.textContent = 'Удалить предложение';
    } else {
      detailButton.classList.add('report-button');
      detailButton.dataset.action = 'report-offer';
      detailButton.setAttribute('aria-label', 'Пожаловаться на предложение');
      detailButton.title = 'Пожаловаться';
      detailButton.textContent = '⚑';
    }
    detailActions.appendChild(detailButton);
    addPresenceLabels(modalContent);
    prepareImageTransitions(modalContent);
    modal.showModal();
  }

  function openProfileEditor() {
    modalContent.innerHTML = '<button class="modal-close" type="button" data-action="close-modal" aria-label="Закрыть">×</button><p class="eyebrow">Профиль сообщества</p><h2>Расскажи о себе</h2><form id="profile-form" novalidate><div class="form-grid"><div class="form-field full"><label for="profile-name">Имя</label><input id="profile-name" name="name" required maxlength="50" value="' + escapeHTML(state.profile.name) + '"><span class="field-error" data-error="name"></span></div><div class="form-field full"><label for="profile-city">Город</label><input id="profile-city" name="city" maxlength="50" value="' + escapeHTML(state.profile.city || '') + '"></div><div class="form-field full"><label for="profile-about">О себе</label><textarea id="profile-about" name="about" maxlength="220">' + escapeHTML(state.profile.about || '') + '</textarea></div><div class="form-field full"><label for="profile-teach">Могу поделиться навыками</label><input id="profile-teach" name="teachSkills" maxlength="180" value="' + escapeHTML((state.profile.teachSkills || []).join(', ')) + '"><span class="form-hint">Перечисли через запятую.</span></div><div class="form-field full"><label for="profile-learn">Хочу научиться</label><input id="profile-learn" name="learnSkills" maxlength="180" value="' + escapeHTML((state.profile.learnSkills || []).join(', ')) + '"><span class="form-hint">По этим навыкам мы найдём взаимные совпадения.</span></div></div><div class="form-actions"><button class="button button-secondary" type="button" data-action="close-modal">Отмена</button><button class="button button-primary" type="submit">Сохранить профиль</button></div></form>';
    const avatarUrl = state.profile.avatarUrl || '';
    const avatarOptions = avatarPresets.map(function (photo, index) {
      return '<button class="avatar-option" type="button" data-avatar-choice="' + escapeHTML(photo) + '" aria-label="Выбрать фото ' + (index + 1) + '" aria-pressed="' + String(avatarUrl === photo) + '"><img src="' + escapeHTML(photo) + '" alt="" loading="lazy"></button>';
    }).join('');
    const avatarPicker = '<div class="avatar-picker"><div class="avatar-editor"><div class="avatar-preview" id="avatar-preview">' + (avatarUrl ? '<img src="' + escapeHTML(avatarUrl) + '" alt="Предпросмотр фото профиля">' : escapeHTML(initials(state.profile.name))) + '</div><div class="avatar-editor-copy"><strong>Фото профиля</strong><p>Выбери портрет или загрузи своё изображение.</p><label class="button button-secondary avatar-upload">Загрузить фото<input id="profile-avatar-file" type="file" accept="image/*"></label></div></div><div class="avatar-options" aria-label="Доступные фотографии">' + avatarOptions + '</div></div>';
    const profileForm = modalContent.querySelector('#profile-form');
    profileForm.dataset.avatarUrl = avatarUrl;
    profileForm.querySelector('.form-grid').insertAdjacentHTML('beforebegin', avatarPicker);
    modalContent.querySelector('#profile-teach').setAttribute('list', 'skill-options');
    modalContent.querySelector('#profile-learn').setAttribute('list', 'skill-options');
    modalContent.insertAdjacentHTML('beforeend', skillOptionsMarkup());
    prepareImageTransitions(modalContent);
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
      userId: currentUser.id, ownerId: currentUser.id, userName: values.name, city: city, teach: values.teach, learn: values.learn,
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
      avatarUrl: form.dataset.avatarUrl || '',
      teachSkills: uniqueSkills(formValue(form, 'teachSkills').split(',')),
      learnSkills: uniqueSkills(formValue(form, 'learnSkills').split(','))
    });
    currentUser.name = name;
    storage.saveCurrentUser({ id: currentUser.id, name: name, email: currentUser.email });
    persistProfile();
    modal.close();
    render();
    showToast('Профиль обновлён.', 'success');
  }

  function setAvatarSelection(imageUrl) {
    const form = modalContent.querySelector('#profile-form');
    const preview = modalContent.querySelector('#avatar-preview');
    if (!form || !preview) return;
    form.dataset.avatarUrl = imageUrl;
    preview.innerHTML = imageUrl ? '<img src="' + escapeHTML(imageUrl) + '" alt="Предпросмотр фото профиля">' : escapeHTML(initials(formValue(form, 'name')));
    prepareImageTransitions(preview);
    modalContent.querySelectorAll('[data-avatar-choice]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.avatarChoice === imageUrl));
    });
  }

  function processAvatarFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Выбери файл изображения.', 'error'); return; }
    if (file.size > 8 * 1024 * 1024) { showToast('Размер изображения не должен превышать 8 МБ.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = function () {
      const source = new Image();
      source.onload = function () {
        const cropSize = Math.min(source.naturalWidth, source.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 320;
        canvas.getContext('2d').drawImage(source, (source.naturalWidth - cropSize) / 2, (source.naturalHeight - cropSize) / 2, cropSize, cropSize, 0, 0, 320, 320);
        canvas.toBlob(function (blob) {
          if (!blob) { showToast('Не удалось обработать это изображение.', 'error'); return; }
          const compressed = new FileReader();
          compressed.onload = function () { setAvatarSelection(compressed.result); };
          compressed.readAsDataURL(blob);
        }, 'image/jpeg', 0.82);
      };
      source.onerror = function () { showToast('Не удалось открыть это изображение.', 'error'); };
      source.src = reader.result;
    };
    reader.onerror = function () { showToast('Не удалось прочитать этот файл.', 'error'); };
    reader.readAsDataURL(file);
  }

  function clearFilters() {
    state.filters = {};
    state.activeMood = null;
    saveSettings();
    render();
  }

  function startChat(userId, offerId) {
    currentUser = storage.getCurrentUser();
    if (!currentUser) {
      openAuthPrompt('Чтобы написать пользователю, необходимо войти в аккаунт.');
      return;
    }
    if (!userId) {
      openAuthPrompt('Не удалось определить пользователя этого предложения.');
      return;
    }
    if (userId === currentUser.id) {
      openInfoModal('Нельзя начать чат с самим собой.');
      return;
    }
    const offer = state.offers.find(function (item) { return item.id === offerId; });
    const targetUser = getTargetUser(userId, offer);
    if (!targetUser) {
      openInfoModal('Пользователь этого предложения больше недоступен.');
      return;
    }
    let chat = state.chats.find(function (item) { return item.participants.includes(currentUser.id) && item.participants.includes(userId); });
    if (!chat) {
      chat = { id: 'chat-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7), participants: [currentUser.id, userId], partnerName: targetUser.name, offerId: offerId || null, messages: [], createdAt: new Date().toISOString() };
      state.chats.push(chat);
      persistChats();
    } else if (offerId && !chat.offerId) {
      chat.offerId = offerId;
      persistChats();
    }
    state.activeChatId = chat.id;
    goTo('messages');
  }

  function onChatSubmit(form) {
    const text = formValue(form, 'text');
    if (!text || !state.activeChatId) return;
    const chat = state.chats.find(function (item) { return item.id === state.activeChatId; });
    if (!chat) return;
    const receiverId = chatPartner(chat);
    chat.messages.push({ id: 'message-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7), senderId: currentUser.id, receiverId: receiverId, text: text, timestamp: new Date().toISOString(), readBy: [currentUser.id] });
    persistChats();
    render();
    const input = root.querySelector('#chat-form input[name="text"]');
    if (input) input.focus();
  }

  function onSupportSubmit(form) {
    const subject = formValue(form, 'subject');
    const message = formValue(form, 'message');
    showFieldError(form, 'subject', subject ? '' : 'Выберите тему.');
    showFieldError(form, 'message', message ? '' : 'Опишите проблему.');
    if (!subject || !message) return;
    state.support.push({ id: 'ticket-' + Date.now().toString(36), userId: currentUser ? currentUser.id : 'guest', subject: subject, message: message, status: 'new', createdAt: new Date().toISOString() });
    persistSupport();
    state.supportNotice = true;
    render();
  }

  function onContactSubmit(form) {
    const name = formValue(form, 'name');
    const email = formValue(form, 'email').toLocaleLowerCase('ru');
    const subject = formValue(form, 'subject');
    const message = formValue(form, 'message');
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    showFieldError(form, 'name', name ? '' : 'Укажите имя.');
    showFieldError(form, 'email', emailValid ? '' : 'Укажите корректный email.');
    showFieldError(form, 'subject', subject ? '' : 'Выберите тему.');
    showFieldError(form, 'message', message ? '' : 'Напишите сообщение.');
    if (!name || !emailValid || !subject || !message) return;
    state.support.push({ id: 'contact-' + Date.now().toString(36), userId: currentUser ? currentUser.id : 'guest', name: name, email: email, subject: 'Контакты: ' + subject, message: message, status: 'new', createdAt: new Date().toISOString() });
    persistSupport();
    state.contactNotice = true;
    state.aboutSection = 'about-contacts';
    render();
  }

  function onReviewSubmit(form) {
    if (!currentUser) { openAuthPrompt('Чтобы оставить отзыв, необходимо войти в аккаунт.'); return; }
    const rating = formValue(form, 'rating');
    const text = formValue(form, 'text');
    showFieldError(form, 'text', text ? '' : 'Напишите отзыв.');
    if (!rating || !text) return;
    state.reviews.push({ id: 'review-' + Date.now().toString(36), userId: currentUser.id, author: state.profile.name || currentUser.name, text: text, rating: Number(rating), createdAt: new Date().toISOString(), demo: false });
    persistReviews();
    state.reviewNotice = true;
    state.aboutSection = 'about-reviews';
    render();
  }

  document.addEventListener('click', function (event) {
    const homeFeature = event.target.closest('[data-home-feature]');
    if (homeFeature) {
      state.homeFeature = homeFeature.dataset.homeFeature;
      render();
      return;
    }
    const categoryFilter = event.target.closest('[data-category-filter]');
    if (categoryFilter) {
      state.filters = Object.assign({}, state.filters, { category: categoryFilter.dataset.categoryFilter, query: '' });
      state.activeMood = null;
      goTo('explore');
      return;
    }
    const route = event.target.closest('[data-route]');
    if (route) {
      event.preventDefault();
      if (route.dataset.route === 'explore-reset') clearFilters();
      else {
        if (route.dataset.aboutSection) state.aboutSection = route.dataset.aboutSection;
        goTo(route.dataset.route);
      }
      return;
    }
    const aboutScroll = event.target.closest('[data-about-scroll]');
    if (aboutScroll) {
      state.aboutSection = aboutScroll.dataset.aboutScroll;
      const section = document.getElementById(state.aboutSection);
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const faqSummary = event.target.closest('.about-faq-list summary');
    if (faqSummary) {
      document.querySelectorAll('.about-faq-list details').forEach(function (item) {
        if (item !== faqSummary.parentElement) item.removeAttribute('open');
      });
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
    const avatarChoice = event.target.closest('[data-avatar-choice]');
    if (avatarChoice) { setAvatarSelection(avatarChoice.dataset.avatarChoice); return; }
    if (!action) return;
    if (action.dataset.action === 'open-login') { openAuthModal('login'); return; }
    if (action.dataset.action === 'open-register') { openAuthModal('register'); return; }
    if (action.dataset.action === 'confirm-registration') { completeRegistration(); return; }
    if (action.dataset.action === 'cancel-registration') { state.pendingRegistration = null; modal.close(); return; }
    if (action.dataset.action === 'toggle-account') { document.getElementById('account-menu').classList.toggle('is-open'); return; }
    if (action.dataset.action === 'logout') { storage.clearCurrentUser(); window.location.reload(); return; }
    if (action.dataset.action === 'delete-offer') { openDeleteConfirmation(action.dataset.id); return; }
    if (action.dataset.action === 'confirm-delete') { deleteOffer(state.pendingDeleteOfferId); return; }
    if (action.dataset.action === 'report-offer') { openReportModal('offer', action.dataset.id); return; }
    if (action.dataset.action === 'report-dialog') { openReportModal('dialog', action.dataset.id); return; }
    if (action.dataset.action === 'start-chat') { startChat(action.dataset.userId, action.dataset.offerId); return; }
    if (action.dataset.action === 'open-chat') { state.activeChatId = action.dataset.id; goTo('messages'); return; }
    if (action.dataset.action === 'about-join') { if (currentUser) goTo('explore'); else openAuthModal('register'); return; }
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
        modal.close();
        goTo('create');
        showToast('Выбери навыки для нового предложения.', 'success');
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
    if (event.target.id === 'agreement-accept') {
      const confirmButton = modalContent.querySelector('[data-action="confirm-registration"]');
      if (confirmButton) confirmButton.disabled = !event.target.checked;
      return;
    }
    if (event.target.id === 'profile-avatar-file') {
      processAvatarFile(event.target.files && event.target.files[0]);
      event.target.value = '';
      return;
    }
    if (event.target.matches('[data-filter]') && event.target.dataset.filter !== 'query') {
      state.filters[event.target.dataset.filter] = event.target.value;
      saveSettings();
      render();
    }
  });

  document.addEventListener('submit', function (event) {
    if (event.target.id === 'login-form') { event.preventDefault(); onAuthSubmit(event.target, false); }
    if (event.target.id === 'register-form') { event.preventDefault(); onAuthSubmit(event.target, true); }
    if (event.target.id === 'offer-form') { event.preventDefault(); onOfferSubmit(event.target); }
    if (event.target.id === 'profile-form') { event.preventDefault(); onProfileSubmit(event.target); }
    if (event.target.id === 'chat-form') { event.preventDefault(); onChatSubmit(event.target); }
    if (event.target.id === 'support-form') { event.preventDefault(); onSupportSubmit(event.target); }
    if (event.target.id === 'contact-form') { event.preventDefault(); onContactSubmit(event.target); }
    if (event.target.id === 'review-form') { event.preventDefault(); onReviewSubmit(event.target); }
    if (event.target.id === 'report-form') { event.preventDefault(); onReportSubmit(event.target); }
  });

  mobileMenu.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('is-open');
    mobileMenu.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  document.addEventListener('keydown', function (event) {
    const activeTab = event.target.closest('[data-home-feature]');
    if (!activeTab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = Array.from(root.querySelectorAll('[data-home-feature]'));
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (currentIndex + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    event.preventDefault();
    state.homeFeature = tabs[nextIndex].dataset.homeFeature;
    render();
    root.querySelector('[data-home-feature="' + state.homeFeature + '"]').focus();
  });

  modal.addEventListener('click', function (event) {
    if (event.target === modal) modal.close();
  });

  modal.addEventListener('close', function () { state.detailOfferId = null; });

  document.addEventListener('load', function (event) {
    if (event.target instanceof HTMLImageElement) event.target.classList.add('media-image', 'is-loaded');
  }, true);

  render();
})();