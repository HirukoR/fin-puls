import React, { useState } from 'react';
import {
  Camera,
  Download,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import {
  Category,
  CurrencyCode,
  PeriodFilter,
  Transaction,
  TransactionType,
} from '../types/finance';
import {
  calculateCategoryBreakdown,
  calculateMonthlyMetrics,
  filterTransactions,
  formatMoney,
  transactionsToCSV,
} from '../utils/financeMath';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyCode;
  onOpenAddModal: () => void;
  onOpenScannerModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenCategoryManager: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  currency,
  onOpenAddModal,
  onOpenScannerModal,
  onEditTransaction,
  onDeleteTransaction,
  onOpenCategoryManager,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('current_month');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = filterTransactions(transactions, {
    period,
    type: typeFilter,
    categoryId: selectedCategoryId,
    searchQuery,
  });

  const periodTransactions = filterTransactions(transactions, { period });
  const summary = calculateMonthlyMetrics(filtered);
  const categoryLimits = calculateCategoryBreakdown(periodTransactions, categories);
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const handleDownloadCSV = () => {
    const csvContent = transactionsToCSV(filtered, categories);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finpulse-transactions-${period}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Журнал доходов, расходов и контроль лимитов
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Учёт операций
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenScannerModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Скан скрина из банка</span>
          </button>

          <button
            type="button"
            onClick={onOpenCategoryManager}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Категории и лимиты</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Экспорт CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить операцию</span>
          </button>
        </div>
      </div>

      {/* Category Limits Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Заполнение месячных лимитов по категориям
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Нажмите на любую категорию для быстрой фильтрации списка ниже
            </p>
          </div>
          {selectedCategoryId !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Сбросить фильтр категории
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categoryLimits.map((cat) => {
            const isSelected = selectedCategoryId === cat.categoryId;
            const statusText =
              cat.limitStatus === 'exceeded'
                ? 'Превышен'
                : cat.limitStatus === 'warning'
                ? 'Почти исчерпан'
                : 'В норме';

            return (
              <button
                key={cat.categoryId}
                type="button"
                onClick={() =>
                  setSelectedCategoryId(isSelected ? 'all' : cat.categoryId)
                }
                className={`text-left rounded-xl border bg-white dark:bg-slate-900 p-3.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      cat.limitStatus === 'exceeded'
                        ? 'text-rose-600 dark:text-rose-400 font-semibold'
                        : cat.limitStatus === 'warning'
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {cat.monthlyLimit > 0 ? `${cat.limitFillPercent}% · ${statusText}` : 'Без лимита'}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between gap-2 text-xs font-mono tabular-nums">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(cat.amount, currency)}
                  </span>
                  {cat.monthlyLimit > 0 && (
                    <span className="text-slate-400">
                      из {formatMoney(cat.monthlyLimit, currency)}
                    </span>
                  )}
                </div>

                {cat.monthlyLimit > 0 && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, cat.limitFillPercent)}%`,
                        backgroundColor:
                          cat.limitStatus === 'exceeded'
                            ? '#ef4444'
                            : cat.limitStatus === 'warning'
                            ? '#f59e0b'
                            : cat.color,
                      }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Period segmented buttons */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {(
              [
                { id: 'current_month', label: 'Текущий месяц' },
                { id: 'last_month', label: 'Прошлый месяц' },
                { id: 'all_time', label: 'Всё время' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriod(item.id)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  period === item.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Type + Category + Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 lg:max-w-2xl">
            <select
              aria-label="Фильтр по типу операции"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | TransactionType)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100"
            >
              <option value="all">Все типы</option>
              <option value="expense">Только расходы</option>
              <option value="income">Только доходы</option>
            </select>

            <select
              aria-label="Фильтр по категории"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100"
            >
              <option value="all">Все категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'income' ? 'Доход' : 'Расход'})
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Поиск по заметкам"
                placeholder="Поиск по описанию или магазину..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Filtered summary bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Найдено операций: <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{filtered.length}</strong></span>
          <div className="flex flex-wrap items-center gap-3 font-mono tabular-nums">
            <span>
              Доходы: <strong className="text-emerald-600 dark:text-emerald-400">+{formatMoney(summary.income, currency)}</strong>
            </span>
            <span>·</span>
            <span>
              Расходы: <strong className="text-slate-900 dark:text-slate-100">−{formatMoney(summary.expenses, currency)}</strong>
            </span>
            <span>·</span>
            <span>
              Сальдо: <strong className={summary.freeBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{formatMoney(summary.freeBalance, currency)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              По выбранным фильтрам операций не найдено
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Попробуйте переключить период или добавьте новую запись.
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить операцию</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filtered.map((tx) => {
              const cat = catMap.get(tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {tx.note}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span
                        className="w-2 h-2 rounded-xs shrink-0"
                        style={{ backgroundColor: cat?.color || '#64748b' }}
                      />
                      <span>{cat?.name || 'Прочее'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{tx.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tx.type === 'income' ? 'Доход' : 'Расход'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-sm font-mono tabular-nums font-bold ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '−'}
                      {formatMoney(tx.amount, currency)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditTransaction(tx)}
                        aria-label={`Редактировать «${tx.note}»`}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(tx.id)}
                        aria-label={`Удалить «${tx.note}»`}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
