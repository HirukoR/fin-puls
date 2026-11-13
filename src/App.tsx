/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ListOrdered,
  Moon,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import {
  AppSettings,
  Category,
  CushionState,
  FinancialStoreData,
  SavingsGoal,
  Transaction,
} from './types/finance';
import {
  createDemoStoreData,
  createEmptyStoreData,
  DEFAULT_CATEGORIES,
} from './data/demoData';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { CushionAndGoalsView } from './components/CushionAndGoalsView';
import { AIAdvisorView } from './components/AIAdvisorView';
import { SettingsView } from './components/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { OfflineIndicator } from './components/PWAInstallButton';

const STORAGE_KEY = 'finpulse_personal_finance_v1';

type ActiveTab = 'dashboard' | 'transactions' | 'cushion' | 'advisor' | 'settings';

function loadInitialStore(): FinancialStoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FinancialStoreData;
      if (parsed && Array.isArray(parsed.transactions) && Array.isArray(parsed.categories)) {
        const existingIds = new Set(parsed.categories.map((c) => c.id));
        const missingDefaults = DEFAULT_CATEGORIES.filter((c) => !existingIds.has(c.id));
        return {
          ...parsed,
          categories:
            missingDefaults.length > 0
              ? [...parsed.categories, ...missingDefaults]
              : parsed.categories,
        };
      }
    }
  } catch {
    // Ignore storage read errors and fall back to demo store
  }
  return createDemoStoreData();
}

export default function App() {
  const [store, setStore] = useState<FinancialStoreData>(loadInitialStore);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Sync store to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Ignore quota errors
    }
  }, [store]);

  // Sync Dark / Light theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (store.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [store.settings.theme]);

  const handleToggleTheme = () => {
    setStore((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: prev.settings.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    setStore((prev) => {
      if (existingId) {
        return {
          ...prev,
          transactions: prev.transactions.map((t) =>
            t.id === existingId ? { ...t, ...txData } : t
          ),
        };
      }
      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}`,
        createdAt: Date.now(),
      };
      return {
        ...prev,
        transactions: [newTx, ...prev.transactions],
      };
    });
    setEditingTx(null);
  };

  const handleSaveBatchTransactions = (
    batch: Omit<Transaction, 'id' | 'createdAt'>[]
  ) => {
    const now = Date.now();
    const created: Transaction[] = batch.map((item, idx) => ({
      ...item,
      id: `tx_scan_${now}_${idx}`,
      createdAt: now + idx,
    }));
    setStore((prev) => ({
      ...prev,
      transactions: [...created, ...prev.transactions],
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    setStore((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  };

  const handleUpdateCategory = (updated: Category) => {
    setStore((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === updated.id ? updated : c)),
    }));
  };

  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const created: Category = {
      ...newCat,
      id: `cat_custom_${Date.now()}`,
    };
    setStore((prev) => ({
      ...prev,
      categories: [...prev.categories, created],
    }));
  };

  const handleDeleteCategory = (id: string) => {
    setStore((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }));
  };

  const handleUpdateCushion = (nextCushion: CushionState) => {
    setStore((prev) => ({
      ...prev,
      cushion: nextCushion,
    }));
  };

  const handleAddGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setStore((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  const handleUpdateGoalAmount = (goalId: string, deltaAmount: number) => {
    setStore((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: Math.max(0, g.currentAmount + deltaAmount) }
          : g
      ),
    }));
  };

  const handleDeleteGoal = (goalId: string) => {
    setStore((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== goalId),
    }));
  };

  const handleUpdateSettings = (nextSettings: AppSettings) => {
    setStore((prev) => ({
      ...prev,
      settings: nextSettings,
    }));
  };

  const navItems: { id: ActiveTab; label: string; shortLabel: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Обзор', shortLabel: 'Обзор', icon: LayoutDashboard },
    { id: 'transactions', label: 'Операции', shortLabel: 'Операции', icon: ListOrdered },
    { id: 'cushion', label: 'Подушка и цели', shortLabel: 'Копилки', icon: ShieldCheck },
    { id: 'advisor', label: 'ИИ-аналитик', shortLabel: 'Аналитик', icon: Sparkles },
    { id: 'settings', label: 'Настройки', shortLabel: 'Настройки', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (5 Single-Line Nav Links) — Zone 3 (Theme + Primary Action) */}
      <header className="sticky top-0 z-30 h-14 border-b border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            ФинПульс
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav
            aria-label="Основная навигация"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    isActive
                      ? 'border-emerald-600 text-slate-900 dark:text-slate-100 font-semibold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Theme switch + 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={
                store.settings.theme === 'dark'
                  ? 'Включить светлую тему'
                  : 'Включить тёмную тему'
              }
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {store.settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Операция</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={store.transactions}
            categories={store.categories}
            cushion={store.cushion}
            goals={store.goals}
            currency={store.settings.currency}
            onOpenAddModal={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            onOpenScannerModal={() => setIsScannerOpen(true)}
            onOpenCategoryManager={() => setIsCatManagerOpen(true)}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={store.transactions}
            categories={store.categories}
            currency={store.settings.currency}
            onOpenAddModal={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            onOpenScannerModal={() => setIsScannerOpen(true)}
            onEditTransaction={(tx) => {
              setEditingTx(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenCategoryManager={() => setIsCatManagerOpen(true)}
          />
        )}

        {activeTab === 'cushion' && (
          <CushionAndGoalsView
            cushion={store.cushion}
            goals={store.goals}
            transactions={store.transactions}
            categories={store.categories}
            currency={store.settings.currency}
            onUpdateCushion={handleUpdateCushion}
            onAddGoal={handleAddGoal}
            onUpdateGoalAmount={handleUpdateGoalAmount}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {activeTab === 'advisor' && (
          <AIAdvisorView
            transactions={store.transactions}
            categories={store.categories}
            cushion={store.cushion}
            goals={store.goals}
            currency={store.settings.currency}
            settings={store.settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            store={store}
            onUpdateSettings={handleUpdateSettings}
            onRestoreBackup={(backup) => setStore(backup)}
            onResetToEmpty={() => setStore(createEmptyStoreData(store.settings))}
            onRestoreDemoData={() =>
              setStore({
                ...createDemoStoreData(),
                settings: store.settings,
              })
            }
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Мобильное меню"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center px-1"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        categories={store.categories}
        currency={store.settings.currency}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
      />

      <CategoryManagerModal
        isOpen={isCatManagerOpen}
        onClose={() => setIsCatManagerOpen(false)}
        categories={store.categories}
        currency={store.settings.currency}
        onUpdateCategory={handleUpdateCategory}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        categories={store.categories}
        currency={store.settings.currency}
        onSaveBatch={handleSaveBatchTransactions}
      />

      <OfflineIndicator />
    </div>
  );
}
