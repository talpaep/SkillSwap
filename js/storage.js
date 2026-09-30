(function () {
  const KEYS = {
    users: 'skillswap_users',
    currentUser: 'skillswap_current_user',
    offers: 'skillswap_offers',
    favorites: 'skillswap_favorites',
    profiles: 'skillswap_profiles',
    settings: 'skillswap_settings',
    chats: 'skillswap_chats',
    support: 'skillswap_support',
    reviews: 'skillswap_reviews'
  };

  function read(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.warn('Не удалось прочитать данные SkillSwap:', error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Не удалось сохранить данные SkillSwap:', error);
      return false;
    }
  }

  function initialize(data) {
    try {
      if (window.localStorage.getItem(KEYS.users) === null) write(KEYS.users, data.demoUsers);
      if (window.localStorage.getItem(KEYS.offers) === null) write(KEYS.offers, data.demoOffers);
      if (window.localStorage.getItem(KEYS.favorites) === null) write(KEYS.favorites, {});
      if (window.localStorage.getItem(KEYS.profiles) === null) write(KEYS.profiles, data.demoProfiles);
      if (window.localStorage.getItem(KEYS.settings) === null) write(KEYS.settings, {});
      if (window.localStorage.getItem(KEYS.chats) === null) write(KEYS.chats, []);
      if (window.localStorage.getItem(KEYS.support) === null) write(KEYS.support, []);
      if (window.localStorage.getItem(KEYS.reviews) === null) write(KEYS.reviews, data.demoReviews || []);
    } catch (error) {
      console.warn('Локальное хранилище недоступно; приложение продолжит работу без сохранения.', error);
    }
  }

  function loadData(data) {
    initialize(data);
    const currentUser = getCurrentUser();
    return currentUser ? {
      offers: getOffers(),
      favorites: getFavorites(currentUser.id),
      profile: getProfile(currentUser.id),
      settings: getSettings(currentUser.id)
    } : null;
  }

  function getUsers() { const result = read(KEYS.users, []); return Array.isArray(result) ? result : []; }
  function saveUsers(users) { return write(KEYS.users, users); }
  function getCurrentUser() { return read(KEYS.currentUser, null); }
  function saveCurrentUser(user) { return write(KEYS.currentUser, user); }
  function clearCurrentUser() { try { window.localStorage.removeItem(KEYS.currentUser); return true; } catch (error) { return false; } }
  function getOffers() { const result = read(KEYS.offers, []); return Array.isArray(result) ? result : []; }
  function saveOffers(offers) { return write(KEYS.offers, offers); }
  function getFavorites(userId) { const result = read(KEYS.favorites, {}); return Array.isArray(result) ? result : (result[userId] || []); }
  function saveFavorites(userId, favorites) { const all = read(KEYS.favorites, {}); all[userId] = favorites; return write(KEYS.favorites, all); }
  function getProfiles() { return read(KEYS.profiles, {}); }
  function getProfile(userId) { const profiles = getProfiles(); return profiles[userId] || null; }
  function saveProfile(userId, profile) { const profiles = getProfiles(); profiles[userId] = profile; return write(KEYS.profiles, profiles); }
  function getSettings(userId) { const settings = read(KEYS.settings, {}); return settings[userId] || { activeView: 'home', activeMood: null, filters: {} }; }
  function saveSettings(userId, value) { const settings = read(KEYS.settings, {}); settings[userId] = value; return write(KEYS.settings, settings); }
  function getChats() { const result = read(KEYS.chats, []); return Array.isArray(result) ? result : []; }
  function saveChats(chats) { return write(KEYS.chats, chats); }
  function getSupport() { const result = read(KEYS.support, []); return Array.isArray(result) ? result : []; }
  function saveSupport(tickets) { return write(KEYS.support, tickets); }
  function getReviews() { const result = read(KEYS.reviews, []); return Array.isArray(result) ? result : []; }
  function saveReviews(reviews) { return write(KEYS.reviews, reviews); }
  function saveData(data) {
    return saveOffers(data.offers) && saveFavorites(data.userId, data.favorites) && saveProfile(data.userId, data.profile) && saveSettings(data.userId, data.settings);
  }

  window.SkillSwapStorage = {
    loadData: loadData,
    getUsers: getUsers,
    saveUsers: saveUsers,
    getCurrentUser: getCurrentUser,
    saveCurrentUser: saveCurrentUser,
    clearCurrentUser: clearCurrentUser,
    saveData: saveData,
    getOffers: getOffers,
    saveOffers: saveOffers,
    getFavorites: getFavorites,
    saveFavorites: saveFavorites,
    getProfile: getProfile,
    saveProfile: saveProfile,
    getSettings: getSettings,
    saveSettings: saveSettings,
    getChats: getChats,
    saveChats: saveChats,
    getSupport: getSupport,
    saveSupport: saveSupport,
    getReviews: getReviews,
    saveReviews: saveReviews,
    initialize: initialize
  };
})();