import {
  Category,
  CurrencyCode,
  CushionState,
  FinancialStoreData,
  PeriodFilter,
  SavingsGoal,
  Transaction,
  TransactionType,
} from '../types/finance';
import { CURRENCY_MAP } from '../data/demoData';

export interface MonthlyMetrics {
  income: number;
  expenses: number;
  freeBalance: number;
  savingsRate: number; // percentage 0..100 (can be negative if expenses > income, clamped or displayed accurately)
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  sharePercent: number;
  monthlyLimit: number;
  limitFillPercent: number;
  limitStatus: 'no_limit' | 'ok' | 'warning' | 'exceeded';
  isMandatory: boolean;
  transactionCount: number;
}

export interface DailySpendPoint {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "05 ноя"
  dayNumber: number;
  expense: number;
  income: number;
  cumulativeExpense: number;
}

export interface CushionMetrics {
  monthlyBaseline: number;
  targetAmount: number;
  currentBalance: number;
  progressPercent: number;
  remainingAmount: number;
  averageMonthlySavings: number;
  monthsToGoal: number | null; // null if already reached or savings <= 0
  estimatedCompletionLabel: string;
}

export interface GoalMetrics {
  goalId: string;
  remainingAmount: number;
  progressPercent: number;
  daysLeft: number;
  weeksLeft: number;
  monthsLeft: number;
  recommendedWeekly: number;
  recommendedMonthly: number;
  isCompleted: boolean;
  isOverdue: boolean;
}

export function formatMoney(amount: number, currency: CurrencyCode = 'RUB'): string {
  const info = CURRENCY_MAP[currency] || CURRENCY_MAP.RUB;
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(Math.abs(rounded));
  const prefix = rounded < 0 ? '−' : '';
  return `${prefix}${formatted} ${info.symbol}`;
}

export function getYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

export function getReferenceYearMonths(referenceDate: Date = new Date()): {
  currentYM: string;
  lastYM: string;
} {
  const curY = referenceDate.getFullYear();
  const curM = referenceDate.getMonth();
  const currentYM = `${curY}-${String(curM + 1).padStart(2, '0')}`;

  const prevDate = new Date(curY, curM - 1, 1);
  const lastYM = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  return { currentYM, lastYM };
}

export function filterTransactions(
  transactions: Transaction[],
  options: {
    period: PeriodFilter;
    type?: 'all' | TransactionType;
    categoryId?: string;
    searchQuery?: string;
    referenceDate?: Date;
  }
): Transaction[] {
  const { currentYM, lastYM } = getReferenceYearMonths(options.referenceDate);
  const query = (options.searchQuery || '').trim().toLowerCase();

  return transactions
    .filter((tx) => {
      if (options.period === 'current_month' && getYearMonth(tx.date) !== currentYM) {
        return false;
      }
      if (options.period === 'last_month' && getYearMonth(tx.date) !== lastYM) {
        return false;
      }
      if (options.type && options.type !== 'all' && tx.type !== options.type) {
        return false;
      }
      if (options.categoryId && options.categoryId !== 'all' && tx.categoryId !== options.categoryId) {
        return false;
      }
      if (query && !tx.note.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return b.createdAt - a.createdAt;
    });
}

export function calculateMonthlyMetrics(transactions: Transaction[]): MonthlyMetrics {
  let income = 0;
  let expenses = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      income += tx.amount;
    } else if (tx.type === 'expense') {
      expenses += tx.amount;
    }
  }

  const freeBalance = income - expenses;
  const savingsRate =
    income > 0 ? Math.round(((income - expenses) / income) * 1000) / 10 : 0;

  return {
    income,
    expenses,
    freeBalance,
    savingsRate,
  };
}

export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[]
): CategoryBreakdownItem[] {
  const expenseTxs = transactions.filter((t) => t.type === 'expense');
  const totalExpenses = expenseTxs.reduce((acc, t) => acc + t.amount, 0);

  const map = new Map<string, { amount: number; count: number }>();
  for (const tx of expenseTxs) {
    const prev = map.get(tx.categoryId) || { amount: 0, count: 0 };
    map.set(tx.categoryId, {
      amount: prev.amount + tx.amount,
      count: prev.count + 1,
    });
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const items: CategoryBreakdownItem[] = expenseCategories.map((cat) => {
    const stat = map.get(cat.id) || { amount: 0, count: 0 };
    const sharePercent =
      totalExpenses > 0 ? Math.round((stat.amount / totalExpenses) * 1000) / 10 : 0;
    const limitFillPercent =
      cat.monthlyLimit > 0
        ? Math.round((stat.amount / cat.monthlyLimit) * 1000) / 10
        : 0;

    let limitStatus: CategoryBreakdownItem['limitStatus'] = 'no_limit';
    if (cat.monthlyLimit > 0) {
      if (limitFillPercent > 100) {
        limitStatus = 'exceeded';
      } else if (limitFillPercent >= 80) {
        limitStatus = 'warning';
      } else {
        limitStatus = 'ok';
      }
    }

    return {
      categoryId: cat.id,
      name: cat.name,
      color: cat.color,
      amount: stat.amount,
      sharePercent,
      monthlyLimit: cat.monthlyLimit,
      limitFillPercent,
      limitStatus,
      isMandatory: cat.isMandatory,
      transactionCount: stat.count,
    };
  });

  return items.sort((a, b) => b.amount - a.amount);
}

const MONTH_SHORT_RU = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

export function calculateDailyDynamics(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): DailySpendPoint[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const ym = `${year}-${String(month + 1).padStart(2, '0')}`;

  const byDay = new Map<number, { expense: number; income: number }>();
  for (let d = 1; d <= daysInMonth; d++) {
    byDay.set(d, { expense: 0, income: 0 });
  }

  for (const tx of transactions) {
    if (getYearMonth(tx.date) !== ym) continue;
    const dayNum = Number(tx.date.slice(8, 10));
    const entry = byDay.get(dayNum);
    if (!entry) continue;
    if (tx.type === 'expense') entry.expense += tx.amount;
    if (tx.type === 'income') entry.income += tx.amount;
  }

  const points: DailySpendPoint[] = [];
  let cumulativeExpense = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const entry = byDay.get(d)!;
    cumulativeExpense += entry.expense;
    const dd = String(d).padStart(2, '0');
    points.push({
      date: `${ym}-${dd}`,
      dayLabel: `${d} ${MONTH_SHORT_RU[month]}`,
      dayNumber: d,
      expense: entry.expense,
      income: entry.income,
      cumulativeExpense,
    });
  }

  return points;
}

export function calculateCushionMetrics(
  cushion: CushionState,
  transactions: Transaction[],
  categories: Category[],
  referenceDate: Date = new Date()
): CushionMetrics {
  const mandatoryIds = new Set(
    categories.filter((c) => c.type === 'expense' && c.isMandatory).map((c) => c.id)
  );

  // Group mandatory expenses by YYYY-MM
  const monthlyMandatoryTotals = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type === 'expense' && mandatoryIds.has(tx.categoryId)) {
      const ym = getYearMonth(tx.date);
      monthlyMandatoryTotals.set(ym, (monthlyMandatoryTotals.get(ym) || 0) + tx.amount);
    }
  }

  let autoMandatoryAvg = 0;
  if (monthlyMandatoryTotals.size > 0) {
    const sum = Array.from(monthlyMandatoryTotals.values()).reduce((a, b) => a + b, 0);
    autoMandatoryAvg = Math.round(sum / monthlyMandatoryTotals.size);
  } else {
    // Fallback to sum of mandatory category limits if no transactions yet
    const limitSum = categories
      .filter((c) => c.type === 'expense' && c.isMandatory)
      .reduce((acc, c) => acc + c.monthlyLimit, 0);
    autoMandatoryAvg = limitSum > 0 ? limitSum : cushion.manualMonthlyExpense || 60000;
  }

  const monthlyBaseline =
    cushion.calculationMode === 'auto_mandatory'
      ? autoMandatoryAvg
      : Math.max(1000, cushion.manualMonthlyExpense);

  const targetAmount = monthlyBaseline * cushion.targetMonths;
  const currentBalance = Math.max(0, cushion.currentBalance);
  const progressPercent =
    targetAmount > 0 ? Math.min(100, Math.round((currentBalance / targetAmount) * 1000) / 10) : 0;
  const remainingAmount = Math.max(0, targetAmount - currentBalance);

  const avgSavings = Math.max(0, cushion.monthlyPlannedContribution);
  let monthsToGoal: number | null = null;
  let estimatedCompletionLabel = 'Цель достигнута';

  if (remainingAmount === 0) {
    monthsToGoal = 0;
    estimatedCompletionLabel = 'Подушка полностью сформирована';
  } else if (avgSavings > 0) {
    monthsToGoal = Math.ceil(remainingAmount / avgSavings);
    const completionDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + monthsToGoal,
      1
    );
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      month: 'long',
      year: 'numeric',
    });
    estimatedCompletionLabel = `${formatter.format(completionDate)} (~${monthsToGoal} мес.)`;
  } else {
    estimatedCompletionLabel = 'Укажите ежемесячное пополнение';
  }

  return {
    monthlyBaseline,
    targetAmount,
    currentBalance,
    progressPercent,
    remainingAmount,
    averageMonthlySavings: avgSavings,
    monthsToGoal,
    estimatedCompletionLabel,
  };
}

export function calculateGoalMetrics(
  goal: SavingsGoal,
  referenceDate: Date = new Date()
): GoalMetrics {
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  const progressPercent =
    goal.targetAmount > 0
      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 1000) / 10)
      : 0;
  const isCompleted = remainingAmount <= 0;

  const deadlineDate = new Date(`${goal.deadline}T23:59:59`);
  const diffMs = deadlineDate.getTime() - referenceDate.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = !isCompleted && daysLeft < 0;

  const effectiveDays = Math.max(7, daysLeft);
  const weeksLeft = Math.max(1, Math.ceil(effectiveDays / 7));
  const monthsLeft = Math.max(1, Math.round((effectiveDays / 30.44) * 10) / 10);

  const recommendedWeekly = isCompleted ? 0 : Math.ceil(remainingAmount / weeksLeft);
  const recommendedMonthly = isCompleted ? 0 : Math.ceil(remainingAmount / Math.max(1, effectiveDays / 30.44));

  return {
    goalId: goal.id,
    remainingAmount,
    progressPercent,
    daysLeft,
    weeksLeft,
    monthsLeft,
    recommendedWeekly,
    recommendedMonthly,
    isCompleted,
    isOverdue,
  };
}

export function transactionsToCSV(
  transactions: Transaction[],
  categories: Category[]
): string {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const header = ['Дата', 'Тип', 'Категория', 'Сумма', 'Заметка'];
  const rows = transactions.map((tx) => {
    const typeLabel = tx.type === 'income' ? 'Доход' : 'Расход';
    const catName = catMap.get(tx.categoryId) || 'Прочее';
    const escapedNote = `"${(tx.note || '').replace(/"/g, '""')}"`;
    const escapedCat = `"${catName.replace(/"/g, '""')}"`;
    return [tx.date, typeLabel, escapedCat, String(tx.amount), escapedNote].join(';');
  });

  // Prefix UTF-8 BOM for proper Cyrillic display in Excel / Numbers
  return '\uFEFF' + [header.join(';'), ...rows].join('\n');
}

export function validateBackupJSON(raw: unknown): FinancialStoreData | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<FinancialStoreData>;
  if (!Array.isArray(obj.transactions) || !Array.isArray(obj.categories)) {
    return null;
  }
  if (!obj.cushion || typeof obj.cushion.currentBalance !== 'number') {
    return null;
  }
  if (!Array.isArray(obj.goals) || !obj.settings) {
    return null;
  }
  return obj as FinancialStoreData;
}
