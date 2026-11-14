import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  FileText,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Category, CurrencyCode, Transaction, TransactionType } from '../types/finance';
import { CURRENCY_MAP } from '../data/demoData';
import { formatMoney } from '../utils/financeMath';
import {
  analyzeBankScreenshotImage,
  BANK_SCREENSHOT_PRESETS,
  parseBankStatementText,
  ScannedTransactionDraft,
} from '../utils/receiptScanner';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  currency: CurrencyCode;
  onSaveBatch: (transactions: Omit<Transaction, 'id' | 'createdAt'>[]) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  categories,
  currency,
  onSaveBatch,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<'image' | 'text'>('image');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusText, setScanStatusText] = useState(
    'Анализируем скриншот и распределяем по категориям...'
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedIsPdf, setUploadedIsPdf] = useState(false);
  const [rawText, setRawText] = useState('');
  const [drafts, setDrafts] = useState<ScannedTransactionDraft[]>([]);
  const [infoBanner, setInfoBanner] = useState<string | null>(null);

  const currencySymbol = CURRENCY_MAP[currency]?.symbol || '₽';

  useEffect(() => {
    if (!isOpen) return;
    // Handle Ctrl+V paste of screenshots or PDF files directly into the modal
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (
          item.type.startsWith('image/') ||
          item.type === 'application/pdf'
        ) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            await processImageFile(file);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  });

  if (!isOpen) return null;

  const processImageFile = async (file: File) => {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setUploadedFileName(file.name);
    setUploadedIsPdf(isPdf);

    if (!isPdf) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }

    setIsScanning(true);
    setScanStatusText(
      isPdf
        ? 'Чтение PDF-выписки и извлечение таблицы операций...'
        : 'Подготовка скриншота и запуск распознавания...'
    );
    setInfoBanner(null);

    try {
      const result = await analyzeBankScreenshotImage(file, categories, (status) => {
        setScanStatusText(status);
      });
      setDrafts(result.drafts);
      if (result.previewDataUrl) {
        setPreviewUrl(result.previewDataUrl);
      }
      if (result.recognizedText) {
        setRawText(result.recognizedText);
      }
      if (result.message) {
        setInfoBanner(result.message);
      } else if (result.source === 'gemini_vision') {
        setInfoBanner(
          `ИИ-сканер успешно распознал операций: ${result.drafts.length}. Проверьте категории перед сохранением.`
        );
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
    e.target.value = '';
  };

  const handleParseRawText = (textToParse: string) => {
    const parsed = parseBankStatementText(textToParse, categories);
    setDrafts(parsed);
    setInfoBanner(
      parsed.length > 0
        ? `Автоматически распознано операций: ${parsed.length}. Категории распределены по названиям магазинов.`
        : 'Не удалось найти суммы в тексте. Укажите строчки в формате: «Пятёрочка -1450 ₽»'
    );
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = BANK_SCREENSHOT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setRawText(preset.rawStatement);
    const parsed = parseBankStatementText(preset.rawStatement, categories);
    setDrafts(parsed);
    setInfoBanner(
      `Загружен пример «${preset.bankName}»: автоматически определены категории для ${parsed.length} операций.`
    );
  };

  const handleUpdateDraft = (
    id: string,
    patch: Partial<ScannedTransactionDraft>
  ) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const updated = { ...d, ...patch };
        // If transaction type changed, ensure category matches the type
        if (patch.type && patch.type !== d.type) {
          const matchingCat = categories.find((c) => c.type === patch.type);
          if (matchingCat) updated.categoryId = matchingCat.id;
        }
        return updated;
      })
    );
  };

  const handleAddBlankRow = () => {
    const defaultCat =
      categories.find((c) => c.type === 'expense') || categories[0];
    setDrafts((prev) => [
      ...prev,
      {
        id: `manual_scan_${Date.now()}`,
        selected: true,
        type: 'expense',
        amount: 1000,
        categoryId: defaultCat?.id || 'cat_food',
        date: new Date().toISOString().slice(0, 10),
        note: 'Покупка по карте',
        confidence: 'high',
      },
    ]);
  };

  const selectedDrafts = drafts.filter((d) => d.selected && d.amount > 0);
  const totalSelectedExpense = selectedDrafts
    .filter((d) => d.type === 'expense')
    .reduce((acc, d) => acc + d.amount, 0);
  const totalSelectedIncome = selectedDrafts
    .filter((d) => d.type === 'income')
    .reduce((acc, d) => acc + d.amount, 0);

  const handleConfirmSave = () => {
    if (selectedDrafts.length === 0) return;
    onSaveBatch(
      selectedDrafts.map((d) => ({
        type: d.type,
        amount: Math.round(d.amount),
        categoryId: d.categoryId,
        date: d.date,
        note: d.note.trim() || 'Операция со скриншота',
      }))
    );
    setDrafts([]);
    setPreviewUrl(null);
    setUploadedFileName(null);
    setUploadedIsPdf(false);
    setRawText('');
    setInfoBanner(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-modal-title"
    >
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2
                id="scanner-modal-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                Сканер скриншотов и PDF-выписок из банка
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Загрузите PDF-выписку или скриншот операций (или нажмите Ctrl+V) — приложение само определит магазины, категории, даты и суммы
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть сканер скриншотов"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mode selector + Quick Presets */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setMode('image')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  mode === 'image'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Скриншот / PDF-выписка</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  mode === 'text'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Текст / СМС из банка</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">
                Проверить на примере:
              </span>
              {BANK_SCREENSHOT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors cursor-pointer"
                >
                  {preset.bankName.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Input Zone: Image / PDF Upload OR Raw Text */}
          {mode === 'image' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) await processImageFile(file);
                }}
                className={`${
                  previewUrl || uploadedFileName ? 'md:col-span-7' : 'md:col-span-12'
                } rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/30 p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {isScanning ? (
                  <div className="py-4 flex flex-col items-center gap-2">
                    <RefreshCw className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-spin" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {scanStatusText}
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                      Нажмите для выбора PDF-выписки или скриншота из банка (или перетащите файл сюда)
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Поддерживаются PDF-выписки (.pdf) и скриншоты Т-Банка, Сбера, Альфа-Банка, ВТБ, Ozon и Рокетбанка
                    </p>
                  </>
                )}
              </div>

              {(previewUrl || uploadedFileName) && (
                <div className="md:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950/5 dark:bg-slate-950 p-3 flex flex-col items-center justify-center relative">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Превью загруженного файла"
                      referrerPolicy="no-referrer"
                      className="max-h-40 w-auto object-contain rounded-lg"
                    />
                  ) : (
                    <div className="py-6 flex flex-col items-center gap-2 text-slate-600 dark:text-slate-300">
                      <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-semibold truncate max-w-[220px]">
                        {uploadedFileName}
                      </span>
                    </div>
                  )}
                  <span className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                    {uploadedIsPdf
                      ? `PDF-выписка: ${uploadedFileName || 'документ.pdf'}`
                      : 'Превью загруженного скриншота'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label
                htmlFor="bank-raw-text"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Вставьте скопированные строчки из мобильного банка, пуш-уведомлений или выписки (по одной операции на строку):
              </label>
              <textarea
                id="bank-raw-text"
                rows={4}
                placeholder={`Пример:\nПятёрочка −1 450 ₽\nЯндекс Go Такси −680 ₽\nOzon.ru −3 290 ₽\n+ 45 000 ₽ Аванс зарплата`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-hidden"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleParseRawText(rawText)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Распознать и разложить по категориям</span>
                </button>
              </div>
            </div>
          )}

          {infoBanner && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/30 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between gap-3">
              <span>{infoBanner}</span>
              <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 shrink-0">
                Авто-категоризация
              </span>
            </div>
          )}

          {/* Recognized Transactions Preview Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Распознанные операции ({drafts.length})
              </h3>
              <button
                type="button"
                onClick={handleAddBlankRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить строку вручную</span>
              </button>
            </div>

            {drafts.length === 0 ? (
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 py-8 px-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Загрузите скриншот из приложения банка или нажмите на одну из кнопок «Проверить на примере» выше, чтобы увидеть автоматическое распределение расходов.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
                {drafts.map((item) => {
                  const availableCats = categories.filter((c) => c.type === item.type);
                  return (
                    <div
                      key={item.id}
                      className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      {/* Checkbox + Type */}
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          aria-label={`Выбрать операцию ${item.note}`}
                          checked={item.selected}
                          onChange={(e) =>
                            handleUpdateDraft(item.id, { selected: e.target.checked })
                          }
                          className="rounded border-slate-300 text-emerald-600"
                        />
                        <select
                          aria-label="Тип операции"
                          value={item.type}
                          onChange={(e) =>
                            handleUpdateDraft(item.id, {
                              type: e.target.value as TransactionType,
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100"
                        >
                          <option value="expense">Расход</option>
                          <option value="income">Доход</option>
                        </select>
                      </div>

                      {/* Note / Merchant */}
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          aria-label="Описание магазина или операции"
                          value={item.note}
                          onChange={(e) =>
                            handleUpdateDraft(item.id, { note: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      {/* Detected Category */}
                      <div className="sm:col-span-3">
                        <select
                          aria-label="Категория операции"
                          value={item.categoryId}
                          onChange={(e) =>
                            handleUpdateDraft(item.id, { categoryId: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100"
                        >
                          {availableCats.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date */}
                      <div className="sm:col-span-2">
                        <input
                          type="date"
                          aria-label="Дата операции"
                          value={item.date}
                          onChange={(e) =>
                            handleUpdateDraft(item.id, { date: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      {/* Amount + Delete */}
                      <div className="sm:col-span-2 flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          aria-label={`Сумма операции (${currencySymbol})`}
                          value={item.amount}
                          onChange={(e) =>
                            handleUpdateDraft(item.id, {
                              amount: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-right text-xs font-mono font-semibold text-slate-900 dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDrafts((prev) => prev.filter((d) => d.id !== item.id))
                          }
                          aria-label="Удалить строку"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
            <span>
              Выбрано: <strong className="text-slate-900 dark:text-slate-100">{selectedDrafts.length}</strong>
            </span>
            <span>·</span>
            <span>
              Расходы:{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                −{formatMoney(totalSelectedExpense, currency)}
              </strong>
            </span>
            {totalSelectedIncome > 0 && (
              <>
                <span>·</span>
                <span>
                  Доходы:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    +{formatMoney(totalSelectedIncome, currency)}
                  </strong>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              disabled={selectedDrafts.length === 0}
              onClick={handleConfirmSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Записать операции в учёт ({selectedDrafts.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
