(function () {
  const KEYS = {
    offers: 'skillswap.offers.v1',
    favorites: 'skillswap.favorites.v1',
    profile: 'skillswap.profile.v1',
    settings: 'skillswap.settings.v1'
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
      if (window.localStorage.getItem(KEYS.offers) === null) write(KEYS.offers, data.demoOffers);
      if (window.localStorage.getItem(KEYS.favorites) === null) write(KEYS.favorites, []);
      if (window.localStorage.getItem(KEYS.profile) === null) write(KEYS.profile, data.defaultProfile);
      if (window.localStorage.getItem(KEYS.settings) === null) write(KEYS.settings, { activeView: 'home', activeMood: null, filters: {} });
    } catch (error) {
      console.warn('Локальное хранилище недоступно; приложение продолжит работу без сохранения.', error);
    }
  }

  function loadData(data) {
    initialize(data);
    return { offers: getOffers(), favorites: getFavorites(), profile: getProfile(), settings: getSettings() };
  }

  function getOffers() { const result = read(KEYS.offers, []); return Array.isArray(result) ? result : []; }
  function saveOffers(offers) { return write(KEYS.offers, offers); }
  function getFavorites() { const result = read(KEYS.favorites, []); return Array.isArray(result) ? result : []; }
  function saveFavorites(favorites) { return write(KEYS.favorites, favorites); }
  function getProfile() { return read(KEYS.profile, null); }
  function saveProfile(profile) { return write(KEYS.profile, profile); }
  function getSettings() { return read(KEYS.settings, { activeView: 'home', activeMood: null, filters: {} }); }
  function saveSettings(settings) { return write(KEYS.settings, settings); }
  function saveData(data) {
    return write(KEYS.offers, data.offers) && write(KEYS.favorites, data.favorites) && write(KEYS.profile, data.profile) && write(KEYS.settings, data.settings);
  }

  window.SkillSwapStorage = {
    loadData: loadData,
    saveData: saveData,
    getOffers: getOffers,
    saveOffers: saveOffers,
    getFavorites: getFavorites,
    saveFavorites: saveFavorites,
    getProfile: getProfile,
    saveProfile: saveProfile,
    getSettings: getSettings,
    saveSettings: saveSettings
  };
})();