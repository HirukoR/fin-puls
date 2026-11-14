import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMonthlyMetrics,
  calculateCategoryBreakdown,
  calculateCushionMetrics,
  calculateGoalMetrics,
  filterTransactions,
  transactionsToCSV,
  validateBackupJSON,
} from './financeMath';
import { createDemoStoreData, DEFAULT_CATEGORIES } from '../data/demoData';
import { generateLocalFinancialAnalysis } from './aiAdvisor';
import { parseBankStatementText, reconstructPdfRowsFromItems } from './receiptScanner';

test('calculateMonthlyMetrics computes income, expenses, free balance, and savings rate accurately', () => {
  const metrics = calculateMonthlyMetrics([
    { id: '1', type: 'income', amount: 100000, categoryId: 'cat_salary', date: '2026-11-01', note: 'Зарплата', createdAt: 1 },
    { id: '2', type: 'expense', amount: 40000, categoryId: 'cat_housing', date: '2026-11-02', note: 'Аренда', createdAt: 2 },
    { id: '3', type: 'expense', amount: 25000, categoryId: 'cat_food', date: '2026-11-05', note: 'Еда', createdAt: 3 },
  ]);

  assert.equal(metrics.income, 100000);
  assert.equal(metrics.expenses, 65000);
  assert.equal(metrics.freeBalance, 35000);
  assert.equal(metrics.savingsRate, 35);
});

test('calculateCategoryBreakdown computes shares and limit statuses', () => {
  const breakdown = calculateCategoryBreakdown(
    [
      { id: '1', type: 'expense', amount: 18000, categoryId: 'cat_marketplaces', date: '2026-11-03', note: 'Ozon', createdAt: 1 },
      { id: '2', type: 'expense', amount: 30000, categoryId: 'cat_food', date: '2026-11-04', note: 'Продукты', createdAt: 2 },
    ],
    DEFAULT_CATEGORIES
  );

  const market = breakdown.find((b) => b.categoryId === 'cat_marketplaces')!;
  const food = breakdown.find((b) => b.categoryId === 'cat_food')!;

  assert.equal(market.limitStatus, 'exceeded'); // 18000 > 15000 limit
  assert.equal(food.limitStatus, 'warning'); // 30000 / 35000 = 85.7% >= 80%
});

test('calculateCushionMetrics projects target amount and months to goal', () => {
  const demo = createDemoStoreData();
  const metrics = calculateCushionMetrics(
    {
      ...demo.cushion,
      calculationMode: 'manual',
      manualMonthlyExpense: 80000,
      targetMonths: 6,
      currentBalance: 240000,
      monthlyPlannedContribution: 40000,
    },
    demo.transactions,
    demo.categories,
    new Date('2026-11-13T10:00:00Z')
  );

  assert.equal(metrics.targetAmount, 480000);
  assert.equal(metrics.progressPercent, 50);
  assert.equal(metrics.remainingAmount, 240000);
  assert.equal(metrics.monthsToGoal, 6);
});

test('calculateGoalMetrics computes weekly and monthly recommendations', () => {
  const goalMetrics = calculateGoalMetrics(
    {
      id: 'g1',
      title: 'Отпуск',
      targetAmount: 120000,
      currentAmount: 60000,
      deadline: '2027-02-13',
      categoryTag: 'Путешествия',
      createdAt: '2026-11-01',
    },
    new Date('2026-11-13T00:00:00Z')
  );

  assert.equal(goalMetrics.remainingAmount, 60000);
  assert.equal(goalMetrics.progressPercent, 50);
  assert.equal(goalMetrics.isCompleted, false);
  assert.ok(goalMetrics.recommendedWeekly > 0);
  assert.ok(goalMetrics.recommendedMonthly > 0);
});

test('filterTransactions filters by period and search query', () => {
  const demo = createDemoStoreData();
  const currentMonthTxs = filterTransactions(demo.transactions, {
    period: 'current_month',
    searchQuery: 'Ozon',
  });
  assert.equal(currentMonthTxs.length, 1);
  assert.equal(currentMonthTxs[0].categoryId, 'cat_marketplaces');
});

test('generateLocalFinancialAnalysis produces 3 observations, reduction plan, and weekly challenge', () => {
  const demo = createDemoStoreData();
  const analysis = generateLocalFinancialAnalysis(
    demo.transactions,
    demo.categories,
    demo.cushion,
    demo.goals,
    'RUB'
  );

  assert.equal(analysis.observations.length, 3);
  assert.ok(analysis.reductionPlan.length >= 3);
  assert.ok(analysis.totalPotentialMonthlySavings > 0);
  assert.ok(analysis.weeklyChallenge.title.length > 0);
});

test('CSV and JSON backup helpers work reliably', () => {
  const demo = createDemoStoreData();
  const csv = transactionsToCSV(demo.transactions, demo.categories);
  assert.ok(csv.includes('Дата;Тип;Категория;Сумма;Заметка'));
  assert.equal(validateBackupJSON(demo)?.transactions.length, demo.transactions.length);
  assert.equal(validateBackupJSON({ invalid: true }), null);
});

test('parseBankStatementText auto-detects Russian merchants, categories, and amounts', () => {
  const raw = [
    'ВкусВилл Супермаркеты −2 840 ₽',
    'Ozon.ru Маркетплейсы −4 350 ₽',
    'Яндекс Go Такси −690 ₽',
    '+ 85 000 ₽ Зачисление заработной платы',
  ].join('\n');

  const parsed = parseBankStatementText(raw, DEFAULT_CATEGORIES);
  assert.equal(parsed.length, 4);
  assert.equal(parsed[0].categoryId, 'cat_food');
  assert.equal(parsed[0].amount, 2840);
  assert.equal(parsed[1].categoryId, 'cat_marketplaces');
  assert.equal(parsed[1].amount, 4350);
  assert.equal(parsed[2].categoryId, 'cat_transport');
  assert.equal(parsed[2].amount, 690);
  assert.equal(parsed[3].type, 'income');
  assert.equal(parsed[3].categoryId, 'cat_salary');
  assert.equal(parsed[3].amount, 85000);
});

test('parseBankStatementText parses multi-line Ozon Bank OCR screenshot output accurately', () => {
  const ozonOcrLines = [
    '23:43 кал aN all al = [| °',
    'Операции',
    'Счёт -- Фильтр Без переводо',
    'Расходы Доходы',
    '©) 10 875Р @) 10 908 PL',
    'Вчера',
    'Огоп -973,38P',
    'Покупка',
    'Вероника Алексеевна С. + 980ОР',
    'Пополнения',
    '11 ноября, ср',
    'Сервисы Яндекса -2294P',
    'К Фастфуд',
    'Вероника Алексеевна С. +2 300Р',
    '+ Пополнения',
    '10 ноября, BT',
    'Ге) Лента - 619,98 Р',
    'rs Супермаркеты * Карта **1431 +',
    'Вероника Алексеевна С. + 500 Р',
    '+ Пополнения',
    'Мегафон -20Р',
    '+ Связь и Интернет',
  ].join('\n');

  const parsed = parseBankStatementText(
    ozonOcrLines,
    DEFAULT_CATEGORIES,
    new Date('2026-11-13T15:00:00')
  );

  assert.equal(parsed.length, 7);
  assert.deepEqual(
    parsed.map((p) => ({
      type: p.type,
      amount: p.amount,
      categoryId: p.categoryId,
      date: p.date,
      note: p.note,
    })),
    [
      {
        type: 'expense',
        amount: 973,
        categoryId: 'cat_marketplaces',
        date: '2026-11-12',
        note: 'Ozon • Покупка',
      },
      {
        type: 'income',
        amount: 980,
        categoryId: 'cat_gifts',
        date: '2026-11-12',
        note: 'Вероника Алексеевна С. • Пополнения',
      },
      {
        type: 'expense',
        amount: 2294,
        categoryId: 'cat_food',
        date: '2026-11-11',
        note: 'Сервисы Яндекса • Фастфуд',
      },
      {
        type: 'income',
        amount: 2300,
        categoryId: 'cat_gifts',
        date: '2026-11-11',
        note: 'Вероника Алексеевна С. • Пополнения',
      },
      {
        type: 'expense',
        amount: 620,
        categoryId: 'cat_food',
        date: '2026-11-10',
        note: 'Лента • Супермаркеты',
      },
      {
        type: 'income',
        amount: 500,
        categoryId: 'cat_gifts',
        date: '2026-11-10',
        note: 'Вероника Алексеевна С. • Пополнения',
      },
      {
        type: 'expense',
        amount: 20,
        categoryId: 'cat_subscriptions',
        date: '2026-11-10',
        note: 'Мегафон • Связь и Интернет',
      },
    ]
  );
});

test('parseBankStatementText parses Rocketbank wide-font OCR output accurately', () => {
  const rocketOcrLines = [
    '23:59 ® НЙ 79 7',
    '6% an, РОК! 0',
    '‘@ АНТОН Е. +2 ooo Pf',
    'Keb КРАСНОЕ & БЕЛОЕ —-—a71,1 2',
    'РАЛЛИБУСТ 6,66% 6,66% +31₽',
    '@ МАГНИТ —-745,93 2',
    'Keb КРАСНОЕ & БЕЛОЕ —232,45 2',
    '$¢ — © МОЕГО СЧЕТА — 2о,4 2',
    '$ НА КАПИЛКУ',
    '11 ноября',
    '‘в ТИМУР С. езоо =',
    '(©) моБильня связь - мегафон —ЗО ®',
    'ess PORTAL сво =',
  ].join('\n');

  const parsed = parseBankStatementText(
    rocketOcrLines,
    DEFAULT_CATEGORIES,
    new Date('2026-11-14T15:00:00')
  );

  assert.equal(parsed.length, 8);
  assert.deepEqual(
    parsed.map((p) => ({
      type: p.type,
      amount: p.amount,
      categoryId: p.categoryId,
      date: p.date,
      note: p.note,
    })),
    [
      {
        type: 'income',
        amount: 2000,
        categoryId: 'cat_gifts',
        date: '2026-11-14',
        note: 'АНТОН Е.',
      },
      {
        type: 'expense',
        amount: 471,
        categoryId: 'cat_food',
        date: '2026-11-14',
        note: 'Красное & Белое',
      },
      {
        type: 'expense',
        amount: 746,
        categoryId: 'cat_food',
        date: '2026-11-14',
        note: 'Магнит',
      },
      {
        type: 'expense',
        amount: 232,
        categoryId: 'cat_food',
        date: '2026-11-14',
        note: 'Красное & Белое',
      },
      {
        type: 'expense',
        amount: 20,
        categoryId: 'cat_other',
        date: '2026-11-14',
        note: 'С моего счёта • На копилку',
      },
      {
        type: 'expense',
        amount: 2300,
        categoryId: 'cat_other',
        date: '2026-11-11',
        note: 'ТИМУР С.',
      },
      {
        type: 'expense',
        amount: 30,
        categoryId: 'cat_subscriptions',
        date: '2026-11-11',
        note: 'Мобильная связь - Мегафон',
      },
      {
        type: 'expense',
        amount: 680,
        categoryId: 'cat_entertainment',
        date: '2026-11-11',
        note: 'PORTAL',
      },
    ]
  );
});

test('parseBankStatementText parses second Rocketbank screenshot with VITA APTEKA 3930 and S С МОЕГО СЧЕТА', () => {
  const rocketSecondOcrLines = [
    '23:59 A we 79',
    'ЭЙ, РОКИ a)',
    '0640',
    '142 Q',
    'сегодня',
    'СВЕТЛАНА С. +3 ооо Р',
    'СВЕТЛАНА С. +30 ооо Р',
    'О ЛЕНТА —1 158,99 2',
    'РАЛЛИБУСТ 6,66% 6,66% +77Р',
    '© VITA APTEKA 3930 -1 O11 2',
    'РАЛЛИБУСТ 6,66% 6,66% +67Р',
    'Keb КРАСНОЕ & БЕЛОЕ —-2аэ,67 2',
    'РАЛЛИБУСТ 6,66% 6,66% +16Р',
    'S С МОЕГО СЧЕТА —-аз,48 2',
    'i НА К’',
    'вчера',
  ].join('\n');

  const parsed = parseBankStatementText(
    rocketSecondOcrLines,
    DEFAULT_CATEGORIES,
    new Date('2026-11-14T15:30:00')
  );

  assert.equal(parsed.length, 6);
  assert.deepEqual(
    parsed.map((p) => ({
      type: p.type,
      amount: p.amount,
      categoryId: p.categoryId,
      date: p.date,
      note: p.note,
    })),
    [
      {
        type: 'income',
        amount: 3000,
        categoryId: 'cat_gifts',
        date: '2026-11-14',
        note: 'СВЕТЛАНА С.',
      },
      {
        type: 'income',
        amount: 30000,
        categoryId: 'cat_gifts',
        date: '2026-11-14',
        note: 'СВЕТЛАНА С.',
      },
      {
        type: 'expense',
        amount: 1159,
        categoryId: 'cat_food',
        date: '2026-11-14',
        note: 'Лента',
      },
      {
        type: 'expense',
        amount: 1011,
        categoryId: 'cat_health',
        date: '2026-11-14',
        note: 'Vita Apteka',
      },
      {
        type: 'expense',
        amount: 250,
        categoryId: 'cat_food',
        date: '2026-11-14',
        note: 'Красное & Белое',
      },
      {
        type: 'expense',
        amount: 43,
        categoryId: 'cat_other',
        date: '2026-11-14',
        note: 'С моего счёта • На копилку',
      },
    ]
  );
});

test('reconstructPdfRowsFromItems and parseBankStatementText parse multi-column PDF bank statements accurately', () => {
  const pdfPositionedCells = [
    // Header row at y=780
    { str: 'Выписка по счёту 40817810538001234567 за период с 01.11.2026 по 14.11.2026', x: 40, y: 780 },
    // Summary row at y=750
    { str: 'Входящий остаток 45 200,00 ₽', x: 40, y: 750 },
    { str: 'Исходящий остаток 98 410,00 ₽', x: 300, y: 750 },
    // Row 1 (T-Bank style with duplicate amount columns and trailing card tail 4377) at y=700
    { str: '-1 480,00 ₽', x: 260, y: 700.5 },
    { str: '13.11.2026', x: 40, y: 700 },
    { str: '19:42', x: 105, y: 700 },
    { str: '-1 480,00 ₽', x: 340, y: 700 },
    { str: 'Оплата в Пятёрочка', x: 420, y: 699.8 },
    { str: '4377', x: 540, y: 700 },
    // Row 2 (Sberbank style unsigned 2-decimal expense on dated row) at y=670
    { str: '12.11.2026', x: 40, y: 670 },
    { str: '14:15', x: 105, y: 670 },
    { str: 'VITA APTEKA 3930', x: 180, y: 670 },
    { str: '1 011,00', x: 480, y: 670 },
    // Row 3 (Salary income) at y=640
    { str: '11.11.2026', x: 40, y: 640 },
    { str: '+65 000,00 ₽', x: 340, y: 640 },
    { str: 'Зачисление заработной платы', x: 430, y: 640 },
  ];

  const reconstructedLines = reconstructPdfRowsFromItems(pdfPositionedCells);
  assert.equal(reconstructedLines.length, 5);

  const parsed = parseBankStatementText(
    reconstructedLines.join('\n'),
    DEFAULT_CATEGORIES,
    new Date('2026-11-14T15:30:00')
  );

  assert.equal(parsed.length, 3);
  assert.deepEqual(
    parsed.map((p) => ({
      type: p.type,
      amount: p.amount,
      categoryId: p.categoryId,
      date: p.date,
      note: p.note,
    })),
    [
      {
        type: 'expense',
        amount: 1480,
        categoryId: 'cat_food',
        date: '2026-11-13',
        note: 'Пятёрочка',
      },
      {
        type: 'expense',
        amount: 1011,
        categoryId: 'cat_health',
        date: '2026-11-12',
        note: 'Vita Apteka',
      },
      {
        type: 'income',
        amount: 65000,
        categoryId: 'cat_salary',
        date: '2026-11-11',
        note: 'Зачисление заработной платы',
      },
    ]
  );
});

