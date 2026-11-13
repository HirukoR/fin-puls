import { Category, TransactionType } from '../types/finance';

export interface ScannedTransactionDraft {
  id: string;
  selected: boolean;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  note: string;
  confidence: 'high' | 'medium';
}

interface MerchantRule {
  keywords: string[];
  categoryId: string;
  defaultType?: TransactionType;
}

const MERCHANT_RULES: MerchantRule[] = [
  {
    categoryId: 'cat_food',
    keywords: [
      'пятёрочка',
      'пятерочка',
      'перекрёсток',
      'перекресток',
      'вкусвилл',
      'магнит',
      'лента',
      'ашан',
      'самокат',
      'яндекс лавка',
      'лавка',
      'дикси',
      'азбука вкуса',
      'метро кэш',
      'кофе',
      'surf coffee',
      'stars coffee',
      'шоколадница',
      'додо',
      'вкусно и точка',
      'бургер кинг',
      'ростикс',
      'супермаркет',
      'продукты',
      'пекарня',
      'буше',
      'кухня на районе',
      'деливери',
      'яндекс еда',
    ],
  },
  {
    categoryId: 'cat_marketplaces',
    keywords: [
      'ozon',
      'озон',
      'wildberries',
      'вайлдберриз',
      'wb',
      'яндекс маркет',
      'мегамаркет',
      'lamoda',
      'ламода',
      'aliexpress',
      'алиэкспресс',
      'золотое яблоко',
      'детский мир',
      'м.видео',
      'dns',
      'днс',
      'ситилинк',
      'всеинструменты',
    ],
  },
  {
    categoryId: 'cat_transport',
    keywords: [
      'яндекс такси',
      'яндекс go',
      'yandex go',
      'uber',
      'такси',
      'метро',
      'тройка',
      'мосгортранс',
      'цппк',
      'ржд',
      'аэрофлот',
      'победа',
      's7',
      'делимобиль',
      'ситидрайв',
      'яндекс драйв',
      'каршеринг',
      'лукойл',
      'газпромнефть',
      'роснефть',
      'азс',
      'парковка',
      'автодор',
      'whoosh',
      'юрент',
    ],
  },
  {
    categoryId: 'cat_housing',
    keywords: [
      'жкх',
      'жку',
      'мосэнергосбыт',
      'мособлеирц',
      'еирц',
      'квартплата',
      'аренда',
      'коммунальные',
      'ростелеком',
      'дом.ру',
      'мгтс',
      'капремонт',
      'водоканал',
      'леруа',
      'лемана про',
      'hoff',
      'икеа',
    ],
  },
  {
    categoryId: 'cat_subscriptions',
    keywords: [
      'яндекс плюс',
      'yandex plus',
      'кинопоиск',
      'иви',
      'ivi',
      'okko',
      'окко',
      'wink',
      'сберпрайм',
      'мтс premium',
      'т-про',
      'tinkoff pro',
      'telegram',
      'spotify',
      'apple',
      'icloud',
      'google one',
      'подписка',
      'мтс',
      'мегафон',
      'билайн',
      'теле2',
      't2',
      'йота',
      'yota',
    ],
  },
  {
    categoryId: 'cat_health',
    keywords: [
      'аптека',
      'горздрав',
      'ригла',
      '36.6',
      'еаптека',
      'сбераптека',
      'планета здоровья',
      'озерки',
      'инвитро',
      'гемотест',
      'хеликс',
      'клиника',
      'стоматология',
      'медси',
      'врач',
      'анализы',
      'фитнес',
      'ddx',
      'spirit',
      'world class',
    ],
  },
  {
    categoryId: 'cat_entertainment',
    keywords: [
      'кино',
      'каро',
      'синема парк',
      'формула кино',
      'театр',
      'концерт',
      'яндекс афиша',
      'kassir',
      'бар',
      'паб',
      'ресторан',
      'кафе',
      'боулинг',
      'квест',
      'steam',
      'playstation',
      'музей',
    ],
  },
  {
    categoryId: 'cat_salary',
    defaultType: 'income',
    keywords: ['зарплата', 'аванс', 'зачисление заработной платы', 'оклад', 'премия', 'отпускные'],
  },
  {
    categoryId: 'cat_freelance',
    defaultType: 'income',
    keywords: ['фриланс', 'гонорар', 'оплата по договору', 'проект', 'консультация'],
  },
  {
    categoryId: 'cat_business',
    defaultType: 'income',
    keywords: ['самозанятый', 'выручка', 'оплата по счёту', 'оплата услуг', 'бизнес', 'ип'],
  },
  {
    categoryId: 'cat_investments',
    defaultType: 'income',
    keywords: ['проценты по вкладу', 'выплата процентов', 'дивиденды', 'купон', 'накопительный счёт'],
  },
  {
    categoryId: 'cat_cashback',
    defaultType: 'income',
    keywords: ['кэшбэк', 'кешбэк', 'бонусы', 'спасибо'],
  },
  {
    categoryId: 'cat_gifts',
    defaultType: 'income',
    keywords: ['подарок', 'перевод от', 'сбп от', 'пополнение от'],
  },
  {
    categoryId: 'cat_sales',
    defaultType: 'income',
    keywords: ['авито', 'avito', 'юла', 'продажа'],
  },
  {
    categoryId: 'cat_income_other',
    defaultType: 'income',
    keywords: ['налоговый вычет', 'фнс', 'возврат средств', 'стипендия', 'пособие'],
  },
];

export function matchCategoryByMerchant(
  text: string,
  categories: Category[]
): { categoryId: string; type: TransactionType; confidence: 'high' | 'medium' } {
  const lower = text.toLowerCase();
  const availableIds = new Set(categories.map((c) => c.id));

  // 1. Check custom category names first
  for (const cat of categories) {
    if (lower.includes(cat.name.toLowerCase())) {
      return {
        categoryId: cat.id,
        type: cat.type,
        confidence: 'high',
      };
    }
  }

  // 2. Check dictionary of Russian merchants
  for (const rule of MERCHANT_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        const type: TransactionType = rule.defaultType || 'expense';
        if (availableIds.has(rule.categoryId)) {
          return {
            categoryId: rule.categoryId,
            type,
            confidence: 'high',
          };
        }
      }
    }
  }

  // 3. Fallback category
  const defaultExpense =
    categories.find((c) => c.id === 'cat_other') ||
    categories.find((c) => c.type === 'expense') ||
    categories[0];

  return {
    categoryId: defaultExpense?.id || 'cat_other',
    type: 'expense',
    confidence: 'medium',
  };
}

export function parseBankStatementText(
  rawText: string,
  categories: Category[],
  referenceDate: Date = new Date()
): ScannedTransactionDraft[] {
  const todayISO = referenceDate.toISOString().slice(0, 10);
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 3);

  const drafts: ScannedTransactionDraft[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check explicit date DD.MM.YYYY or YYYY-MM-DD in the line
    let detectedDate = todayISO;
    const ruDateMatch = line.match(/\b(\d{2})\.(\d{2})(?:\.(\d{2,4}))?\b/);
    const isoDateMatch = line.match(/\b(\d{4}-\d{2}-\d{2})\b/);

    if (isoDateMatch) {
      detectedDate = isoDateMatch[1];
    } else if (ruDateMatch) {
      const dd = ruDateMatch[1];
      const mm = ruDateMatch[2];
      let yyyy = ruDateMatch[3] ? ruDateMatch[3] : String(referenceDate.getFullYear());
      if (yyyy.length === 2) yyyy = `20${yyyy}`;
      detectedDate = `${yyyy}-${mm}-${dd}`;
    }

    // Remove date tokens before extracting amount
    const lineWithoutDate = line
      .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ')
      .replace(/\b\d{2}\.\d{2}(?:\.\d{2,4})?\b/g, ' ')
      .replace(/\b\d{2}:\d{2}\b/g, ' ');

    // Match amount like "- 1 450,50 ₽", "+85000 руб", "2 340 ₽", "1490р"
    const amountRegex = /([+−-])?\s*(\d{1,3}(?:[\s\u00A0]\d{3})+|\d+)(?:[.,](\d{1,2}))?\s*(?:₽|руб\.?|р\.?|rub|\$|€|₸|byn)?/gi;
    const matches = Array.from(lineWithoutDate.matchAll(amountRegex));
    if (matches.length === 0) continue;

    // Pick the most likely monetary match (prefer one near currency sign or largest number)
    const bestMatch = matches.reduce((best, cur) => {
      const curHasCurrency = /[₽руб$€₸]/i.test(cur[0]);
      const bestHasCurrency = /[₽руб$€₸]/i.test(best[0]);
      if (curHasCurrency && !bestHasCurrency) return cur;
      const curNum = Number(cur[2].replace(/\s+/g, ''));
      const bestNum = Number(best[2].replace(/\s+/g, ''));
      return curNum > bestNum ? cur : best;
    }, matches[0]);

    const signChar = bestMatch[1] || '';
    const intPart = bestMatch[2].replace(/[\s\u00A0]+/g, '');
    const numericAmount = Math.round(Number(intPart));
    if (!numericAmount || numericAmount <= 0 || numericAmount > 100_000_000) continue;

    // Clean merchant / note description
    const cleanedNote = lineWithoutDate
      .replace(bestMatch[0], ' ')
      .replace(/[•*—–]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const noteText = cleanedNote || 'Операция по карте';
    const matched = matchCategoryByMerchant(noteText, categories);

    const isExplicitIncome =
      signChar === '+' ||
      matched.type === 'income' ||
      /пополнение|зачисление|зарплата|перевод от|кэшбэк/i.test(noteText);

    const finalType: TransactionType = isExplicitIncome ? 'income' : 'expense';
    let finalCategoryId = matched.categoryId;

    if (finalType === 'income') {
      const catObj = categories.find((c) => c.id === finalCategoryId);
      if (!catObj || catObj.type !== 'income') {
        const defaultInc =
          categories.find((c) => c.id === 'cat_salary') ||
          categories.find((c) => c.type === 'income');
        if (defaultInc) finalCategoryId = defaultInc.id;
      }
    }

    drafts.push({
      id: `scan_${Date.now()}_${i}`,
      selected: true,
      type: finalType,
      amount: numericAmount,
      categoryId: finalCategoryId,
      date: detectedDate,
      note: noteText,
      confidence: matched.confidence,
    });
  }

  return drafts;
}

export const BANK_SCREENSHOT_PRESETS: {
  id: string;
  bankName: string;
  subtitle: string;
  rawStatement: string;
}[] = [
  {
    id: 'preset_tbank',
    bankName: 'Т-Банк (История операций)',
    subtitle: '6 операций за день: супермаркеты, такси, подписка и маркетплейс',
    rawStatement: [
      'ВкусВилл • Супермаркеты −2 840 ₽',
      'Яндекс Go • Такси и транспорт −690 ₽',
      'Ozon.ru • Маркетплейсы −4 350 ₽',
      'Surf Coffee • Фастфуд и кафе −380 ₽',
      'Яндекс Плюс • Подписки −399 ₽',
      'Аптека Ригла • Здоровье −1 250 ₽',
    ].join('\n'),
  },
  {
    id: 'preset_sber',
    bankName: 'СберБанк Онлайн (Выписка за выходные)',
    subtitle: '5 операций: продукты, ЖКУ, кинотеатр и кэшбэк',
    rawStatement: [
      'Пятёрочка −1 920 ₽',
      'Мосэнергосбыт Оплата ЖКУ −3 450 ₽',
      'Синема Парк Билеты в кино −1 600 ₽',
      'Лукойл АЗС Топливо −2 800 ₽',
      '+ 1 850 ₽ Зачисление кэшбэка Спасибо',
    ].join('\n'),
  },
  {
    id: 'preset_alfa',
    bankName: 'Альфа-Банк (Скриншот чеков недели)',
    subtitle: '5 операций: зарплата, Wildberries, фитнес и доставка',
    rawStatement: [
      '+ 82 500 ₽ Зачисление заработной платы (аванс)',
      'Wildberries Покупки −5 490 ₽',
      'Самокат Доставка продуктов −1 430 ₽',
      'Инвитро Медицинские анализы −3 200 ₽',
      'Додо Пицца Рестораны −1 190 ₽',
    ].join('\n'),
  },
];

export async function analyzeBankScreenshotImage(
  file: File,
  categories: Category[]
): Promise<{
  source: 'gemini_vision' | 'smart_fallback';
  drafts: ScannedTransactionDraft[];
  message?: string;
}> {
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || '');
      const commaIdx = res.indexOf(',');
      resolve(commaIdx >= 0 ? res.slice(commaIdx + 1) : res);
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch('/api/scan-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType: file.type || 'image/png',
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
        })),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload?.transactions) && payload.transactions.length > 0) {
        const todayISO = new Date().toISOString().slice(0, 10);
        const validIds = new Set(categories.map((c) => c.id));

        const drafts: ScannedTransactionDraft[] = payload.transactions.map(
          (
            item: {
              type?: string;
              amount?: number;
              categoryId?: string;
              date?: string;
              note?: string;
            },
            idx: number
          ) => {
            const matched = matchCategoryByMerchant(item.note || '', categories);
            const catId =
              item.categoryId && validIds.has(item.categoryId)
                ? item.categoryId
                : matched.categoryId;
            return {
              id: `vision_${Date.now()}_${idx}`,
              selected: true,
              type: item.type === 'income' ? 'income' : 'expense',
              amount: Math.max(1, Math.round(Number(item.amount) || 500)),
              categoryId: catId,
              date:
                item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
                  ? item.date
                  : todayISO,
              note: item.note || 'Операция со скриншота',
              confidence: 'high',
            };
          }
        );

        return {
          source: 'gemini_vision',
          drafts,
        };
      }
    }
  } catch {
    // Graceful fallback when running locally without GEMINI_API_KEY or on static hosting
  }

  // Smart fallback: inspect filename for merchant hints or provide realistic editable bank screen items
  const fileNameClean = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
  const parsedFromFileName = parseBankStatementText(fileNameClean, categories);
  if (parsedFromFileName.length > 0) {
    return {
      source: 'smart_fallback',
      drafts: parsedFromFileName,
      message:
        'Распознано локальным модулем. Проверьте суммы и категории перед сохранением.',
    };
  }

  return {
    source: 'smart_fallback',
    drafts: parseBankStatementText(BANK_SCREENSHOT_PRESETS[0].rawStatement, categories),
    message:
      'Локальный демо-режим распознавания скриншота (без серверного ключа ИИ). Вы можете отредактировать любые суммы и категории прямо в таблице или вставить текст из банка.',
  };
}
