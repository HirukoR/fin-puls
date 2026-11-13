import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  ShieldCheck,
  Target,
  Trash2,
} from 'lucide-react';
import {
  Category,
  CurrencyCode,
  CushionState,
  SavingsGoal,
  Transaction,
} from '../types/finance';
import {
  calculateCushionMetrics,
  calculateGoalMetrics,
  formatMoney,
} from '../utils/financeMath';
import { CURRENCY_MAP } from '../data/demoData';

interface CushionAndGoalsViewProps {
  cushion: CushionState;
  goals: SavingsGoal[];
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyCode;
  onUpdateCushion: (next: CushionState) => void;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoalAmount: (goalId: string, deltaAmount: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const CushionAndGoalsView: React.FC<CushionAndGoalsViewProps> = ({
  cushion,
  goals,
  transactions,
  categories,
  currency,
  onUpdateCushion,
  onAddGoal,
  onUpdateGoalAmount,
  onDeleteGoal,
}) => {
  const currencySymbol = CURRENCY_MAP[currency]?.symbol || '₽';
  const cushionMetrics = calculateCushionMetrics(cushion, transactions, categories);

  // Cushion contribution state
  const [contribAmount, setContribAmount] = useState('');
  const [contribNote, setContribNote] = useState('');
  const [contribType, setContribType] = useState<'deposit' | 'withdraw'>('deposit');

  // New goal modal/form state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('0');
  const [goalDeadline, setGoalDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 4);
    return d.toISOString().slice(0, 10);
  });
  const [goalTag, setGoalTag] = useState('Накопления');
  const [goalError, setGoalError] = useState('');

  // Custom top-up input per goal
  const [topUpInputs, setTopUpInputs] = useState<Record<string, string>>({});

  const handleCushionContribution = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.round(Number(contribAmount));
    if (!val || val <= 0) return;

    const signedAmount = contribType === 'deposit' ? val : -val;
    const nextBalance = Math.max(0, cushion.currentBalance + signedAmount);
    const newEntry = {
      id: `c_${Date.now()}`,
      amount: signedAmount,
      date: new Date().toISOString().slice(0, 10),
      note:
        contribNote.trim() ||
        (contribType === 'deposit' ? 'Пополнение подушки безопасности' : 'Частичное снятие из резерва'),
    };

    onUpdateCushion({
      ...cushion,
      currentBalance: nextBalance,
      history: [newEntry, ...cushion.history],
    });
    setContribAmount('');
    setContribNote('');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = goalTitle.trim();
    const targetNum = Math.round(Number(goalTarget));
    const currentNum = Math.max(0, Math.round(Number(goalCurrent) || 0));

    if (!cleanTitle) {
      setGoalError('Укажите название цели');
      return;
    }
    if (!targetNum || targetNum <= 0) {
      setGoalError('Целевая сумма должна быть больше нуля');
      return;
    }
    if (!goalDeadline) {
      setGoalError('Укажите желаемую дату достижения');
      return;
    }

    onAddGoal({
      title: cleanTitle,
      targetAmount: targetNum,
      currentAmount: currentNum,
      deadline: goalDeadline,
      categoryTag: goalTag.trim() || 'Копилка',
    });

    setGoalTitle('');
    setGoalTarget('');
    setGoalCurrent('0');
    setGoalError('');
    setShowGoalForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Резервный фонд и целевые копилки
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Финансовая подушка и цели
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowGoalForm((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Новая цель накоплений</span>
        </button>
      </div>

      {/* Section 1: Safety Cushion Calculator & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 cols: Calculator & Progress */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Калькулятор финансовой подушки
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Запас прочности на случай потери дохода или непредвиденных обстоятельств
                </p>
              </div>
            </div>

            {/* 3 / 6 / 12 Months Selector */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 shrink-0">
              {([3, 6, 12] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onUpdateCushion({ ...cushion, targetMonths: m })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cushion.targetMonths === m
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {m} мес.
                </button>
              ))}
            </div>
          </div>

          {/* Progress Display */}
          <div className="border-y border-slate-100 dark:border-slate-800/90 py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Накоплено в подушке безопасности
                </p>
                <p
                  data-testid="cushion-balance"
                  className="mt-1 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100"
                >
                  {formatMoney(cushionMetrics.currentBalance, currency)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Целевой объём ({cushion.targetMonths} мес.)
                </p>
                <p
                  data-testid="cushion-target"
                  className="mt-1 text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400"
                >
                  {formatMoney(cushionMetrics.targetAmount, currency)}
                </p>
              </div>
            </div>

            <div className="mt-4 h-3 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${Math.min(100, cushionMetrics.progressPercent)}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span>
                Прогресс: <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{cushionMetrics.progressPercent}%</strong>
              </span>
              <span>·</span>
              <span>
                Осталось отложить:{' '}
                <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {formatMoney(cushionMetrics.remainingAmount, currency)}
                </strong>
              </span>
              <span>·</span>
              <span>
                Ориентир закрытия:{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {cushionMetrics.estimatedCompletionLabel}
                </strong>
              </span>
            </div>
          </div>

          {/* Calculation Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                База обязательных расходов в месяц
              </label>
              <div className="mt-1.5 flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCushion({ ...cushion, calculationMode: 'auto_mandatory' })
                  }
                  className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    cushion.calculationMode === 'auto_mandatory'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Авто по тратам
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateCushion({ ...cushion, calculationMode: 'manual' })
                  }
                  className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    cushion.calculationMode === 'manual'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Задать вручную
                </button>
              </div>

              {cushion.calculationMode === 'manual' ? (
                <div className="mt-2">
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    aria-label="Сумма обязательных расходов в месяц"
                    value={cushion.manualMonthlyExpense}
                    onChange={(e) =>
                      onUpdateCushion({
                        ...cushion,
                        manualMonthlyExpense: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Средний обязательный минимум (Еда, Жильё, Транспорт, Здоровье):{' '}
                  <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {formatMoney(cushionMetrics.monthlyBaseline, currency)} / мес
                  </strong>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="cushion-monthly-plan"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Средний темп пополнения в месяц ({currencySymbol})
              </label>
              <input
                id="cushion-monthly-plan"
                type="number"
                min="0"
                step="1000"
                value={cushion.monthlyPlannedContribution}
                onChange={(e) =>
                  onUpdateCushion({
                    ...cushion,
                    monthlyPlannedContribution: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Используется для расчёта примерной даты закрытия цели
              </p>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Deposit Form & Contribution History */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Пополнение и история резерва
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Фиксируйте переводы на накопительный счёт или вклад
            </p>

            <form onSubmit={handleCushionContribution} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setContribType('deposit')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    contribType === 'deposit'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Пополнить подушку
                </button>
                <button
                  type="button"
                  onClick={() => setContribType('withdraw')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    contribType === 'withdraw'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Снять из резерва
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <input
                  type="number"
                  min="1"
                  step="any"
                  aria-label="Сумма операции по подушке"
                  placeholder={`Сумма (${currencySymbol})`}
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="sm:col-span-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
                <input
                  type="text"
                  aria-label="Заметка к пополнению подушки"
                  placeholder="Комментарий (напр. 15% с аванса)"
                  value={contribNote}
                  onChange={(e) => setContribNote(e.target.value)}
                  className="sm:col-span-7 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 dark:bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                {contribType === 'deposit' ? 'Зачислить в подушку' : 'Зафиксировать снятие'}
              </button>
            </form>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              История операций по подушке ({cushion.history.length})
            </h3>
            {cushion.history.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
                Пополнений пока не было.
              </p>
            ) : (
              <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                {cushion.history.map((item) => (
                  <div
                    key={item.id}
                    className="py-2 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {item.note}
                      </p>
                      <p className="text-[11px] font-mono tabular-nums text-slate-400">
                        {item.date}
                      </p>
                    </div>
                    <span
                      className={`font-mono tabular-nums font-semibold shrink-0 ${
                        item.amount >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.amount >= 0 ? '+' : ''}
                      {formatMoney(item.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Savings Goals ("Копилки") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Цели накоплений (Копилки)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Автоматический расчёт комфортного шага откладывания в неделю и в месяц до дедлайна
              </p>
            </div>
          </div>
        </div>

        {/* Create New Goal Inline Form */}
        {showGoalForm && (
          <form
            onSubmit={handleCreateGoal}
            className="rounded-2xl border border-emerald-500/40 bg-white dark:bg-slate-900 p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Создать новую копилку
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="lg:col-span-2">
                <label
                  htmlFor="goal-title-input"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Название цели
                </label>
                <input
                  id="goal-title-input"
                  type="text"
                  placeholder="Например: Отпуск на Алтае"
                  value={goalTitle}
                  onChange={(e) => {
                    setGoalTitle(e.target.value);
                    if (goalError) setGoalError('');
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="goal-target-input"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Целевая сумма ({currencySymbol})
                </label>
                <input
                  id="goal-target-input"
                  type="number"
                  min="1"
                  placeholder="150000"
                  value={goalTarget}
                  onChange={(e) => {
                    setGoalTarget(e.target.value);
                    if (goalError) setGoalError('');
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="goal-current-input"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Уже накоплено ({currencySymbol})
                </label>
                <input
                  id="goal-current-input"
                  type="number"
                  min="0"
                  value={goalCurrent}
                  onChange={(e) => setGoalCurrent(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="goal-deadline-input"
                  className="block text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Дедлайн
                </label>
                <input
                  id="goal-deadline-input"
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="goal-tag-input"
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  Рубрика:
                </label>
                <input
                  id="goal-tag-input"
                  type="text"
                  value={goalTag}
                  onChange={(e) => setGoalTag(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoalForm(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                >
                  Создать цель
                </button>
              </div>
            </div>

            {goalError && <p className="text-xs text-rose-600">{goalError}</p>}
          </form>
        )}

        {/* Goals Cards Grid */}
        {goals.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Копилки ещё не созданы
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Добавьте финансовую цель, чтобы видеть точный еженедельный и ежемесячный план откладывания.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal) => {
              const gm = calculateGoalMetrics(goal);
              const topUpVal = topUpInputs[goal.id] ?? '';

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between space-y-5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {goal.categoryTag} · до {goal.deadline}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                          {goal.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteGoal(goal.id)}
                        aria-label={`Удалить цель «${goal.title}»`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between gap-2 font-mono tabular-nums">
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {formatMoney(goal.currentAmount, currency)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        из {formatMoney(goal.targetAmount, currency)} ({gm.progressPercent}%)
                      </span>
                    </div>

                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all"
                        style={{ width: `${Math.min(100, gm.progressPercent)}%` }}
                      />
                    </div>

                    {/* Recommended weekly & monthly savings */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                      {gm.isCompleted ? (
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Цель полностью достигнута!
                        </p>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>Рекомендуемо в неделю:</span>
                            <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                              {formatMoney(gm.recommendedWeekly, currency)} / нед
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>Рекомендуемо в месяц:</span>
                            <strong className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                              {formatMoney(gm.recommendedMonthly, currency)} / мес
                            </strong>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {gm.isOverdue
                                ? 'Срок дедлайна прошёл'
                                : `Осталось ${gm.daysLeft} дн. (~${gm.weeksLeft} нед.)`}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick top-up form */}
                  {!gm.isCompleted && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder={`Пополнить (${currencySymbol})`}
                        aria-label={`Сумма пополнения для цели ${goal.title}`}
                        value={topUpVal}
                        onChange={(e) =>
                          setTopUpInputs((prev) => ({ ...prev, [goal.id]: e.target.value }))
                        }
                        className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const num = Math.round(Number(topUpVal));
                          if (!num || num <= 0) return;
                          onUpdateGoalAmount(goal.id, num);
                          setTopUpInputs((prev) => ({ ...prev, [goal.id]: '' }));
                        }}
                        className="rounded-xl bg-slate-900 dark:bg-slate-100 px-3.5 py-2 text-xs font-semibold text-white dark:text-slate-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        + В копилку
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
