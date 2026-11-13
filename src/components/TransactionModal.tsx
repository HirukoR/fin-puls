import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category, CurrencyCode, Transaction, TransactionType } from '../types/finance';
import { CURRENCY_MAP } from '../data/demoData';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currency: CurrencyCode;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  currency,
  onSave,
  editingTransaction,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('cat_food');
  const [date, setDate] = useState(todayStr);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(String(editingTransaction.amount));
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note);
      setError('');
    } else {
      setType('expense');
      setAmountStr('');
      const firstExpense = categories.find((c) => c.type === 'expense');
      setCategoryId(firstExpense ? firstExpense.id : categories[0]?.id || 'cat_food');
      setDate(new Date().toISOString().slice(0, 10));
      setNote('');
      setError('');
    }
  }, [isOpen, editingTransaction, categories]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleTypeSwitch = (newType: TransactionType) => {
    setType(newType);
    const matching = categories.filter((c) => c.type === newType);
    if (matching.length > 0 && !matching.some((c) => c.id === categoryId)) {
      setCategoryId(matching[0].id);
    }
  };

  if (!isOpen) return null;

  const currencySymbol = CURRENCY_MAP[currency]?.symbol || '₽';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amountStr.replace(/\s+/g, '').replace(',', '.'));
    if (!numericAmount || numericAmount <= 0 || Number.isNaN(numericAmount)) {
      setError('Введите корректную сумму больше нуля');
      return;
    }
    if (!categoryId) {
      setError('Выберите категорию');
      return;
    }
    if (!date) {
      setError('Укажите дату операции');
      return;
    }

    const selectedCat = categories.find((c) => c.id === categoryId);
    const cleanNote = note.trim() || selectedCat?.name || 'Операция';

    onSave(
      {
        type,
        amount: Math.round(numericAmount),
        categoryId,
        date,
        note: cleanNote,
      },
      editingTransaction?.id
    );
    onClose();
  };

  const quickAmounts = type === 'expense' ? [350, 1000, 2500, 5000] : [15000, 50000, 100000];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-tx-title"
    >
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="modal-tx-title"
            className="text-lg font-bold text-slate-900 dark:text-slate-100"
          >
            {editingTransaction ? 'Редактировать операцию' : 'Новая операция'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно операции"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Segmented control: Expense vs Income */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => handleTypeSwitch('expense')}
              className={`py-2 px-4 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Расход
            </button>
            <button
              type="button"
              onClick={() => handleTypeSwitch('income')}
              className={`py-2 px-4 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Доход
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label
              htmlFor="tx-amount-input"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Сумма ({currencySymbol})
            </label>
            <div className="mt-1.5 relative">
              <input
                id="tx-amount-input"
                type="number"
                inputMode="decimal"
                step="any"
                min="1"
                placeholder="Например: 2500"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-4 py-3 text-xl font-mono font-semibold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {quickAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    const cur = Number(amountStr) || 0;
                    setAmountStr(String(cur + preset));
                    if (error) setError('');
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-600 dark:text-slate-300 hover:border-emerald-500 transition-colors cursor-pointer"
                >
                  +{preset.toLocaleString('ru-RU')} {currencySymbol}
                </button>
              ))}
            </div>
          </div>

          {/* Category grid selector */}
          <div>
            <label
              htmlFor="tx-category-select"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Категория
            </label>
            <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {filteredCategories.map((cat) => {
                const isSelected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Note */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="tx-date-input"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Дата
              </label>
              <input
                id="tx-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="tx-note-input"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Комментарий / заметка
              </label>
              <input
                id="tx-note-input"
                type="text"
                placeholder="Например: Продукты на неделю во ВкусВилл"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
            >
              {editingTransaction ? 'Сохранить изменения' : 'Добавить операцию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
