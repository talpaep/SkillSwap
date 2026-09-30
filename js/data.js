(function () {
  const demoOffers = [
    { id: 'demo-alice', userName: 'Алиса М.', city: 'Алматы', teach: 'Photoshop', learn: 'Английский', category: 'Дизайн', level: 'Средний', format: 'Онлайн', description: 'Покажу, как уверенно работать со слоями, масками и цветом. Ищу партнёра для разговорной практики.', availability: 'Будни после 19:00', color: '#ef8d77' },
    { id: 'demo-daniyar', userName: 'Данияр К.', city: 'Астана', teach: 'Английский', learn: 'Photoshop', category: 'Языки', level: 'Продвинутый', format: 'Онлайн', description: 'Помогаю разговориться без зубрёжки: обсуждаем фильмы, работу и повседневные темы.', availability: 'Вечера, 2 раза в неделю', color: '#6d82dc' },
    { id: 'demo-alina', userName: 'Алина Р.', city: 'Шымкент', teach: 'Python', learn: 'Дизайн интерфейсов', category: 'Карьера', level: 'Продвинутый', format: 'Онлайн', description: 'Разберём основы Python на небольших проектах. Буду рада обменяться опытом в дизайне.', availability: 'Суббота и воскресенье', color: '#74a78c' },
    { id: 'demo-maxim', userName: 'Максим Т.', city: 'Алматы', teach: 'Гитара', learn: 'Английский', category: 'Музыка', level: 'Средний', format: 'Очно', description: 'Научу поставить аккорды и сыграть любимую песню. Английский практикую для путешествий.', availability: 'По будням после 18:00', color: '#d59a54' },
    { id: 'demo-sofia', userName: 'София Л.', city: 'Караганда', teach: 'Фотография', learn: 'Видеомонтаж', category: 'Фото и видео', level: 'Продвинутый', format: 'Очно', description: 'Помогу видеть свет и ловить живые кадры. Хочу освоить динамичный монтаж роликов.', availability: 'Выходные днём', color: '#ba79a1' },
    { id: 'demo-arman', userName: 'Арман Б.', city: 'Астана', teach: 'Видеомонтаж', learn: 'Python', category: 'Фото и видео', level: 'Средний', format: 'Онлайн', description: 'Научу собирать ролик в цельную историю: ритм, звук и чистые переходы.', availability: 'Вторник и четверг', color: '#4f9f9a' },
    { id: 'demo-madina', userName: 'Мадина С.', city: 'Алматы', teach: 'Иллюстрация', learn: 'Йога', category: 'Дизайн', level: 'Средний', format: 'Онлайн', description: 'Покажу основы композиции и помогу найти собственный стиль в цифровом рисунке.', availability: 'Вечера по договорённости', color: '#d7746d' },
    { id: 'demo-timur', userName: 'Тимур А.', city: 'Павлодар', teach: 'Йога', learn: 'Иллюстрация', category: 'Саморазвитие', level: 'Продвинутый', format: 'Очно', description: 'Практикуем мягкую йогу для начинающих и учимся слушать тело.', availability: 'Утро выходного дня', color: '#7b9d56' },
    { id: 'demo-evgenia', userName: 'Евгения Н.', city: 'Астана', teach: 'Figma', learn: 'Публичные выступления', category: 'Дизайн', level: 'Продвинутый', format: 'Онлайн', description: 'От первых фреймов до аккуратного прототипа. Вместе разберём твой учебный кейс.', availability: 'Среда и пятница вечером', color: '#7880c5' },
    { id: 'demo-ilya', userName: 'Илья В.', city: 'Костанай', teach: 'Публичные выступления', learn: 'Figma', category: 'Карьера', level: 'Средний', format: 'Онлайн', description: 'Помогу структурировать мысли, убрать зажим и уверенно выступить перед аудиторией.', availability: 'По воскресеньям', color: '#b28150' },
    { id: 'demo-nura', userName: 'Нурай Ж.', city: 'Тараз', teach: 'Испанский', learn: 'Фотография', category: 'Языки', level: 'Средний', format: 'Онлайн', description: 'Изучаем испанский через лёгкие диалоги и музыку, без ощущения урока.', availability: 'Понедельник и четверг', color: '#5c9aaf' },
    { id: 'demo-pavel', userName: 'Павел Д.', city: 'Алматы', teach: 'Монтаж видео', learn: 'Испанский', category: 'Фото и видео', level: 'Начинающий', format: 'Очно', description: 'Смонтируем первое короткое видео и разберёмся с базовым звуком и титрами.', availability: 'Суббота после обеда', color: '#9a79bb' }
  ];

  demoOffers.forEach(function (offer, index) { offer.userId = 'demo-user-' + ((index % 3) + 1); });

  const demoUsers = [
    { id: 'demo-user-1', name: 'Алиса М.', email: 'alice@skillswap.local', password: 'demo123' },
    { id: 'demo-user-2', name: 'Данияр К.', email: 'daniyar@skillswap.local', password: 'demo123' },
    { id: 'demo-user-3', name: 'Алина Р.', email: 'alina@skillswap.local', password: 'demo123' }
  ];

  const demoProfiles = {
    'demo-user-1': { name: 'Алиса М.', email: 'alice@skillswap.local', city: 'Алматы', about: 'Люблю узнавать новое и делиться тем, что уже умею.', teachSkills: ['Photoshop'], learnSkills: ['Английский'], color: '#ef8d77' },
    'demo-user-2': { name: 'Данияр К.', email: 'daniyar@skillswap.local', city: 'Астана', about: 'Помогаю практиковать языки через живое общение.', teachSkills: ['Английский'], learnSkills: ['Photoshop'], color: '#6d82dc' },
    'demo-user-3': { name: 'Алина Р.', email: 'alina@skillswap.local', city: 'Шымкент', about: 'Разбираю сложные задачи на небольшие проекты.', teachSkills: ['Python'], learnSkills: ['Дизайн интерфейсов'], color: '#74a78c' }
  };

  const defaultProfile = {
    name: '',
    city: '',
    about: '',
    teachSkills: [],
    learnSkills: [],
    color: '#6575e8'
  };

  const moods = [
    { id: 'create', emoji: '🎨', title: 'Хочу творить', hint: 'Дизайн, фото, музыка', categories: ['Дизайн', 'Фото и видео', 'Музыка'] },
    { id: 'career', emoji: '💻', title: 'Хочу прокачать карьеру', hint: 'Код, продукт, навыки', categories: ['Карьера', 'Дизайн'] },
    { id: 'languages', emoji: '🌍', title: 'Хочу изучать языки', hint: 'Новые слова и люди', categories: ['Языки'] },
    { id: 'growth', emoji: '🧠', title: 'Хочу развиваться', hint: 'Практики и идеи', categories: ['Саморазвитие', 'Карьера'] },
    { id: 'hobby', emoji: '🎵', title: 'Хочу новое хобби', hint: 'Музыка, йога, фото', categories: ['Музыка', 'Саморазвитие', 'Фото и видео'] },
    { id: 'people', emoji: '🤝', title: 'Хочу познакомиться и обменяться опытом', hint: 'Знакомства по интересам', categories: ['Коммуникация', 'Карьера', 'Языки'] }
  ];

  window.SkillSwapData = { demoOffers: demoOffers, demoUsers: demoUsers, demoProfiles: demoProfiles, defaultProfile: defaultProfile, moods: moods };
})();