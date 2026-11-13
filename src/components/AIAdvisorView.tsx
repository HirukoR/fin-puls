import React, { useState } from 'react';
import {
  CheckCircle2,
  Flame,
  Lightbulb,
  RefreshCw,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import {
  AIAnalysisResult,
  AppSettings,
  Category,
  CurrencyCode,
  CushionState,
  OfflineTip,
  SavingsGoal,
  Transaction,
} from '../types/finance';
import { OFFLINE_FINANCIAL_TIPS } from '../data/demoData';
import { formatMoney } from '../utils/financeMath';
import { generateLocalFinancialAnalysis, runFinancialAnalysis } from '../utils/aiAdvisor';

interface AIAdvisorViewProps {
  transactions: Transaction[];
  categories: Category[];
  cushion: CushionState;
  goals: SavingsGoal[];
  currency: CurrencyCode;
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({
  transactions,
  categories,
  cushion,
  goals,
  currency,
  settings,
  onUpdateSettings,
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult>(() =>
    generateLocalFinancialAnalysis(transactions, categories, cushion, goals, currency)
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTipCategory, setSelectedTipCategory] = useState<string>('Все советы');

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await runFinancialAnalysis(
        transactions,
        categories,
        cushion,
        goals,
        currency
      );
      setAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const tipCategories = [
    'Все советы',
    'Челлендж недели',
    'Еда и супермаркеты',
    'Маркетплейсы и шопинг',
    'Подписки и связь',
    'Транспорт и город',
    'Привычки и накопления',
  ];

  const filteredTips: OfflineTip[] =
    selectedTipCategory === 'Все советы'
      ? OFFLINE_FINANCIAL_TIPS
      : OFFLINE_FINANCIAL_TIPS.filter((t) => t.category === selectedTipCategory);

  const toggleCompletedChallenge = (tipId: string) => {
    const exists = settings.completedChallengeIds.includes(tipId);
    const nextCompleted = exists
      ? settings.completedChallengeIds.filter((id) => id !== tipId)
      : [...settings.completedChallengeIds, tipId];
    onUpdateSettings({
      ...settings,
      completedChallengeIds: nextCompleted,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Персональный аудит расходов, поиск утечек бюджета и база из {OFFLINE_FINANCIAL_TIPS.length} практик
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            ИИ-финансовый аналитик
          </h1>
        </div>

        <button
          type="button"
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>
            {isAnalyzing
              ? 'Анализируем структуру расходов...'
              : 'Проанализировать мои траты за месяц'}
          </span>
        </button>
      </div>

      {/* Main Analysis Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 1. Three Key Observations */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                01. Главные наблюдения: куда утекают деньги
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                Обновлено в {analysis.generatedAt}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Выводы на основе ваших фактических транзакций, лимитов и нормы сбережений за текущий месяц
            </p>

            <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800/80">
              {analysis.observations.map((obs, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {idx + 1}. {obs.title}
                    </h3>
                    <span className="text-xs font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {obs.impact}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {obs.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Приватность: расчёт выполняется по обезличенным сводкам категорий</span>
            <span className="font-mono">
              {analysis.source === 'ai' ? 'Gemini AI' : 'Локальный аналитик'}
            </span>
          </div>
        </div>

        {/* 2. Concrete 10-15% Reduction Plan + 3. Weekly Challenge */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  02. План сокращения расходов на 10–15%
                </h2>
              </div>
              <span className="text-xs font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                Выгода +{formatMoney(analysis.totalPotentialMonthlySavings, currency)} / мес
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
              {analysis.reductionPlan.map((step, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {step.category}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      экономия ~{formatMoney(step.potentialSavings, currency)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {step.action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Personal Weekly Challenge */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 shrink-0" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  03. Персональный челлендж на 7 дней
                </h2>
              </div>
              <span className="text-xs font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                Бонус в копилку: {analysis.weeklyChallenge.estimatedReward}
              </span>
            </div>

            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
              {analysis.weeklyChallenge.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {analysis.weeklyChallenge.description}
            </p>
          </div>
        </div>
      </div>

      {/* Built-in Database of 20+ Practical Savings Tips & Challenges */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                База знаний: {OFFLINE_FINANCIAL_TIPS.length} практических правил и челленджей
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Работает полностью автономно без интернета. Отмечайте внедрённые финансовые привычки
              </p>
            </div>
          </div>

          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            Выполнено практик: {settings.completedChallengeIds.length} из {OFFLINE_FINANCIAL_TIPS.length}
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-900 p-1.5">
          {tipCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedTipCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedTipCategory === cat
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTips.map((tip) => {
            const isCompleted = settings.completedChallengeIds.includes(tip.id);
            return (
              <div
                key={tip.id}
                className={`rounded-2xl border bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-3 transition-colors ${
                  isCompleted
                    ? 'border-emerald-500/50'
                    : 'border-slate-200/90 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {tip.category} {tip.isChallenge ? '· Челлендж' : ''}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                      {tip.estimatedSavingsPercent}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                    {tip.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {tip.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isCompleted ? 'Внедрено в бюджет' : 'Доступно для применения'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompletedChallenge(tip.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                      isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'Выполнено' : 'Отметить выполненным'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
