import {
  AIAnalysisResult,
  Category,
  CushionState,
  SavingsGoal,
  Transaction,
  CurrencyCode,
} from '../types/finance';
import {
  calculateCategoryBreakdown,
  calculateCushionMetrics,
  calculateMonthlyMetrics,
  filterTransactions,
  formatMoney,
} from './financeMath';

export function buildAnonymizedMonthlyPrompt(
  transactions: Transaction[],
  categories: Category[],
  cushion: CushionState,
  goals: SavingsGoal[],
  currency: CurrencyCode
): string {
  const monthTxs = filterTransactions(transactions, { period: 'current_month' });
  const metrics = calculateMonthlyMetrics(monthTxs);
  const breakdown = calculateCategoryBreakdown(monthTxs, categories).filter((c) => c.amount > 0);
  const cushionMetrics = calculateCushionMetrics(cushion, transactions, categories);

  const catLines = breakdown
    .map(
      (c) =>
        `- ${c.name}: потрачено ${formatMoney(c.amount, currency)} (${c.sharePercent}% всех трат)${
          c.monthlyLimit > 0
            ? `, лимит ${formatMoney(c.monthlyLimit, currency)} (заполнен на ${c.limitFillPercent}%)`
            : ''
        }`
    )
    .join('\n');

  const goalLines = goals
    .map(
      (g) =>
        `- Цель «${g.title}»: накоплено ${formatMoney(g.currentAmount, currency)} из ${formatMoney(
          g.targetAmount,
          currency
        )} (дедлайн ${g.deadline})`
    )
    .join('\n');

  return [
    `Обезличенная сводка бюджета за текущий месяц:`,
    `Доходы: ${formatMoney(metrics.income, currency)}`,
    `Расходы: ${formatMoney(metrics.expenses, currency)}`,
    `Свободный остаток: ${formatMoney(metrics.freeBalance, currency)}`,
    `Норма сбережений: ${metrics.savingsRate}%`,
    `Подушка безопасности: накоплено ${formatMoney(cushionMetrics.currentBalance, currency)} из ${formatMoney(
      cushionMetrics.targetAmount,
      currency
    )} (${cushionMetrics.progressPercent}%, цель ${cushion.targetMonths} мес.)`,
    `Структура расходов по категориям:\n${catLines || 'Расходов пока нет'}`,
    `Активные цели накоплений:\n${goalLines || 'Целей пока нет'}`,
  ].join('\n');
}

export function generateLocalFinancialAnalysis(
  transactions: Transaction[],
  categories: Category[],
  cushion: CushionState,
  goals: SavingsGoal[],
  currency: CurrencyCode
): AIAnalysisResult {
  const monthTxs = filterTransactions(transactions, { period: 'current_month' });
  const metrics = calculateMonthlyMetrics(monthTxs);
  const breakdown = calculateCategoryBreakdown(monthTxs, categories).filter((c) => c.amount > 0);
  const cushionMetrics = calculateCushionMetrics(cushion, transactions, categories);

  const observations: AIAnalysisResult['observations'] = [];

  if (breakdown.length === 0) {
    return {
      generatedAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      source: 'local_engine',
      observations: [
        {
          title: 'Недостаточно данных за текущий месяц',
          detail:
            'Добавьте несколько основных трат и доходов за этот месяц, чтобы аналитик рассчитал структуру утечек бюджета и персональный план оптимизации.',
          impact: 'Базовый мониторинг',
        },
        {
          title: 'Контроль обязательных платежей',
          detail:
            'Задайте месячные лимиты для категорий «Еда», «Маркетплейсы» и «Развлечения» — это создаст автоматический коридор безопасности.',
          impact: 'До 15% экономии',
        },
        {
          title: 'Формирование подушки безопасности',
          detail: `Текущий прогресс подушки составляет ${cushionMetrics.progressPercent}%. Регулярное откладывание в день дохода ускорит закрытие цели.`,
          impact: `${cushion.targetMonths} мес. резерва`,
        },
      ],
      reductionPlan: [
        {
          category: 'Еда и супермаркеты',
          action: 'Переход на закупку по списку 1 раз в неделю и ограничение спонтанной доставки',
          potentialSavings: 4500,
        },
        {
          category: 'Маркетплейсы',
          action: 'Пауза 72 часа перед оплатой любых несрочных товаров в корзине',
          potentialSavings: 3500,
        },
        {
          category: 'Подписки',
          action: 'Отключение неиспользуемых сервисов и перевод регулярных в семейный/годовой тариф',
          potentialSavings: 1200,
        },
      ],
      weeklyChallenge: {
        title: '7 дней осознанных покупок по списку',
        description:
          'Фиксируйте каждую трату сразу в момент оплаты и воздержитесь от спонтанных заказов на маркетплейсах в течение недели.',
        estimatedReward: formatMoney(3000, currency),
      },
      totalPotentialMonthlySavings: 9200,
    };
  }

  // Observation 1: Top spending category or exceeded limit
  const exceeded = breakdown.filter((b) => b.limitStatus === 'exceeded' || b.limitStatus === 'warning');
  const topCat = breakdown[0];

  if (exceeded.length > 0) {
    const worst = exceeded.sort((a, b) => b.limitFillPercent - a.limitFillPercent)[0];
    const diff = worst.amount - worst.monthlyLimit;
    observations.push({
      title:
        worst.limitStatus === 'exceeded'
          ? `Превышение лимита в категории «${worst.name}»`
          : `Риск выхода за лимит в категории «${worst.name}»`,
      detail:
        worst.limitStatus === 'exceeded'
          ? `Расходы составили ${formatMoney(worst.amount, currency)} при установленном лимите ${formatMoney(
              worst.monthlyLimit,
              currency
            )} (перерасход +${formatMoney(diff, currency)} или ${worst.limitFillPercent}% от плана).`
          : `Израсходовано уже ${worst.limitFillPercent}% месячного лимита (${formatMoney(
              worst.amount,
              currency
            )} из ${formatMoney(worst.monthlyLimit, currency)}). В оставшиеся дни месяца стоит ограничить траты в этой рубрике.`,
      impact: `${worst.sharePercent}% всех трат месяца`,
    });
  } else {
    observations.push({
      title: `Главная статья бюджета — «${topCat.name}»`,
      detail: `На категорию «${topCat.name}» приходится ${topCat.sharePercent}% всех ваших расходов за месяц (${formatMoney(
        topCat.amount,
        currency
      )} за ${topCat.transactionCount} оп.). Оптимизация даже на 10% здесь даст максимальный эффект.`,
      impact: `${formatMoney(topCat.amount, currency)} / мес`,
    });
  }

  // Observation 2: Non-mandatory / impulse spending ratio
  const discretionary = breakdown.filter((b) => !b.isMandatory);
  const discretionarySum = discretionary.reduce((acc, b) => acc + b.amount, 0);
  const discretionaryShare =
    metrics.expenses > 0 ? Math.round((discretionarySum / metrics.expenses) * 100) : 0;

  observations.push({
    title: `Необязательные и импульсивные траты: ${discretionaryShare}% расходов`,
    detail: `На категории вне базового минимума (${
      discretionary.map((d) => d.name).join(', ') || 'Развлечения, Маркетплейсы, Подписки'
    }) ушло ${formatMoney(discretionarySum, currency)}. Сокращение импульсивных покупок на четверть высвободит ${formatMoney(
      Math.round(discretionarySum * 0.25),
      currency
    )} без снижения качества жизни.`,
    impact: `Потенциал +${formatMoney(Math.round(discretionarySum * 0.25), currency)}`,
  });

  // Observation 3: Savings rate & cushion / goals velocity
  const targetRate = 20;
  observations.push({
    title:
      metrics.savingsRate >= targetRate
        ? `Сильная норма сбережений: ${metrics.savingsRate}% от дохода`
        : `Норма сбережений (${metrics.savingsRate}%) ниже целевых ${targetRate}%`,
    detail:
      metrics.savingsRate >= targetRate
        ? `Вы сохраняете ${formatMoney(
            metrics.freeBalance,
            currency
          )} свободного потока. Направьте часть остатка в подушку безопасности (сейчас закрыто ${
            cushionMetrics.progressPercent
          }%) и ускорьте ${goals.length} активные копилки.`
        : `Для выхода на безопасную норму сбережений 20% не хватает ${formatMoney(
            Math.max(0, Math.round(metrics.income * 0.2 - metrics.freeBalance)),
            currency
          )} в месяц. План ниже поможет высвободить эту сумму за счёт 3 точечных шагов.`,
    impact: `Остаток ${formatMoney(metrics.freeBalance, currency)}`,
  });

  // Concrete 10-15% reduction plan based on actual categories
  const reductionPlan: AIAnalysisResult['reductionPlan'] = [];
  const foodCat = breakdown.find((b) => b.categoryId === 'cat_food' || b.name.toLowerCase().includes('еда'));
  const marketCat = breakdown.find(
    (b) => b.categoryId === 'cat_marketplaces' || b.name.toLowerCase().includes('маркетплейс')
  );
  const entCat = breakdown.find(
    (b) =>
      b.categoryId === 'cat_entertainment' ||
      b.categoryId === 'cat_subscriptions' ||
      !b.isMandatory
  );

  if (foodCat && foodCat.amount > 0) {
    const save = Math.max(500, Math.round(foodCat.amount * 0.14));
    reductionPlan.push({
      category: foodCat.name,
      action:
        'Перейти на 1 плановую недельную закупку продуктов по списку и сократить заказы готовой еды/кофе навынос в будни вдвое.',
      potentialSavings: save,
    });
  }

  if (marketCat && marketCat.amount > 0) {
    const save = Math.max(500, Math.round(marketCat.amount * 0.22));
    reductionPlan.push({
      category: marketCat.name,
      action:
        'Ввести «правило 72 часов ожидания в корзине» и установить жёсткий месячный потолок списаний по карте для онлайн-шопинга.',
      potentialSavings: save,
    });
  }

  const fallbackTargets = breakdown.filter(
    (b) => b.categoryId !== foodCat?.categoryId && b.categoryId !== marketCat?.categoryId && b.categoryId !== 'cat_housing'
  );
  if (fallbackTargets.length > 0) {
    const target = fallbackTargets[0];
    const save = Math.max(400, Math.round(target.amount * 0.15));
    reductionPlan.push({
      category: target.name,
      action:
        target.categoryId === 'cat_subscriptions'
          ? 'Провести ревизию автосписаний, отключить неактивные подписки и объединить оставшиеся в семейный тариф.'
          : `Сократить спонтанные чеки в категории «${target.name}» на 15% за счёт предварительного недельного лимита.`,
      potentialSavings: save,
    });
  } else if (entCat && reductionPlan.length < 3) {
    reductionPlan.push({
      category: entCat.name,
      action: 'Зафиксировать лимит выходного дня и использовать кэшбэк-категории месяца (5–10%).',
      potentialSavings: Math.max(500, Math.round(metrics.expenses * 0.04)),
    });
  }

  // Ensure 3 items in reduction plan totaling ~12-15% of total expenses
  while (reductionPlan.length < 3) {
    const extraSave = Math.max(600, Math.round(metrics.expenses * 0.04));
    reductionPlan.push({
      category: 'Оптимизация регулярных трат',
      action: 'Настроить автоперевод 10% дохода в подушку безопасности в день получения зарплаты.',
      potentialSavings: extraSave,
    });
  }

  const totalPotentialMonthlySavings = reductionPlan.reduce((sum, item) => sum + item.potentialSavings, 0);

  const weeklyReward = Math.max(1500, Math.round(totalPotentialMonthlySavings / 4));

  return {
    generatedAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    source: 'local_engine',
    observations,
    reductionPlan,
    weeklyChallenge: {
      title: 'Неделя «Заморозки корзин» и домашнего кофе',
      description: `В течение ближайших 7 дней не оплачивайте заказы на маркетплейсах (оставляйте товары в избранном) и замените утренние напитки навынос домашними. Сэкономленную сумму в воскресенье переведите на счёт подушки безопасности.`,
      estimatedReward: formatMoney(weeklyReward, currency),
    },
    totalPotentialMonthlySavings,
  };
}

export async function runFinancialAnalysis(
  transactions: Transaction[],
  categories: Category[],
  cushion: CushionState,
  goals: SavingsGoal[],
  currency: CurrencyCode
): Promise<AIAnalysisResult> {
  const summaryPrompt = buildAnonymizedMonthlyPrompt(
    transactions,
    categories,
    cushion,
    goals,
    currency
  );

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summaryPrompt }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      if (
        result?.data &&
        Array.isArray(result.data.observations) &&
        result.data.observations.length > 0 &&
        Array.isArray(result.data.reductionPlan) &&
        result.data.weeklyChallenge
      ) {
        const totalSavings = result.data.reductionPlan.reduce(
          (acc: number, item: { potentialSavings?: number }) =>
            acc + (Number(item.potentialSavings) || 0),
          0
        );
        return {
          generatedAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          source: 'ai',
          observations: result.data.observations.slice(0, 3),
          reductionPlan: result.data.reductionPlan.slice(0, 4),
          weeklyChallenge: result.data.weeklyChallenge,
          totalPotentialMonthlySavings: totalSavings,
        };
      }
    }
  } catch {
    // Graceful fallback when deployed on static hosting (Vercel/Netlify/GitHub Pages) or offline
  }

  return generateLocalFinancialAnalysis(transactions, categories, cushion, goals, currency);
}
