(function () {
  const communityPhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=82',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=82',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&h=160&q=82',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&h=160&q=82',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&h=160&q=82',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=82',
    'https://i.pravatar.cc/160?img=1', 'https://i.pravatar.cc/160?img=2', 'https://i.pravatar.cc/160?img=3',
    'https://i.pravatar.cc/160?img=4', 'https://i.pravatar.cc/160?img=5', 'https://i.pravatar.cc/160?img=6',
    'https://i.pravatar.cc/160?img=7', 'https://i.pravatar.cc/160?img=8', 'https://i.pravatar.cc/160?img=9',
    'https://i.pravatar.cc/160?img=10', 'https://i.pravatar.cc/160?img=11', 'https://i.pravatar.cc/160?img=12',
    'https://i.pravatar.cc/160?img=13', 'https://i.pravatar.cc/160?img=14', 'https://i.pravatar.cc/160?img=15',
    'https://i.pravatar.cc/160?img=16', 'https://i.pravatar.cc/160?img=17', 'https://i.pravatar.cc/160?img=18',
    'https://i.pravatar.cc/160?img=19', 'https://i.pravatar.cc/160?img=20', 'https://i.pravatar.cc/160?img=21',
    'https://i.pravatar.cc/160?img=22', 'https://i.pravatar.cc/160?img=23', 'https://i.pravatar.cc/160?img=24', 'https://i.pravatar.cc/160?img=25'
  ];
  const moodPhotos = [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=160&h=160&q=82',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=160&h=160&q=82',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=160&h=160&q=82',
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=160&h=160&q=82',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=160&h=160&q=82',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=160&h=160&q=82'
  ];
  const offerPhotos = [
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1454873019514-eae2f086587a?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1573500758697-c9cf976308d8?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=1000&h=700&q=88',
    'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1000&h=700&q=88'
  ];
  const demoOffers = [
    { id: 'demo-alice', userName: 'Алиса М.', city: 'Алматы', title: 'Научу готовить домашнюю пасту', teach: 'Готовка', learn: 'Английский', category: 'Готовка', level: 'Средний', format: 'Очно', description: 'Покажу, как приготовить тесто, соус и сделать настоящую домашнюю пасту.', availability: 'Будни после 19:00', imageUrl: offerPhotos[0], color: '#ef8d77' },
    { id: 'demo-daniyar', userName: 'Данияр К.', city: 'Астана', title: 'Покажу основы создания натурального мыла', teach: 'Мыловарение', learn: 'Дизайн', category: 'Рукоделие', level: 'Продвинутый', format: 'Онлайн', description: 'Разберём масла, ароматы и безопасную основу, а затем вместе сделаем первое мыло.', availability: 'Вечера, два раза в неделю', imageUrl: offerPhotos[1], color: '#6d82dc' },
    { id: 'demo-alina', userName: 'Алина Р.', city: 'Шымкент', title: 'Расскажу об основах ухода за пчёлами', teach: 'Пчеловодство', learn: 'Готовка', category: 'Другое', level: 'Продвинутый', format: 'Очно', description: 'Поделюсь опытом ухода за ульями, сезонных работ и бережного сбора мёда.', availability: 'Выходные утром', imageUrl: offerPhotos[2], color: '#74a78c' },
    { id: 'demo-arman', userName: 'Арман Б.', city: 'Астана', title: 'Помогу разобраться с основами Python', teach: 'Python', learn: 'Дизайн интерфейсов', category: 'Программирование', level: 'Продвинутый', format: 'Онлайн', description: 'Разберём переменные и функции на небольшом проекте, а ошибки будем искать вместе.', availability: 'Вторник и четверг', imageUrl: offerPhotos[3], color: '#4f9f9a' },
    { id: 'demo-sofia', userName: 'София Л.', city: 'Караганда', title: 'Научу делать хорошие фотографии на телефон', teach: 'Фотография', learn: 'Видеомонтаж', category: 'Фотография', level: 'Продвинутый', format: 'Очно', description: 'Покажу, как замечать свет, строить кадр и быстро обрабатывать снимки на телефоне.', availability: 'Выходные днём', imageUrl: offerPhotos[4], color: '#ba79a1' },
    { id: 'demo-maxim', userName: 'Максим Т.', city: 'Алматы', title: 'Покажу базовые аккорды и ритмы', teach: 'Гитара', learn: 'Английский', category: 'Музыка', level: 'Средний', format: 'Очно', description: 'Настроим инструмент, разберём несколько аккордов и сыграем простую песню.', availability: 'После 18:00 по будням', imageUrl: offerPhotos[5], color: '#d59a54' },
    { id: 'demo-madina', userName: 'Мадина С.', city: 'Алматы', title: 'Помогу начать рисовать с нуля', teach: 'Рисование', learn: 'Музыка', category: 'Дизайн', level: 'Средний', format: 'Онлайн', description: 'Начнём с простых форм и света, чтобы постепенно собрать первый законченный рисунок.', availability: 'Вечера по договорённости', imageUrl: offerPhotos[6], color: '#d7746d' },
    { id: 'demo-timur', userName: 'Тимур А.', city: 'Павлодар', title: 'Научу монтировать короткие видео', teach: 'Видеомонтаж', learn: 'Иллюстрация', category: 'Технологии', level: 'Продвинутый', format: 'Онлайн', description: 'Соберём короткий ролик: от отбора кадров до ритма, звука и аккуратных титров.', availability: 'Утро выходного дня', imageUrl: offerPhotos[11], color: '#7b9d56' },
    { id: 'demo-evgenia', userName: 'Евгения Н.', city: 'Астана', title: 'Помогу сделать первую 3D-модель', teach: '3D-моделирование', learn: 'Публичные выступления', category: 'Технологии', level: 'Продвинутый', format: 'Онлайн', description: 'Проведу от простых форм до готового объекта и покажу базовые приёмы освещения.', availability: 'Среда вечером', imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&h=700&q=88', color: '#7880c5' },
    { id: 'demo-ilya', userName: 'Илья В.', city: 'Костанай', title: 'Помогу практиковать разговорный английский', teach: 'Английский язык', learn: 'Языки', category: 'Языки', level: 'Продвинутый', format: 'Онлайн', description: 'Обсудим повседневные темы без зубрёжки и разберём выражения, которые пригодятся в разговоре.', availability: 'По воскресеньям', imageUrl: offerPhotos[10], color: '#b28150' },
    { id: 'demo-nura', userName: 'Нурай Ж.', city: 'Тараз', title: 'Помогу освоить базовые фразы на испанском', teach: 'Испанский язык', learn: 'Фотография', category: 'Языки', level: 'Средний', format: 'Онлайн', description: 'Потренируем приветствия, вопросы и полезные фразы для первых поездок.', availability: 'Понедельник и четверг', imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&h=700&q=88', color: '#5c9aaf' },
    { id: 'demo-pavel', userName: 'Павел Д.', city: 'Алматы', title: 'Научу основам шахматной стратегии', teach: 'Шахматы', learn: 'Испанский', category: 'Другое', level: 'Средний', format: 'Онлайн', description: 'Разберём развитие фигур, контроль центра и несколько понятных планов в дебюте.', availability: 'Суббота после обеда', imageUrl: offerPhotos[12], color: '#9a79bb' },
    { id: 'demo-knitting', userName: 'Жанна К.', city: 'Караганда', title: 'Покажу базовые техники вязания', teach: 'Вязание', learn: 'Фотография', category: 'Рукоделие', level: 'Средний', format: 'Очно', description: 'Научу набирать петли, держать нить и свяжем небольшой образец без спешки.', availability: 'Воскресенье днём', imageUrl: offerPhotos[13], color: '#d1858c' },
    { id: 'demo-garden', userName: 'Руслан Е.', city: 'Астана', title: 'Расскажу, как ухаживать за домашними растениями', teach: 'Садоводство', learn: 'Готовка', category: 'Садоводство', level: 'Продвинутый', format: 'Онлайн', description: 'Помогу подобрать свет и полив, объясню пересадку и как заметить первые проблемы.', availability: 'Вечера по средам', imageUrl: offerPhotos[14], color: '#5b9670' },
    { id: 'demo-pc', userName: 'Дамир О.', city: 'Алматы', title: 'Помогу разобраться с базовыми проблемами ПК', teach: 'Ремонт компьютеров', learn: 'Английский', category: 'Технологии', level: 'Продвинутый', format: 'Онлайн', description: 'Научимся проверять основные компоненты и искать причину типичных сбоев компьютера.', availability: 'После работы', imageUrl: offerPhotos[14], color: '#6288b3' },
    { id: 'demo-design', userName: 'Амина Т.', city: 'Шымкент', title: 'Помогу сделать первые работы в графическом редакторе', teach: 'Графический дизайн', learn: 'Публичные выступления', category: 'Дизайн', level: 'Средний', format: 'Онлайн', description: 'Разберём композицию и цвет, а затем соберём постер или обложку для портфолио.', availability: 'Вторник вечером', imageUrl: offerPhotos[15], color: '#ad7eb4' },
    { id: 'demo-uiux', userName: 'Ильяс Ж.', city: 'Астана', title: 'Расскажу об основах проектирования интерфейсов', teach: 'UI/UX', learn: 'Рисование', category: 'Дизайн', level: 'Продвинутый', format: 'Онлайн', description: 'Покажу, как исследовать задачу, строить пользовательский путь и проверять прототип.', availability: 'Пятница вечером', imageUrl: offerPhotos[16], color: '#6c82c7' },
    { id: 'demo-theory', userName: 'Марат П.', city: 'Костанай', title: 'Помогу разобраться с основами музыкальной теории', teach: 'Музыкальная теория', learn: 'Шахматы', category: 'Музыка', level: 'Средний', format: 'Онлайн', description: 'Поговорим о ритме, интервалах и аккордах на примерах знакомых мелодий.', availability: 'Суббота утром', imageUrl: offerPhotos[17], color: '#c78c55' },
    { id: 'demo-singing', userName: 'Лаура Д.', city: 'Алматы', title: 'Подскажу упражнения для развития голоса', teach: 'Пение', learn: 'Вязание', category: 'Музыка', level: 'Продвинутый', format: 'Онлайн', description: 'Начнём с дыхания и мягкой разминки, чтобы уверенно разогревать голос перед пением.', availability: 'Понедельник вечером', imageUrl: offerPhotos[18], color: '#c27391' },
    { id: 'demo-origami', userName: 'Аскар Н.', city: 'Астана', title: 'Научу создавать простые фигурки из бумаги', teach: 'Оригами', learn: 'Английский', category: 'Рукоделие', level: 'Средний', format: 'Онлайн', description: 'Сложим несколько фигурок и разберём обозначения, чтобы дальше работать самостоятельно.', availability: 'Выходные', imageUrl: 'https://images.unsplash.com/photo-1590414979948-0839c609c2db?auto=format&fit=crop&w=1000&h=700&q=88', color: '#628eae' },
    { id: 'demo-ceramics', userName: 'Сауле Р.', city: 'Шымкент', title: 'Расскажу об основах работы с глиной', teach: 'Керамика', learn: 'Фотография', category: 'Рукоделие', level: 'Продвинутый', format: 'Очно', description: 'Познакомлю с подготовкой глины, простыми ручными формами и базовым уходом за изделием.', availability: 'Суббота днём', imageUrl: offerPhotos[21], color: '#bb805f' },
    { id: 'demo-calligraphy', userName: 'Адель М.', city: 'Алматы', title: 'Покажу базовые техники красивого письма', teach: 'Каллиграфия', learn: 'Испанский', category: 'Рукоделие', level: 'Средний', format: 'Онлайн', description: 'Поставим руку, попробуем простые штрихи и составим небольшую открытку.', availability: 'Четверг вечером', imageUrl: offerPhotos[20], color: '#997bb8' },
    { id: 'demo-baking', userName: 'Виктория С.', city: 'Астана', title: 'Научу готовить простые домашние десерты', teach: 'Домашняя выпечка', learn: 'Дизайн', category: 'Готовка', level: 'Средний', format: 'Очно', description: 'Испечём простой десерт, обсудим текстуру теста и несколько надёжных замен ингредиентов.', availability: 'Воскресенье', imageUrl: offerPhotos[23], color: '#cf8a71' },
    { id: 'demo-boardgames', userName: 'Ерлан Б.', city: 'Павлодар', title: 'Познакомлю со стратегическими настольными играми', teach: 'Настольные игры', learn: 'Музыка', category: 'Другое', level: 'Средний', format: 'Очно', description: 'Подберу игру для компании, объясню правила на короткой партии и поделюсь стратегиями.', availability: 'Пятница вечером', imageUrl: offerPhotos[24], color: '#6d92a1' },
    { id: 'demo-electronics', userName: 'Михаил Р.', city: 'Караганда', title: 'Расскажу основы работы с электронными схемами', teach: 'Электроника', learn: 'Фотография', category: 'Технологии', level: 'Продвинутый', format: 'Онлайн', description: 'Разберём компоненты и безопасно соберём простую учебную схему на макетной плате.', availability: 'Среда после 18:00', imageUrl: offerPhotos[25], color: '#7287a8' },
    { id: 'demo-robotics', userName: 'Тимур Ж.', city: 'Алматы', title: 'Помогу сделать первый простой проект по робототехнике', teach: 'Робототехника', learn: 'Английский', category: 'Технологии', level: 'Средний', format: 'Онлайн', description: 'Соберём план проекта, подключим датчик и напишем первую простую программу.', availability: 'Вторник вечером', imageUrl: offerPhotos[26], color: '#5f9c91' },
    { id: 'demo-minecraft', userName: 'Никита Ф.', city: 'Астана', title: 'Помогу строить проекты и механизмы в Minecraft', teach: 'Minecraft', learn: 'Рисование', category: 'Технологии', level: 'Продвинутый', format: 'Онлайн', description: 'Покажу, как планировать постройки и собирать игровые механизмы из редстоуна.', availability: 'После учёбы', imageUrl: offerPhotos[27], color: '#8a9b55' },
    { id: 'demo-web', userName: 'Дана А.', city: 'Шымкент', title: 'Покажу основы HTML, CSS и JavaScript', teach: 'Программирование сайтов', learn: 'Керамика', category: 'Программирование', level: 'Продвинутый', format: 'Онлайн', description: 'Сверстаем небольшую страницу и добавим интерактивность, шаг за шагом объясняя код.', availability: 'Понедельник и среда', imageUrl: offerPhotos[22], color: '#6d80bd' },
    { id: 'demo-photo-editing', userName: 'Самира В.', city: 'Тараз', title: 'Научу базовой обработке фотографий', teach: 'Обработка фотографий', learn: 'Садоводство', category: 'Фотография', level: 'Средний', format: 'Онлайн', description: 'Покажу, как выровнять свет и цвет, сохранить естественный вид и подготовить фото к публикации.', availability: 'Суббота утром', imageUrl: offerPhotos[29], color: '#b1768f' },
    { id: 'demo-content', userName: 'Роман И.', city: 'Алматы', title: 'Помогу придумать идеи и структуру для контента', teach: 'Создание контента', learn: 'Гитара', category: 'Другое', level: 'Продвинутый', format: 'Онлайн', description: 'Соберём темы, выберем формат и наметим план публикаций, который удобно поддерживать.', availability: 'Четверг после работы', imageUrl: offerPhotos[30], color: '#668c9c' },
    { id: 'demo-yoga', userName: 'Мирас К.', city: 'Караганда', title: 'Познакомлю с мягкой йогой для начинающих', teach: 'Йога', learn: 'Рисование', category: 'Спорт', level: 'Средний', format: 'Очно', description: 'Покажу несколько спокойных последовательностей и объясню, как адаптировать позы под себя.', availability: 'Суббота утром', imageUrl: offerPhotos[7], color: '#70a777' }
  ];

  demoOffers.forEach(function (offer, index) {
    offer.userId = 'demo-user-' + (index + 1);
    offer.avatarUrl = communityPhotos[index];
  });

  const demoUsers = demoOffers.map(function (offer, index) {
    const legacyEmails = ['alice@skillswap.local', 'daniyar@skillswap.local', 'alina@skillswap.local'];
    return { id: offer.userId, name: offer.userName, email: legacyEmails[index] || 'member' + (index + 1) + '@skillswap.local', password: 'demo123' };
  });
  const demoProfiles = Object.create(null);
  demoOffers.forEach(function (offer) {
    demoProfiles[offer.userId] = {
      name: offer.userName, email: demoUsers.find(function (user) { return user.id === offer.userId; }).email,
      city: offer.city, about: offer.description, teachSkills: [offer.teach], learnSkills: [offer.learn],
      color: offer.color, avatarUrl: offer.avatarUrl
    };
  });

  const defaultProfile = {
    name: '',
    city: '',
    about: '',
    teachSkills: [],
    learnSkills: [],
    color: '#6575e8'
  };

  const moods = [
    { id: 'create', photo: moodPhotos[0], title: 'Хочу творить', hint: 'Дизайн, фото, музыка', categories: ['Дизайн', 'Фотография', 'Музыка'] },
    { id: 'career', photo: moodPhotos[1], title: 'Хочу прокачать карьеру', hint: 'Код, продукт, навыки', categories: ['Программирование', 'Технологии', 'Дизайн'] },
    { id: 'languages', photo: moodPhotos[2], title: 'Хочу изучать языки', hint: 'Новые слова и люди', categories: ['Языки'] },
    { id: 'growth', photo: moodPhotos[3], title: 'Хочу развиваться', hint: 'Практики и идеи', categories: ['Спорт', 'Другое'] },
    { id: 'hobby', photo: moodPhotos[4], title: 'Хочу новое хобби', hint: 'Музыка, йога, фото', categories: ['Музыка', 'Спорт', 'Фотография', 'Рукоделие'] },
    { id: 'people', photo: moodPhotos[5], title: 'Хочу познакомиться и обменяться опытом', hint: 'Знакомства по интересам', categories: ['Другое', 'Технологии', 'Языки'] }
  ];

  const demoReviews = [
    { id: 'demo-review-1', userId: 'demo-user-1', author: 'Алиса М.', text: 'Нашла партнёра для разговорной практики и наконец перестала бояться говорить.', rating: 5, createdAt: '2026-08-14T10:00:00.000Z', demo: true },
    { id: 'demo-review-2', userId: 'demo-user-2', author: 'Данияр К.', text: 'Удобно искать людей с конкретным запросом и сразу договариваться о формате обмена.', rating: 5, createdAt: '2026-08-21T10:00:00.000Z', demo: true },
    { id: 'demo-review-3', userId: 'demo-user-3', author: 'Алина Р.', text: 'Понравилось, что здесь ценится взаимность, а не просто список курсов.', rating: 4, createdAt: '2026-09-02T10:00:00.000Z', demo: true }
  ];

  window.SkillSwapData = { demoOffers: demoOffers, demoUsers: demoUsers, demoProfiles: demoProfiles, defaultProfile: defaultProfile, moods: moods, demoReviews: demoReviews };
})();