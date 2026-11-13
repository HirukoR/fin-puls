import React, { useRef, useState } from 'react';
import {
  Check,
  Download,
  FileJson,
  FileSpreadsheet,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  AppSettings,
  CurrencyCode,
  FinancialStoreData,
} from '../types/finance';
import { CURRENCY_MAP } from '../data/demoData';
import { transactionsToCSV, validateBackupJSON } from '../utils/financeMath';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsViewProps {
  store: FinancialStoreData;
  onUpdateSettings: (next: AppSettings) => void;
  onRestoreBackup: (data: FinancialStoreData) => void;
  onResetToEmpty: () => void;
  onRestoreDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  store,
  onUpdateSettings,
  onRestoreBackup,
  onResetToEmpty,
  onRestoreDemoData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(store, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `finpulse-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'Резервная копия JSON успешно сохранена на устройство');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result || ''));
        const validated = validateBackupJSON(parsed);
        if (!validated) {
          showToast(
            'error',
            'Файл не соответствует структуре резервной копии ФинПульс'
          );
          return;
        }
        onRestoreBackup(validated);
        showToast('success', 'Данные успешно восстановлены из JSON-архива');
      } catch {
        showToast('error', 'Ошибка чтения JSON-файла. Проверьте целостность бэкапа');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCSV = () => {
    const csv = transactionsToCSV(store.transactions, store.categories);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `finpulse-transactions-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'Таблица транзакций экспортирована в CSV (совместимо с Excel)');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Локальное хранилище браузера (Zero-Backend), резервное копирование и параметры интерфейса
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Настройки и управление данными
        </h1>
      </div>

      {statusMessage && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-xs font-medium flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
              : 'border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
          }`}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1. Backup & Restore (Mandatory JSON + CSV) */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Резервное копирование и перенос данных (JSON / CSV)
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Все ваши операции ({store.transactions.length}), цели ({store.goals.length}) и параметры подушки хранятся локально в браузере (`LocalStorage`). Сохраните JSON-файл, чтобы перенести данные между смартфоном и компьютером.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            <FileJson className="w-4 h-4 shrink-0" />
            <span>Экспортировать бэкап в JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Восстановить из JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportJSON}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Экспорт транзакций в CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Interface Settings: Currency & Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Основная валюта учёта
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Выберите символ валюты для отображения во всех таблицах и графиках
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(CURRENCY_MAP) as CurrencyCode[]).map((code) => {
              const item = CURRENCY_MAP[code];
              const isSelected = store.settings.currency === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ ...store.settings, currency: code })
                  }
                  className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="font-mono font-bold">{item.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Тема оформления и PWA
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Переключайте светлую или тёмную тему и установите приложение на смартфон
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...store.settings, theme: 'light' })
                }
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-colors cursor-pointer ${
                  store.settings.theme === 'light'
                    ? 'border-emerald-600 bg-emerald-50/60 text-slate-900'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Светлая тема</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...store.settings, theme: 'dark' })
                }
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-semibold transition-colors cursor-pointer ${
                  store.settings.theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-950/40 text-slate-100'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Тёмная тема</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <PWAInstallButton />
          </div>
        </div>
      </div>

      {/* 3. Demo Mode & Clean Slate Reset */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Демо-режим и очистка данных
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Вы можете одной кнопкой очистить демонстрационные операции и начать вести личный учёт с чистого листа, либо заново загрузить демо-пример.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                onRestoreDemoData();
                setConfirmClear(false);
                showToast('success', 'Демонстрационные данные успешно загружены');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Загрузить демо-данные</span>
            </button>

            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Начать с чистого листа</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetToEmpty();
                    setConfirmClear(false);
                    showToast('success', 'Все демо-записи удалены. Приложение готово к личному учёту!');
                  }}
                  className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer"
                >
                  Подтвердить очистку
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Built-in 3-Minute Static Hosting Deployment Guide */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Шпаргалка: деплой на бесплатный статический хостинг за 3 минуты
          </h2>
          <Download className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              Шаг 1. Локальный запуск
            </p>
            <p className="mt-1.5 leading-relaxed">
              Склонируйте проект, выполните <code className="font-mono text-emerald-600 dark:text-emerald-400">npm install</code> и <code className="font-mono text-emerald-600 dark:text-emerald-400">npm run build</code>. Итоговая статика появится в папке <code className="font-mono">dist/</code>.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              Шаг 2. Публикация в GitHub
            </p>
            <p className="mt-1.5 leading-relaxed">
              Создайте приватный или публичный репозиторий на GitHub и отправьте код командами <code className="font-mono">git init</code>, <code className="font-mono">git commit</code> и <code className="font-mono">git push</code>.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              Шаг 3. Vercel / Netlify / Cloudflare
            </p>
            <p className="mt-1.5 leading-relaxed">
              Подключите репозиторий в Vercel или Netlify (Framework Preset: <code className="font-mono">Vite</code>, Build Command: <code className="font-mono">vite build</code>, Output: <code className="font-mono">dist</code>) и нажмите Deploy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
