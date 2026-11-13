export type TransactionType = 'expense' | 'income';

export type CurrencyCode = 'RUB' | 'USD' | 'EUR' | 'KZT' | 'BYN';

export type PeriodFilter = 'current_month' | 'last_month' | 'all_time';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  monthlyLimit: number; // 0 means no limit set
  isMandatory: boolean; // used for automatic safety cushion calculation
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  note: string;
  createdAt: number;
}

export interface CushionContribution {
  id: string;
  amount: number; // positive for deposit, negative for withdrawal
  date: string; // YYYY-MM-DD
  note: string;
}

export interface CushionState {
  currentBalance: number;
  targetMonths: 3 | 6 | 12;
  calculationMode: 'auto_mandatory' | 'manual';
  manualMonthlyExpense: number;
  monthlyPlannedContribution: number;
  history: CushionContribution[];
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  categoryTag: string;
  createdAt: string;
}

export interface AppSettings {
  currency: CurrencyCode;
  theme: 'light' | 'dark';
  activeChallengeId?: string;
  completedChallengeIds: string[];
}

export interface FinancialStoreData {
  version: number;
  transactions: Transaction[];
  categories: Category[];
  cushion: CushionState;
  goals: SavingsGoal[];
  settings: AppSettings;
}

export interface AIAnalysisObservation {
  title: string;
  detail: string;
  impact: string;
}

export interface AIReductionStep {
  category: string;
  action: string;
  potentialSavings: number;
}

export interface AIWeeklyChallenge {
  title: string;
  description: string;
  estimatedReward: string;
}

export interface AIAnalysisResult {
  generatedAt: string;
  source: 'ai' | 'local_engine';
  observations: AIAnalysisObservation[];
  reductionPlan: AIReductionStep[];
  weeklyChallenge: AIWeeklyChallenge;
  totalPotentialMonthlySavings: number;
}

export interface OfflineTip {
  id: string;
  category: 'Еда и супермаркеты' | 'Подписки и связь' | 'Маркетплейсы и шопинг' | 'Транспорт и город' | 'Привычки и накопления' | 'Челлендж недели';
  title: string;
  description: string;
  estimatedSavingsPercent: string;
  isChallenge?: boolean;
}
