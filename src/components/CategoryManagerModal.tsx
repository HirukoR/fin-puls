import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Category, CurrencyCode, TransactionType } from '../types/finance';
import { CURRENCY_MAP } from '../data/demoData';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currency: CurrencyCode;
  onUpdateCategory: (updated: Category) => void;
  onAddCategory: (newCat: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#ef4444',
  '#14b8a6',
  '#64748b',
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  currency,
  onUpdateCategory,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TransactionType>('expense');
  const [newLimit, setNewLimit] = useState('10000');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newMandatory, setNewMandatory] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currencySymbol = CURRENCY_MAP[currency]?.symbol || '₽';
  const expenseCats = categories.filter((c) => c.type === 'expense');
  const incomeCats = categories.filter((c) => c.type === 'income');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Введите название категории');
      return;
    }
    onAddCategory({
      name: trimmed,
      type: newType,
      color: newColor,
      monthlyLimit: newType === 'expense' ? Math.max(0, Number(newLimit) || 0) : 0,
      isMandatory: newType === 'expense' ? newMandatory : false,
      isCustom: true,
    });
    setNewName('');
    setNewLimit('10000');
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cat-manager-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <h2
              id="cat-manager-title"
              className="text-base font-bold text-slate-900 dark:text-slate-100"
            >
              Категории и месячные лимиты
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Настройте лимиты на месяц и отметьте обязательные статьи для расчёта подушки безопасности
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть управление категориями"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add new category form */}
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3"
          >
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Добавить свою категорию
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label
                  htmlFor="new-cat-name"
                  className="block text-xs text-slate-600 dark:text-slate-400"
                >
                  Название
                </label>
                <input
                  id="new-cat-name"
                  type="text"
                  placeholder="Например: Образование"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (error) setError('');
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="new-cat-type"
                  className="block text-xs text-slate-600 dark:text-slate-400"
                >
                  Тип
                </label>
                <select
                  id="new-cat-type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TransactionType)}
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="expense">Расход</option>
                  <option value="income">Доход</option>
                </select>
              </div>

              {newType === 'expense' && (
                <div className="sm:col-span-3">
                  <label
                    htmlFor="new-cat-limit"
                    className="block text-xs text-slate-600 dark:text-slate-400"
                  >
                    Лимит / мес ({currencySymbol})
                  </label>
                  <input
                    id="new-cat-limit"
                    type="number"
                    min="0"
                    step="500"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              <div className={newType === 'expense' ? 'sm:col-span-2' : 'sm:col-span-5'}>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Создать</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Цвет:</span>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    aria-label={`Выбрать цвет ${c}`}
                    className={`w-5 h-5 rounded-md transition-transform cursor-pointer ${
                      newColor === c ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {newType === 'expense' && (
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMandatory}
                    onChange={(e) => setNewMandatory(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Базовый обязательный расход (для подушки)</span>
                </label>
              )}
            </div>

            {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
          </form>

          {/* Expense categories list */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
              Категории расходов ({expenseCats.length})
            </h3>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
              {expenseCats.map((cat) => (
                <div
                  key={cat.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <input
                      type="text"
                      aria-label={`Название категории ${cat.name}`}
                      value={cat.name}
                      onChange={(e) =>
                        onUpdateCategory({ ...cat, name: e.target.value })
                      }
                      className="rounded-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 bg-transparent px-1.5 py-1 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cat.isMandatory}
                        onChange={(e) =>
                          onUpdateCategory({ ...cat, isMandatory: e.target.checked })
                        }
                        className="rounded border-slate-300 text-emerald-600"
                      />
                      <span>Обязательная</span>
                    </label>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Лимит:</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        aria-label={`Месячный лимит для ${cat.name}`}
                        value={cat.monthlyLimit}
                        onChange={(e) =>
                          onUpdateCategory({
                            ...cat,
                            monthlyLimit: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-right text-xs font-mono text-slate-900 dark:text-slate-100"
                      />
                      <span className="text-xs font-mono text-slate-500">{currencySymbol}</span>
                    </div>

                    {cat.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteCategory(cat.id)}
                        aria-label={`Удалить категорию ${cat.name}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Income categories list */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
              Категории доходов ({incomeCats.length})
            </h3>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
              {incomeCats.map((cat) => (
                <div
                  key={cat.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <input
                      type="text"
                      aria-label={`Название категории дохода ${cat.name}`}
                      value={cat.name}
                      onChange={(e) =>
                        onUpdateCategory({ ...cat, name: e.target.value })
                      }
                      className="w-full max-w-xs rounded-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 bg-transparent px-1.5 py-1 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>
                  {cat.isCustom && (
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat.id)}
                      aria-label={`Удалить категорию ${cat.name}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 dark:bg-slate-100 px-5 py-2 text-xs font-semibold text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
