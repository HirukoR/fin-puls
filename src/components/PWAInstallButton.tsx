import React, { useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center justify-between gap-4 py-2 text-sm text-slate-600 dark:text-slate-400">
        <span>Статус приложения PWA</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          Установлено на устройство
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Установка приложения на смартфон или рабочий стол (PWA)
          </h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Добавьте «ФинПульс» на главный экран телефона для мгновенного запуска без адресной строки и работы без интернета.
          </p>
        </div>

        {isInstallable ? (
          <button
            type="button"
            onClick={install}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Установить приложение</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isIOS ? 'Как установить на iPhone' : 'Инструкция по установке PWA'}</span>
          </button>
        )}
      </div>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <h3
                id="pwa-guide-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                Установка на главный экран (PWA)
              </h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Закрыть инструкцию"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  На iPhone / iPad (Safari):
                </p>
                <p className="mt-1 text-xs leading-relaxed">
                  1. Нажмите кнопку «Поделиться» в нижней панели браузера Safari.
                  <br />
                  2. Прокрутите список вниз и выберите «На экран «Домой»».
                </p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  На Android (Chrome) и ПК:
                </p>
                <p className="mt-1 text-xs leading-relaxed">
                  1. Откройте меню браузера (три точки в правом верхнем углу).
                  <br />
                  2. Нажмите «Установить приложение» или «Добавить на главный экран».
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-6 w-full rounded-lg bg-slate-900 dark:bg-slate-100 py-2.5 text-xs font-semibold text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/90 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-lg">
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Автономный режим — все данные сохраняются локально</span>
    </div>
  );
};
