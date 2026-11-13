import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ArrowRight, Camera, Plus, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import {
  Category,
  CurrencyCode,
  CushionState,
  SavingsGoal,
  Transaction,
} from '../types/finance';
import {
  calculateCategoryBreakdown,
  calculateCushionMetrics,
  calculateDailyDynamics,
  calculateMonthlyMetrics,
  filterTransactions,
  formatMoney,
} from '../utils/financeMath';

interface DashboardViewProps {
  transactions: Transaction[];
  categories: Category[];
  cushion: CushionState;
  goals: SavingsGoal[];
  currency: CurrencyCode;
  onOpenAddModal: () => void;
  onOpenScannerModal: () => void;
  onOpenCategoryManager: () => void;
  onNavigateTab: (tab: 'dashboard' | 'transactions' | 'cushion' | 'advisor' | 'settings') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  categories,
  cushion,
  goals,
  currency,
  onOpenAddModal,
  onOpenScannerModal,
  onOpenCategoryManager,
  onNavigateTab,
}) => {
  const currentMonthTxs = filterTransactions(transactions, { period: 'current_month' });
  const prevMonthTxs = filterTransactions(transactions, { period: 'last_month' });

  const metrics = calculateMonthlyMetrics(currentMonthTxs);
  const prevMetrics = calculateMonthlyMetrics(prevMonthTxs);
  const categoryBreakdown = calculateCategoryBreakdown(currentMonthTxs, categories);
  const activeCategories = categoryBreakdown.filter((c) => c.amount > 0);
  const dailyData = calculateDailyDynamics(transactions);
  const cushionMetrics = calculateCushionMetrics(cushion, transactions, categories);

  const catMap = new Map(categories.map((c) => [c.id, c]));

  const currentMonthLabel = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const expenseDeltaPercent =
    prevMetrics.expenses > 0
      ? Math.round(((metrics.expenses - prevMetrics.expenses) / prevMetrics.expenses) * 100)
      : null;

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Финансовая сводка · {currentMonthLabel}
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Обзор бюджета за месяц
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenScannerModal}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Скан скрина из банка</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('advisor')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>ИИ-разбор месяца</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить трату</span>
          </button>
        </div>
      </div>

      {/* 4 Key KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Доходы за месяц
          </p>
          <p
            data-testid="kpi-income"
            className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100"
          >
            {formatMoney(metrics.income, currency)}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Прошлый месяц: <span className="font-mono tabular-nums">{formatMoney(prevMetrics.income, currency)}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Расходы за месяц
          </p>
          <p
            data-testid="kpi-expenses"
            className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100"
          >
            {formatMoney(metrics.expenses, currency)}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {expenseDeltaPercent !== null ? (
              <span>
                {expenseDeltaPercent > 0 ? `+${expenseDeltaPercent}%` : `${expenseDeltaPercent}%`} к прошлому месяцу
              </span>
            ) : (
              <span>Операций за месяц: {currentMonthTxs.filter((t) => t.type === 'expense').length}</span>
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Свободный остаток
          </p>
          <p
            data-testid="kpi-free-balance"
            className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
              metrics.freeBalance >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatMoney(metrics.freeBalance, currency)}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Доступно для подушки и копилок
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Норма сбережений
          </p>
          <p
            data-testid="kpi-savings-rate"
            className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100"
          >
            {metrics.savingsRate}%
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {metrics.savingsRate >= 20
              ? 'Отличный темп (ориентир ≥ 20%)'
              : 'Рекомендуемая цель: от 20% дохода'}
          </p>
        </div>
      </div>

      {/* Financial Cushion Widget + Quick Goals Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Финансовая подушка безопасности
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('cushion')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Калькулятор</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Резерв на {cushion.targetMonths} мес. обязательных расходов ({formatMoney(cushionMetrics.monthlyBaseline, currency)} / мес)
            </p>

            <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {formatMoney(cushionMetrics.currentBalance, currency)}
                </span>
                <span className="ml-2 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  из {formatMoney(cushionMetrics.targetAmount, currency)}
                </span>
              </div>
              <span className="text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {cushionMetrics.progressPercent}%
              </span>
            </div>

            <div className="mt-2.5 h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${Math.min(100, cushionMetrics.progressPercent)}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Осталось накопить:{' '}
              <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {formatMoney(cushionMetrics.remainingAmount, currency)}
              </strong>
            </span>
            <span>·</span>
            <span>
              Прогноз достижения:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {cushionMetrics.estimatedCompletionLabel}
              </strong>
            </span>
          </div>
        </div>

        {/* Active Savings Goals Summary */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Цели накоплений ({goals.length})
              </h2>
              <button
                type="button"
                onClick={() => onNavigateTab('cushion')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Все копилки</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="mt-6 py-6 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  У вас пока нет активных копилок. Создайте цель на отпуск, технику или обучение.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('cushion')}
                  className="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Создать первую цель
                </button>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                {goals.slice(0, 3).map((goal) => {
                  const pct =
                    goal.targetAmount > 0
                      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                      : 0;
                  return (
                    <div key={goal.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {goal.title}
                        </span>
                        <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                          {formatMoney(goal.currentAmount, currency)} / {formatMoney(goal.targetAmount, currency)} ({pct}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-900 dark:bg-emerald-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Всего в копилках</span>
            <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {formatMoney(
                goals.reduce((acc, g) => acc + g.currentAmount, 0),
                currency
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* Charts Row: Category Donut Chart + Daily Spending Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Donut Chart + Category Limits */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Структура расходов и лимиты
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Распределение трат по категориям за текущий месяц
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCategoryManager}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Лимиты</span>
            </button>
          </div>

          {activeCategories.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                За текущий месяц пока нет расходов.
              </p>
              <button
                type="button"
                onClick={onOpenAddModal}
                className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
              >
                Добавить первую трату
              </button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-5 h-52 w-full min-w-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeCategories}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {activeCategories.map((entry) => (
                        <Cell key={entry.categoryId} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: unknown) => [
                        formatMoney(Number(value) || 0, currency),
                        'Сумма',
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        backgroundColor: '#0f172a',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-slate-400">Всего</span>
                  <span className="text-xs font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {formatMoney(metrics.expenses, currency)}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-7 space-y-3">
                {categoryBreakdown.slice(0, 6).map((cat) => {
                  const barColor =
                    cat.limitStatus === 'exceeded'
                      ? '#ef4444'
                      : cat.limitStatus === 'warning'
                      ? '#f59e0b'
                      : cat.color;

                  return (
                    <div key={cat.categoryId}>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-xs shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {cat.name}
                          </span>
                          <span className="text-slate-400 font-mono tabular-nums">
                            · {cat.sharePercent}%
                          </span>
                        </div>
                        <div className="font-mono tabular-nums text-right shrink-0">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatMoney(cat.amount, currency)}
                          </span>
                          {cat.monthlyLimit > 0 && (
                            <span className="text-slate-400">
                              {' '}
                              / {formatMoney(cat.monthlyLimit, currency)}
                            </span>
                          )}
                        </div>
                      </div>

                      {cat.monthlyLimit > 0 && (
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, cat.limitFillPercent)}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Daily Spending Dynamics Chart */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Динамика трат по дням месяца
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ежедневные расходы и накопленный итог с 1-го числа
            </p>
          </div>

          <div className="mt-4 h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.18} />
                <XAxis
                  dataKey="dayNumber"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                />
                <RechartsTooltip
                  labelFormatter={(_label, payload) =>
                    payload?.[0]?.payload?.dayLabel || ''
                  }
                  formatter={(value: unknown, name: unknown) => [
                    formatMoney(Number(value) || 0, currency),
                    name === 'expense' ? 'Расход за день' : 'Накопленный расход',
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Средний расход в день:{' '}
              <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {formatMoney(
                  Math.round(metrics.expenses / Math.max(1, new Date().getDate())),
                  currency
                )}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('transactions')}
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Все операции →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Последние операции
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Недавние доходы и списания за текущий месяц
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('transactions')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>История операций</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {currentMonthTxs.length === 0 ? (
          <div className="mt-6 py-8 text-center border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Записей за этот месяц пока нет.
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80 border-t border-slate-100 dark:border-slate-800/80">
            {currentMonthTxs.slice(0, 6).map((tx) => {
              const cat = catMap.get(tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {tx.note}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span
                        className="w-2 h-2 rounded-xs shrink-0"
                        style={{ backgroundColor: cat?.color || '#64748b' }}
                      />
                      <span>{cat?.name || 'Прочее'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{tx.date}</span>
                    </div>
                  </div>

                  <span
                    className={`font-mono tabular-nums font-semibold whitespace-nowrap shrink-0 ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '−'}
                    {formatMoney(tx.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
