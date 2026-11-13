import { Category, FinancialStoreData, OfflineTip } from '../types/finance';

export const CURRENCY_MAP: Record<string, { symbol: string; label: string; locale: string }> = {
  RUB: { symbol: '₽', label: 'Российский рубль (₽)', locale: 'ru-RU' },
  USD: { symbol: '$', label: 'Доллар США ($)', locale: 'en-US' },
  EUR: { symbol: '€', label: 'Евро (€)', locale: 'de-DE' },
  KZT: { symbol: '₸', label: 'Казахстанский тенге (₸)', locale: 'ru-KZ' },
  BYN: { symbol: 'Br', label: 'Белорусский рубль (Br)', locale: 'ru-BY' },
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories (all 8 requested + mandatory flags and realistic limits)
  {
    id: 'cat_food',
    name: 'Еда',
    type: 'expense',
    color: '#10b981', // emerald
    monthlyLimit: 35000,
    isMandatory: true,
  },
  {
    id: 'cat_housing',
    name: 'Жильё',
    type: 'expense',
    color: '#3b82f6', // blue
    monthlyLimit: 45000,
    isMandatory: true,
  },
  {
    id: 'cat_transport',
    name: 'Транспорт',
    type: 'expense',
    color: '#f59e0b', // amber
    monthlyLimit: 12000,
    isMandatory: true,
  },
  {
    id: 'cat_subscriptions',
    name: 'Подписки',
    type: 'expense',
    color: '#8b5cf6', // violet
    monthlyLimit: 3500,
    isMandatory: false,
  },
  {
    id: 'cat_marketplaces',
    name: 'Маркетплейсы',
    type: 'expense',
    color: '#ec4899', // pink
    monthlyLimit: 15000,
    isMandatory: false,
  },
  {
    id: 'cat_health',
    name: 'Здоровье',
    type: 'expense',
    color: '#06b6d4', // cyan
    monthlyLimit: 10000,
    isMandatory: true,
  },
  {
    id: 'cat_entertainment',
    name: 'Развлечения',
    type: 'expense',
    color: '#f97316', // orange
    monthlyLimit: 12000,
    isMandatory: false,
  },
  {
    id: 'cat_other',
    name: 'Прочее',
    type: 'expense',
    color: '#64748b', // slate
    monthlyLimit: 8000,
    isMandatory: false,
  },
  // Income categories (8 categories matching the 8 expense categories grid)
  {
    id: 'cat_salary',
    name: 'Зарплата',
    type: 'income',
    color: '#059669', // emerald
    monthlyLimit: 0,
    isMandatory: false,
  },
  {
    id: 'cat_freelance',
    name: 'Фриланс и проекты',
    type: 'income',
    color: '#0d9488', // teal
    monthlyLimit: 0,
    isMandatory: false,
  },
  {
    id: 'cat_business',
    name: 'Бизнес и самозанятость',
    type: 'income',
    color: '#2563eb', // blue
    monthlyLimit: 0,
    isMandatory: false,
  },
  {
    id: 'cat_investments',
    name: 'Вклады и инвестиции',
    type: 'income',
    color: '#7c3aed', // violet
    monthlyLimit: 0,
    isMandatory: false,
  },
  {
    id: 'cat_cashback',
    name: 'Кэшбэк и бонусы',
    type: 'income',
    color: '#0891b2', // cyan
    monthlyLimit: 0,
    isMandatory: false,
  },
  {
    id: 'cat_gifts',
    name: 'Подарки и переводы',
    type: 'income',
    color: '#db2777', // pink
    monthlyLimit: 0,
    isMandatory: false,
  },
  {
    id: 'cat_sales',
    name: 'Продажи (Авито)',
    type: 'income',
    color: '#d97706', // amber
    monthlyLimit: 0,
    isMandatory: false,
  },
  {
    id: 'cat_income_other',
    name: 'Вычеты и прочее',
    type: 'income',
    color: '#475569', // slate
    monthlyLimit: 0,
    isMandatory: false,
  },
];

function getRelativeDate(monthOffset: number, day: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const maxDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  const safeDay = Math.min(Math.max(1, day), maxDay);
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(safeDay).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getFutureDate(monthsAhead: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 15);
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function createDemoStoreData(): FinancialStoreData {
  return {
    version: 1,
    categories: DEFAULT_CATEGORIES,
    transactions: [
      // Current month incomes
      {
        id: 'tx_1',
        type: 'income',
        amount: 165000,
        categoryId: 'cat_salary',
        date: getRelativeDate(0, 1),
        note: 'Основная зарплата (аванс и расчёт)',
        createdAt: Date.now() - 86400000 * 12,
      },
      {
        id: 'tx_2',
        type: 'income',
        amount: 28000,
        categoryId: 'cat_freelance',
        date: getRelativeDate(0, 6),
        note: 'Консультация и аудит дизайн-системы',
        createdAt: Date.now() - 86400000 * 7,
      },
      {
        id: 'tx_3',
        type: 'income',
        amount: 4250,
        categoryId: 'cat_cashback',
        date: getRelativeDate(0, 10),
        note: 'Проценты на накопительный счёт и кэшбэк',
        createdAt: Date.now() - 86400000 * 3,
      },
      // Current month expenses
      {
        id: 'tx_4',
        type: 'expense',
        amount: 42000,
        categoryId: 'cat_housing',
        date: getRelativeDate(0, 2),
        note: 'Аренда квартиры и счётчики ЖКУ',
        createdAt: Date.now() - 86400000 * 11,
      },
      {
        id: 'tx_5',
        type: 'expense',
        amount: 8400,
        categoryId: 'cat_food',
        date: getRelativeDate(0, 3),
        note: 'Большая закупка продуктов во ВкусВилл и Перекрёстке',
        createdAt: Date.now() - 86400000 * 10,
      },
      {
        id: 'tx_6',
        type: 'expense',
        amount: 16800,
        categoryId: 'cat_marketplaces',
        date: getRelativeDate(0, 5),
        note: 'Заказ на Ozon: фильтр для воды, кроссовки и мелочи для дома',
        createdAt: Date.now() - 86400000 * 8,
      },
      {
        id: 'tx_7',
        type: 'expense',
        amount: 3890,
        categoryId: 'cat_subscriptions',
        date: getRelativeDate(0, 6),
        note: 'Яндекс Плюс, облачное хранилище, музыка и нейросети',
        createdAt: Date.now() - 86400000 * 7,
      },
      {
        id: 'tx_8',
        type: 'expense',
        amount: 9200,
        categoryId: 'cat_food',
        date: getRelativeDate(0, 7),
        note: 'Кофе навынос, бизнес-ланчи и доставка ужина',
        createdAt: Date.now() - 86400000 * 6,
      },
      {
        id: 'tx_9',
        type: 'expense',
        amount: 6400,
        categoryId: 'cat_transport',
        date: getRelativeDate(0, 8),
        note: 'Пополнение Тройки и поездки на такси в дождь',
        createdAt: Date.now() - 86400000 * 5,
      },
      {
        id: 'tx_10',
        type: 'expense',
        amount: 5500,
        categoryId: 'cat_health',
        date: getRelativeDate(0, 9),
        note: 'Стоматологическая гигиена и аптека',
        createdAt: Date.now() - 86400000 * 4,
      },
      {
        id: 'tx_11',
        type: 'expense',
        amount: 11200,
        categoryId: 'cat_food',
        date: getRelativeDate(0, 11),
        note: 'Продукты на неделю и фермерский рынок',
        createdAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'tx_12',
        type: 'expense',
        amount: 8900,
        categoryId: 'cat_entertainment',
        date: getRelativeDate(0, 12),
        note: 'Ужин с друзьями и билеты на концерт',
        createdAt: Date.now() - 86400000 * 1,
      },
      {
        id: 'tx_13',
        type: 'expense',
        amount: 3400,
        categoryId: 'cat_other',
        date: getRelativeDate(0, 13),
        note: 'Подарок коллеге и хозтовары',
        createdAt: Date.now() - 3600000 * 5,
      },
      // Previous month sample transactions (for period comparison & average calculation)
      {
        id: 'tx_prev_1',
        type: 'income',
        amount: 165000,
        categoryId: 'cat_salary',
        date: getRelativeDate(-1, 5),
        note: 'Зарплата за прошлый месяц',
        createdAt: Date.now() - 86400000 * 40,
      },
      {
        id: 'tx_prev_2',
        type: 'income',
        amount: 15000,
        categoryId: 'cat_freelance',
        date: getRelativeDate(-1, 18),
        note: 'Подработка: вёрстка лендинга',
        createdAt: Date.now() - 86400000 * 28,
      },
      {
        id: 'tx_prev_3',
        type: 'expense',
        amount: 42000,
        categoryId: 'cat_housing',
        date: getRelativeDate(-1, 3),
        note: 'Аренда жилья и коммунальные платежи',
        createdAt: Date.now() - 86400000 * 42,
      },
      {
        id: 'tx_prev_4',
        type: 'expense',
        amount: 31500,
        categoryId: 'cat_food',
        date: getRelativeDate(-1, 14),
        note: 'Супермаркеты и кафе за месяц',
        createdAt: Date.now() - 86400000 * 32,
      },
      {
        id: 'tx_prev_5',
        type: 'expense',
        amount: 9800,
        categoryId: 'cat_transport',
        date: getRelativeDate(-1, 20),
        note: 'Метро, каршеринг и такси',
        createdAt: Date.now() - 86400000 * 25,
      },
      {
        id: 'tx_prev_6',
        type: 'expense',
        amount: 14200,
        categoryId: 'cat_marketplaces',
        date: getRelativeDate(-1, 22),
        note: 'Покупки на Wildberries и Ozon',
        createdAt: Date.now() - 86400000 * 22,
      },
      {
        id: 'tx_prev_7',
        type: 'expense',
        amount: 6800,
        categoryId: 'cat_health',
        date: getRelativeDate(-1, 25),
        note: 'Абонемент в зал и витамины',
        createdAt: Date.now() - 86400000 * 19,
      },
    ],
    cushion: {
      currentBalance: 315000,
      targetMonths: 6,
      calculationMode: 'auto_mandatory',
      manualMonthlyExpense: 90000,
      monthlyPlannedContribution: 35000,
      history: [
        {
          id: 'c_1',
          amount: 220000,
          date: getRelativeDate(-2, 10),
          note: 'Базовый резерв на накопительном счёте (18% годовых)',
        },
        {
          id: 'c_2',
          amount: 45000,
          date: getRelativeDate(-1, 10),
          note: 'Ежемесячное пополнение подушки (15% дохода + премия)',
        },
        {
          id: 'c_3',
          amount: 50000,
          date: getRelativeDate(0, 5),
          note: 'Пополнение с зарплаты и процентного дохода',
        },
      ],
    },
    goals: [
      {
        id: 'goal_1',
        title: 'Отпуск у моря в бархатный сезон',
        targetAmount: 180000,
        currentAmount: 112000,
        deadline: getFutureDate(4),
        categoryTag: 'Путешествия',
        createdAt: getRelativeDate(-2, 1),
      },
      {
        id: 'goal_2',
        title: 'Обновление рабочего ноутбука MacBook Air',
        targetAmount: 145000,
        currentAmount: 65000,
        deadline: getFutureDate(5),
        categoryTag: 'Техника',
        createdAt: getRelativeDate(-1, 5),
      },
      {
        id: 'goal_3',
        title: 'Годовой полис ДМС и чекап организма',
        targetAmount: 60000,
        currentAmount: 42000,
        deadline: getFutureDate(2),
        categoryTag: 'Здоровье',
        createdAt: getRelativeDate(-1, 12),
      },
    ],
    settings: {
      currency: 'RUB',
      theme: 'light',
      activeChallengeId: 'tip_challenge_1',
      completedChallengeIds: ['tip_challenge_2'],
    },
  };
}

export function createEmptyStoreData(currentSettings?: FinancialStoreData['settings']): FinancialStoreData {
  return {
    version: 1,
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    transactions: [],
    cushion: {
      currentBalance: 0,
      targetMonths: 6,
      calculationMode: 'manual',
      manualMonthlyExpense: 65000,
      monthlyPlannedContribution: 15000,
      history: [],
    },
    goals: [],
    settings: currentSettings ?? {
      currency: 'RUB',
      theme: 'light',
      completedChallengeIds: [],
    },
  };
}

export const OFFLINE_FINANCIAL_TIPS: OfflineTip[] = [
  {
    id: 'tip_challenge_1',
    category: 'Челлендж недели',
    title: 'Правило «72 часов» для корзин на маркетплейсах',
    description: 'Любую несрочную покупку на Ozon или Wildberries оставляйте в корзине ровно на 3 суток. По статистике 65% импульсивных товаров за это время теряют актуальность.',
    estimatedSavingsPercent: 'до 15% бюджета',
    isChallenge: true,
  },
  {
    id: 'tip_challenge_2',
    category: 'Челлендж недели',
    title: 'Неделя домашнего бариста и термокружки',
    description: 'В течение 7 дней берите любимый зерновой кофе из дома или офиса вместо стаканчиков навынос по 250–350 ₽ и спонтанных десертов на кассе.',
    estimatedSavingsPercent: '2 000–3 500 ₽ / нед',
    isChallenge: true,
  },
  {
    id: 'tip_challenge_3',
    category: 'Челлендж недели',
    title: '3 дня без доставки готовой еды',
    description: 'Замените вечерние заказы из сервисов доставки простыми блюдами за 20 минут или готовыми замороженными заготовками.',
    estimatedSavingsPercent: '3 000–4 500 ₽ / нед',
    isChallenge: true,
  },
  {
    id: 'tip_challenge_4',
    category: 'Челлендж недели',
    title: 'Округление остатка на счёте каждый вечер',
    description: 'Каждый вечер переводите «хвостик» с дебетовой карты до круглой тысячи рублей (например, со счёта 14 380 ₽ → 380 ₽) в копилку или подушку.',
    estimatedSavingsPercent: '+8 000–12 000 ₽ / мес',
    isChallenge: true,
  },
  {
    id: 'tip_1',
    category: 'Привычки и накопления',
    title: 'Принцип «Сначала заплати себе» в день зарплаты',
    description: 'Настройте автоперевод 10–20% от любого поступления на отдельный накопительный счёт с ежедневным начислением процентов в первые 2 часа после зачисления дохода.',
    estimatedSavingsPercent: '+15–20% к норме сбережений',
  },
  {
    id: 'tip_2',
    category: 'Еда и супермаркеты',
    title: 'Закупка базовой корзины раз в неделю со списком',
    description: 'Один большой заказ продуктов на 7 дней вместо ежедневных забегов в магазин «за хлебом» убирает до 30% сопутствующих покупок снеков и сладостей.',
    estimatedSavingsPercent: '12–18% на продуктах',
  },
  {
    id: 'tip_3',
    category: 'Еда и супермаркеты',
    title: 'Сравнение цены за 1 кг / 1 литр вместо цены упаковки',
    description: 'Производители часто уменьшают вес пачки до 180 г или 850 мл (шринкфляция). Ориентируйтесь на цену за килограмм на ценнике или в карточке товара.',
    estimatedSavingsPercent: '8–12% на продуктах',
  },
  {
    id: 'tip_4',
    category: 'Еда и супермаркеты',
    title: 'Правило сытого похода и «любимого продукта»',
    description: 'Назначайте в приложениях супермаркетов 20% скидку именно на дорогие регулярные позиции (сыр, кофе, рыба, масло), а не на разовые деликатесы.',
    estimatedSavingsPercent: '2 500–4 000 ₽ / мес',
  },
  {
    id: 'tip_5',
    category: 'Подписки и связь',
    title: 'Квартальная ревизия автосписаний и подписок',
    description: 'Проверьте привязанные карты в экосистемах, стримингах и облаках. Отключите дублирующиеся онлайн-кинотеатры и переведите оставшиеся на семейный или годовой тариф.',
    estimatedSavingsPercent: '30–50% на подписках',
  },
  {
    id: 'tip_6',
    category: 'Подписки и связь',
    title: 'Отдельная виртуальная карта с лимитом для подписок',
    description: 'Заведите бесплатную виртуальную карту специально для онлайн-сервисов и держите на ней ровно сумму месячных подписок, чтобы избежать неожиданных списаний после пробного периода.',
    estimatedSavingsPercent: '1 000–2 500 ₽ / мес',
  },
  {
    id: 'tip_7',
    category: 'Подписки и связь',
    title: 'Аудит архивного мобильного тарифа и домашнего интернета',
    description: 'Объединение мобильной связи и домашнего интернета в один конвергентный пакет или запрос персональной скидки у оператора снижает счёт на 25–40%.',
    estimatedSavingsPercent: '500–1 200 ₽ / мес',
  },
  {
    id: 'tip_8',
    category: 'Маркетплейсы и шопинг',
    title: 'Перевод стоимости вещи в часы вашей чистой работы',
    description: 'Если чистый час вашей работы стоит 1 000 ₽, то спонтанный гаджет за 12 000 ₽ — это 1,5 полных рабочих дня. Такой пересчёт мгновенно отрезвляет при шопинге.',
    estimatedSavingsPercent: '20–30% на маркетплейсах',
  },
  {
    id: 'tip_9',
    category: 'Маркетплейсы и шопинг',
    title: 'Отключение push-уведомлений от маркетплейсов',
    description: 'Оставьте уведомления только о доставке в пункт выдачи. Баннеры «Распродажа до полуночи» созданы алгоритмами для провокации внеплановых трат.',
    estimatedSavingsPercent: '10–15% на покупках',
  },
  {
    id: 'tip_10',
    category: 'Маркетплейсы и шопинг',
    title: 'Формула «Стоимость одного использования» (Cost Per Wear)',
    description: 'Качественная куртка за 18 000 ₽ на 3 сезона (180 выходов = 100 ₽ за выход) выгоднее вещи низкого качества за 5 000 ₽, которая потеряет вид через 5 стирок.',
    estimatedSavingsPercent: 'долгосрочная экономия',
  },
  {
    id: 'tip_11',
    category: 'Транспорт и город',
    title: 'Сдвиг поездки на такси на 10–15 минут от часа пик',
    description: 'Алгоритмы повышенного спроса резко меняют цену в 08:50 и 18:05. Заказ на 12 минут раньше или переход через дорогу к удобной точке подачи экономит до трети чека.',
    estimatedSavingsPercent: '15–25% на такси',
  },
  {
    id: 'tip_12',
    category: 'Транспорт и город',
    title: 'Абонемент на городской транспорт на 30/90 дней',
    description: 'При регулярных поездках от 4 раз в неделю безлимитный проездной или биометрия с кэшбэком выгоднее разовых списаний на 20–30%.',
    estimatedSavingsPercent: '1 200–2 500 ₽ / мес',
  },
  {
    id: 'tip_13',
    category: 'Привычки и накопления',
    title: 'Разделение подушки безопасности на 2 эшелона',
    description: 'Держите 1–2 месячных расхода на накопительном счёте с мгновенным снятием, а остальные 4–6 месяцев — на пополняемых вкладах с повышенной фиксированной ставкой.',
    estimatedSavingsPercent: '+2–4% годовых к доходности',
  },
  {
    id: 'tip_14',
    category: 'Привычки и накопления',
    title: 'Ротация категорий повышенного кэшбэка 1-го числа',
    description: 'Поставьте напоминание на 1-е число каждого месяца: выбор категорий в 2–3 банках без пересечений позволяет возвращать 5% с аптек, такси, супермаркетов и ЖКУ.',
    estimatedSavingsPercent: '2 500–5 000 ₽ / мес',
  },
  {
    id: 'tip_15',
    category: 'Привычки и накопления',
    title: 'Оформление налоговых вычетов (лечение, спорт, ИИС)',
    description: 'Сохраняйте чеки и справки из клиник, стоматологий и фитнес-клубов: упрощённый социальный налоговый вычет в личном кабинете ФНС возвращает 13% расходов.',
    estimatedSavingsPercent: 'до 19 500 ₽ / год',
  },
  {
    id: 'tip_16',
    category: 'Еда и супермаркеты',
    title: 'Приготовление обедов на 2 дня вперёд (Meal Prep)',
    description: 'Бизнес-ланч за 650 ₽ 20 рабочих дней в месяц обходится в 13 000 ₽. Замена хотя бы половины обедов домашней едой освобождает 5 000+ ₽ в месяц.',
    estimatedSavingsPercent: '5 000–7 000 ₽ / мес',
  },
  {
    id: 'tip_17',
    category: 'Маркетплейсы и шопинг',
    title: 'Правило «Одна вещь пришла — одна ушла»',
    description: 'Перед покупкой новой одежды, гаджета или предмета интерьера продайте неиспользуемый аналог на Авито и направьте выручку в копилку цели.',
    estimatedSavingsPercent: '+3 000–10 000 ₽ в копилки',
  },
  {
    id: 'tip_18',
    category: 'Привычки и накопления',
    title: 'Защита от «инфляции образа жизни» при росте дохода',
    description: 'При получении премии или повышении зарплаты направляйте минимум 50% прироста в финансовую подушку и цели, и только 50% — на повышение текущих трат.',
    estimatedSavingsPercent: 'ускорение целей в 2 раза',
  },
  {
    id: 'tip_19',
    category: 'Еда и супермаркеты',
    title: 'Ревизия морозилки и бакалеи раз в две недели',
    description: 'Устраивайте «день запасов» перед новой закупкой: используйте крупы, пасту, замороженные овощи и ягоды, которые уже куплены и ждут своего часа.',
    estimatedSavingsPercent: '1 500–3 000 ₽ / мес',
  },
  {
    id: 'tip_20',
    category: 'Привычки и накопления',
    title: 'Лимиты на «незаметные» категории',
    description: 'Именно мелкие траты до 500 ₽ (перекусы, платные подписки, пакеты, комиссии) складываются в 12–15 тысяч рублей за месяц. Жесткий лимит делает их видимыми.',
    estimatedSavingsPercent: '10–15% бюджета',
  },
];
