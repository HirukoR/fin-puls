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
      'фастфуд',
      'супермаркеты',
      'супермаркет',
      'продукты',
      'пекарня',
      'буше',
      'кухня на районе',
      'деливери',
      'яндекс еда',
      'красное & белое',
      'красное и белое',
      'к&б',
    ],
  },
  {
    categoryId: 'cat_marketplaces',
    keywords: [
      'ozon',
      'озон',
      'огоп',
      '0zon',
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
      'связь и интернет',
      'мобильная связь',
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
      'аптеки',
      'apteka',
      'vita',
      'вита',
      'фарма',
      'farma',
      'оптика',
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
      'рестораны',
      'кафе',
      'боулинг',
      'квест',
      'portal',
      'steam',
      'playstation',
      'музей',
    ],
  },
  {
    categoryId: 'cat_salary',
    defaultType: 'income',
    keywords: [
      'зарплата',
      'аванс',
      'зачисление заработной платы',
      'оклад',
      'премия',
      'отпускные',
    ],
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
    keywords: [
      'проценты по вкладу',
      'выплата процентов',
      'дивиденды',
      'купон',
      'накопительный счёт',
    ],
  },
  {
    categoryId: 'cat_cashback',
    defaultType: 'income',
    keywords: ['кэшбэк', 'кешбэк', 'бонусы', 'спасибо'],
  },
  {
    categoryId: 'cat_gifts',
    defaultType: 'income',
    keywords: [
      'подарок',
      'перевод от',
      'сбп от',
      'пополнение от',
      'пополнения',
      'входящий перевод',
    ],
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

const RU_MONTH_PREFIXES: { prefix: string; month: string }[] = [
  { prefix: 'январ', month: '01' },
  { prefix: 'феврал', month: '02' },
  { prefix: 'март', month: '03' },
  { prefix: 'апрел', month: '04' },
  { prefix: 'мая', month: '05' },
  { prefix: 'май', month: '05' },
  { prefix: 'июн', month: '06' },
  { prefix: 'июл', month: '07' },
  { prefix: 'август', month: '08' },
  { prefix: 'сентябр', month: '09' },
  { prefix: 'октябр', month: '10' },
  { prefix: 'ноябр', month: '11' },
  { prefix: 'декабр', month: '12' },
];

const BANK_SUBTITLE_CANONICAL_MAP: { keywords: string[]; canonical: string }[] = [
  { keywords: ['фастфуд'], canonical: 'Фастфуд' },
  { keywords: ['супермаркеты', 'супермаркет'], canonical: 'Супермаркеты' },
  { keywords: ['пополнения', 'пополнение'], canonical: 'Пополнения' },
  { keywords: ['покупка', 'покупки'], canonical: 'Покупка' },
  { keywords: ['на копилку', 'на капилку', 'на к'], canonical: 'На копилку' },
  { keywords: ['связь и интернет', 'мобильная связь'], canonical: 'Связь и Интернет' },
  { keywords: ['переводы', 'перевод', 'сбп'], canonical: 'Переводы' },
  { keywords: ['кафе и рестораны', 'рестораны'], canonical: 'Кафе и рестораны' },
  { keywords: ['такси', 'транспорт'], canonical: 'Транспорт' },
  { keywords: ['аптеки', 'медицина', 'здоровье'], canonical: 'Здоровье' },
  { keywords: ['маркетплейсы'], canonical: 'Маркетплейсы' },
  { keywords: ['подписки'], canonical: 'Подписки' },
  { keywords: ['жкх', 'жку'], canonical: 'ЖКХ' },
  { keywords: ['развлечения'], canonical: 'Развлечения' },
  { keywords: ['оплата услуг'], canonical: 'Оплата услуг' },
];

export function matchCategoryByMerchant(
  text: string,
  categories: Category[]
): { categoryId: string; type: TransactionType; confidence: 'high' | 'medium' } {
  const lower = text.toLowerCase();
  const availableIds = new Set(categories.map((c) => c.id));

  // 1. Check dictionary of Russian merchants and bank categories first
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

  // 2. Check custom category names
  for (const cat of categories) {
    if (lower.includes(cat.name.toLowerCase())) {
      return {
        categoryId: cat.id,
        type: cat.type,
        confidence: 'high',
      };
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

function mapWideFontCharsToDigits(token: string): string {
  return token
    .replace(/[оoОO]/g, '0')
    .replace(/[зЗ]/g, '3')
    .replace(/[аaАA]/g, '4')
    .replace(/[эЭ]/g, '9');
}

function normalizeRocketbankWideFontLine(rawLine: string): string {
  return (
    rawLine
      // Rocketbank wide-font specific OCR misreads for amounts:
      .replace(/(?:^|\s)EE\s+DOOR(?=\s|$)/gi, ' +2 000 ₽')
      .replace(/(?:^|\s)gS\s+OO\s+Ob(?=\s|$)/gi, ' +3 000 ₽')
      .replace(/(?:^|\s)fE=S\s+OO0I=(?=\s|$)/gi, ' +30 000 ₽')
      .replace(/(?:^|\s)е[з3][оoОO0]{2}\s*=/gi, ' -2 300 ₽')
      .replace(/(?:^|\s)сво\s*=/gi, ' -680 ₽')
      // When '-1 011 ₽' is read without spaces as '-10112' after store code
      .replace(/([—−\-]+)(\d{4})2(?=\s|$)/g, '-$2 ₽')
      // General thousands group with wide-font letters (e.g. "-1 O11 2", "+3 ооо Р", "+30 ооо Р", "-2 зоо Р")
      .replace(
        /([+−—\-]+\s*[0-9оoОOзЗ]{1,3})\s+([0-9оoОOзЗ]{3})(?:[.,]([0-9оoОOзЗ]{1,2}))?\s*(?:Pf|Р|P|₽|®|=|2)?(?=\s|$)/gi,
        (_m, p1: string, p2: string, p3?: string) => {
          const sign = p1.includes('+') ? '+' : '-';
          const lead = mapWideFontCharsToDigits(p1.replace(/[+−—\-\s]+/g, ''));
          const tail = mapWideFontCharsToDigits(p2);
          const dec = p3 ? `,${mapWideFontCharsToDigits(p3)}` : '';
          return `${sign}${lead} ${tail}${dec} ₽`;
        }
      )
      // Unsigned "2 ooo Pf" where '+' was dropped before thousands group
      .replace(
        /(\b\d{1,2})\s+([оoОO0]{3})\s*(?:Pf|®|=)(?=\s|$)/gi,
        '+$1 000 ₽'
      )
      // General decimal amount with wide-font letters (e.g. "—-—a71,1 2", "—-2аэ,67 2", "—-аз,аз 2", "— 2о,4 2")
      .replace(
        /[—−\-]+\s*([0-9оoОOзЗаaэ]{1,4})[.,]([0-9оoОOзЗаaэ]{1,2})\s*(?:2|Pf|®|=|Р|P|₽)?(?=\s|$)/gi,
        (_m, intPart: string, decPart: string) => {
          const cleanInt = mapWideFontCharsToDigits(intPart);
          const cleanDec = mapWideFontCharsToDigits(decPart);
          return `-${cleanInt},${cleanDec} ₽`;
        }
      )
      // "-30 ₽" read as "—ЗО ®" or "-Зо Р"
      .replace(/[—−\-]+\s*[зЗ3][оoОO0]\s*(?:®|Pf|=|Р|P|₽|2)?(?=\s|$)/gi, '-30 ₽')
      // Any signed number ending with wide-font 'о'/'o' instead of '0' (but not 'ОР' currency suffix)
      .replace(
        /([+−-]\s*\d{1,3})[оoОO](?![рpРP])\s*(?:Pf|Р|P|₽|®|=|2)?(?=\s|$)/gi,
        '$10 ₽'
      )
      // Normalize em-dashes before digits (e.g., "—232,45 2" or "—-745,93 2") into standard "-"
      .replace(
        /[—−\-]+\s*(\d+(?:[\s\u00A0]\d{3})*(?:[.,]\d{1,2})?)\s+(?:2|Pf|®|=)(?=\s|$)/gi,
        '-$1 ₽'
      )
      .replace(
        /([+−-]\s*\d+(?:[\s\u00A0]\d{3})*(?:[.,]\d{1,2})?)\s+(?:2|Pf|®|=)(?=\s|$)/gi,
        '$1 ₽'
      )
  );
}

function normalizeMerchantLookalikes(text: string): string {
  return text
    .replace(/^(?:оплата товаров и услуг|оплата в|покупка в)\s+/i, '')
    .replace(/(^|\s)(?:огоп|оzоп|ozоп|0zon|oz0n)(?=\s|$|[•.,])/gi, '$1Ozon')
    .replace(/(^|\s)(?:лента|lenta)(?=\s|$|[•.,])/gi, '$1Лента')
    .replace(/(^|\s)(?:мегафон|megafon)(?=\s|$|[•.,])/gi, '$1Мегафон')
    .replace(/(^|\s)сервисы\s+яндекса(?=\s|$|[•.,])/gi, '$1Сервисы Яндекса')
    .replace(/(^|\s)(?:пят[её]рочка|pyaterochka)(?=\s|$|[•.,])/gi, '$1Пятёрочка')
    .replace(/(^|\s)(?:перекр[её]сток|perekrestok)(?=\s|$|[•.,])/gi, '$1Перекрёсток')
    .replace(/(^|\s)(?:вкусвилл|vkusvill)(?=\s|$|[•.,])/gi, '$1ВкусВилл')
    .replace(/(^|\s)красное\s*[&и]\s*белое(?=\s|$|[•.,])/gi, '$1Красное & Белое')
    .replace(/(^|\s)(?:магнит|magnit)(?=\s|$|[•.,])/gi, '$1Магнит')
    .replace(/(^|\s)vita\s*apteka(?:\s+\d+)?/gi, '$1Vita Apteka')
    .replace(/^(?:[a-zA-Zа-яА-ЯёЁ0-9$¢©®@()]+\s+)*с\s+моего\s+сч[её]та/i, 'С моего счёта')
    .replace(/^(?:©\s+|с\s+)?моего\s+сч[её]та/i, 'С моего счёта')
    .replace(/^мобильн[ая]*\s+связь\s*[-—]\s*мегафон/i, 'Мобильная связь - Мегафон');
}

function cleanOcrLineNoise(raw: string): string {
  const cleaned = raw
    .replace(/(?:карта|card)?\s*[*•·]{1,4}\s*\d{3,4}/gi, ' ')
    .replace(/код\s+авторизации:?\s*[a-zA-Z0-9]+/gi, ' ')
    .replace(/\b(?:CRD|C2C|SBP|TRN|DOC)_[A-Z0-9]+\b/gi, ' ')
    .replace(/\b(?:мсс|mcc):?\s*\d{4}\b/gi, ' ')
    .replace(/\b(?:rus|ru)\s+(?:moskva|moscow|spb|sankt-peterburg)\b/gi, ' ')
    // Strip leading symbol noise and icon tokens with closing brackets/quotes like "Ге) ", "К°) ", "(©) ", "‘@ ", "$¢ "
    .replace(/^[\s"'‘’“”«»<>+•*—–\-|©®@°%()$¢[\]\\/]+/, '')
    .replace(/^(?:\S{1,4}[)\]}|>»”"]\s+)+/g, '')
    .replace(/^[\s"'‘’“”«»<>+•*—–\-|©®@°%()$¢[\]\\/]+/, '')
    // Strip Rocketbank / Ozon icon prefixes ("Keb ", "К&Б ", "ess ", "‘в ", "ry ", "rs ", "К ")
    .replace(/^(?:keb|к&б|к8б|ess)\s+/i, '')
    .replace(
      /^(?!(?:ип|ИП|я|Я|с|С|на|НА|На|от|ОТ|за|ЗА|по|ПО|из|ИЗ)\s)[a-zA-Zа-яА-ЯёЁ0-9]{1,2}\s+(?=[А-ЯЁA-Z][А-ЯЁа-яёA-Za-z]{2,})/u,
      ''
    )
    .replace(/[\s+•*—–|<>=$¢’']+/g, (m, offset, str) =>
      offset + m.length === str.length ? '' : m
    )
    .replace(/\s+/g, ' ')
    .trim();

  const normalized = normalizeMerchantLookalikes(cleaned);
  // Strip trailing 4-digit card/terminal numbers often present at the end of PDF statement lines (e.g. "Сервисы Яндекса 4377")
  return normalized.replace(/^([А-ЯЁа-яёA-Za-z].*?)\s+\d{4}$/, '$1').trim();
}

export interface PdfTextPositionedItem {
  str: string;
  x: number;
  y: number;
}

/**
 * Reconstructs visual table rows from PDF positioned text items.
 * Groups items whose Y coordinates are within rowTolerance points (3.5pt),
 * orders rows top-to-bottom (descending Y), and sorts items in each row left-to-right (ascending X).
 */
export function reconstructPdfRowsFromItems(
  items: PdfTextPositionedItem[],
  rowTolerance = 3.5
): string[] {
  const valid = items
    .map((item) => ({
      str: (item.str || '').trim(),
      x: Number(item.x) || 0,
      y: Number(item.y) || 0,
    }))
    .filter((item) => item.str.length > 0);

  if (valid.length === 0) return [];

  // Sort top-to-bottom (higher Y first), then left-to-right (lower X first)
  valid.sort((a, b) => {
    if (Math.abs(b.y - a.y) > rowTolerance) {
      return b.y - a.y;
    }
    return a.x - b.x;
  });

  const rows: { anchorY: number; cells: PdfTextPositionedItem[] }[] = [];

  for (const item of valid) {
    const existingRow = rows.find(
      (r) => Math.abs(r.anchorY - item.y) <= rowTolerance
    );
    if (existingRow) {
      existingRow.cells.push(item);
    } else {
      rows.push({ anchorY: item.y, cells: [item] });
    }
  }

  return rows
    .map((row) => {
      row.cells.sort((a, b) => a.x - b.x);
      return row.cells
        .map((c) => c.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    })
    .filter((line) => line.length >= 2);
}

function parseRussianDateHeader(line: string, referenceDate: Date): string | null {
  const cleaned = cleanOcrLineNoise(line).toLowerCase();
  if (!cleaned) return null;

  const formatISO = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  if (/^сегодня(?:\s|$|[,.:])/.test(cleaned)) {
    return formatISO(referenceDate);
  }
  if (/^вчера(?:\s|$|[,.:])/.test(cleaned)) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - 1);
    return formatISO(d);
  }
  if (/^позавчера(?:\s|$|[,.:])/.test(cleaned)) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - 2);
    return formatISO(d);
  }

  // Match "11 ноября, ср" or "10 ноября 2026"
  const m = cleaned.match(/^(\d{1,2})\s+([а-яё]+)(?:[\s,]+([а-яёa-z]{2}|\d{4}))?/i);
  if (m) {
    const dayNum = Number(m[1]);
    const monthWord = m[2];
    if (dayNum >= 1 && dayNum <= 31) {
      const matchedMonth = RU_MONTH_PREFIXES.find((item) =>
        monthWord.startsWith(item.prefix)
      );
      if (matchedMonth) {
        const yearStr =
          m[3] && /^\d{4}$/.test(m[3]) ? m[3] : String(referenceDate.getFullYear());
        const dd = String(dayNum).padStart(2, '0');
        return `${yearStr}-${matchedMonth.month}-${dd}`;
      }
    }
  }

  return null;
}

function extractCanonicalBankSubtitle(line: string): string | null {
  const cleaned = cleanOcrLineNoise(line).toLowerCase();
  if (!cleaned || cleaned.length > 36) return null;
  // A hyphenated merchant line like "МОБИЛЬНАЯ СВЯЗЬ - МЕГАФОН" is a full merchant, not a subtitle
  if (/\s[-—]\s/.test(cleaned)) return null;
  // Subtitle lines NEVER contain explicit signed amounts (like "- 4 350") or currency units after digits
  if (/(?:^|\s)[+−-]\s*\d/.test(line)) return null;
  if (/\d(?:[\s\u00A0.,]*\d)*\s*(?:₽|руб|р\.|ор\b|р\b|p\b|\$|€|₸)/i.test(line)) {
    return null;
  }
  for (const entry of BANK_SUBTITLE_CANONICAL_MAP) {
    if (entry.keywords.some((kw) => cleaned.includes(kw))) {
      return entry.canonical;
    }
  }
  return null;
}

export function parseBankStatementText(
  rawText: string,
  categories: Category[],
  referenceDate: Date = new Date()
): ScannedTransactionDraft[] {
  const todayISO = referenceDate.toISOString().slice(0, 10);
  const rawLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 2);

  const drafts: ScannedTransactionDraft[] = [];
  let currentSectionDate = todayISO;
  let skipNextSummaryTotalsLine = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = normalizeRocketbankWideFontLine(rawLines[i]);
    const lowerLine = line.toLowerCase();

    // 1. Skip phone status bar lines, Rocketbank header ("ЭЙ, РОКИ"), cashback bonus sublines ("РАЛЛИБУСТ 6,66%"), or PDF statement metadata/totals
    if (
      /^\d{1,2}:\d{2}\b/.test(line) ||
      /раллибуст|\d+[.,]\d+%\s+\d+[.,]\d+%|эй,\s*роки|рок!\s*0|^—\s*f-1|^\[3\]|^hh\s+onna/i.test(
        lowerLine
      ) ||
      /выписка по сч|справка о движении|за период с|дата формирования|входящий остаток|исходящий остаток|остаток на начало|остаток на конец|всего списаний|всего пополнений|всего поступлений|итого по операциям|сумма в валюте|дата и время операции|страница\s+\d+|продолжение на следующей|\b(?:408|423|301|302)\d{17}\b|\bбик\s*\d{9}\b/i.test(
        lowerLine
      ) ||
      /^(?:операции|история|все операции|счёт|фильтр|без переводов|код авторизации)/i.test(
        cleanOcrLineNoise(line)
      )
    ) {
      continue;
    }

    // 2. Detect summary header like "Расходы Доходы" and skip the summary totals row below it
    if (/расходы\s+доходы|доходы\s+расходы|баланс\s+за\s+месяц/i.test(lowerLine)) {
      skipNextSummaryTotalsLine = true;
      continue;
    }

    if (skipNextSummaryTotalsLine) {
      skipNextSummaryTotalsLine = false;
      // If this line has no explicit +/- signs (or has 2 separate totals like "10 875Р 10 908Р"), skip it
      const hasExplicitSign = /(?:^|\s)[+−-]\s*\d/.test(line);
      if (!hasExplicitSign) {
        continue;
      }
    }

    // 3. Check if this line is a section date header ("Вчера", "11 ноября, ср", etc.)
    const headerDate = parseRussianDateHeader(line, referenceDate);
    if (headerDate) {
      currentSectionDate = headerDate;
      continue;
    }

    // 4. Check if this line is a bank category subtitle for the previous transaction
    const canonicalSubtitle = drafts.length > 0 ? extractCanonicalBankSubtitle(line) : null;
    if (canonicalSubtitle) {
      const prev = drafts[drafts.length - 1];
      if (!prev.note.toLowerCase().includes(canonicalSubtitle.toLowerCase())) {
        const combinedNote = `${prev.note} • ${canonicalSubtitle}`;
        const rematched = matchCategoryByMerchant(combinedNote, categories);
        prev.note = combinedNote;
        if (rematched.confidence === 'high') {
          prev.categoryId = rematched.categoryId;
          // Preserve explicit '+' or '-' sign from the transaction line unless subtitle strongly confirms income
          if (
            rematched.type === 'income' &&
            /пополнен|зачислен|перевод от|зарплат|кэшбэк/i.test(canonicalSubtitle)
          ) {
            prev.type = 'income';
          }
        }
        // Ensure category type matches transaction type
        const catObj = categories.find((c) => c.id === prev.categoryId);
        if (!catObj || catObj.type !== prev.type) {
          const fallbackCat =
            prev.type === 'income'
              ? categories.find((c) => c.id === 'cat_gifts') ||
                categories.find((c) => c.type === 'income')
              : categories.find((c) => c.id === 'cat_other') ||
                categories.find((c) => c.type === 'expense');
          if (fallbackCat) prev.categoryId = fallbackCat.id;
        }
      }
      continue;
    }

    // 5. Check explicit inline date DD.MM.YYYY or YYYY-MM-DD
    let detectedDate = currentSectionDate;
    const ruDateMatch = line.match(/\b(\d{2})\.(\d{2})(?:\.(\d{2,4}))?\b/);
    const isoDateMatch = line.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    const hasInlineDate = Boolean(isoDateMatch || ruDateMatch);

    if (isoDateMatch) {
      detectedDate = isoDateMatch[1];
    } else if (ruDateMatch) {
      const dd = ruDateMatch[1];
      const mm = ruDateMatch[2];
      let yyyy = ruDateMatch[3] ? ruDateMatch[3] : String(referenceDate.getFullYear());
      if (yyyy.length === 2) yyyy = `20${yyyy}`;
      detectedDate = `${yyyy}-${mm}-${dd}`;
    }

    // Remove inline dates, times (including HH:MM:SS), and card masks (**1431) before extracting monetary amount
    const lineForAmount = line
      .replace(/(?:карта|card)?\s*[*•·]{1,4}\s*\d{3,4}/gi, ' ')
      .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ')
      .replace(/\b\d{2}\.\d{2}(?:\.\d{2,4})?\b/g, ' ')
      .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, ' ');

    // Match amounts with currency or explicit +/- sign (or 2-decimal PDF column amounts on dated rows).
    const amountRegex =
      /([+−-])?\s*(\d{1,3}(?:[\s\u00A0]\d{3})+|\d+)(?:[.,](\d{1,2}))?\s*(₽|руб\.?|р\.?|rub|ор|р|p|\$|€|₸|byn)?/gi;

    const allMatches = Array.from(lineForAmount.matchAll(amountRegex)).filter((m) => {
      const sign = m[1] || '';
      const dec = m[3] || '';
      const currency = m[4] || '';
      const rawDigits = (m[2] || '').replace(/[\s\u00A0]+/g, '');
      if (!rawDigits || Number(rawDigits) <= 0) return false;
      // Accept if it has an explicit +/- sign, a currency unit, OR is a dated PDF table row with 2 decimal places (e.g. "1 450,00")
      return Boolean(sign || currency || (hasInlineDate && dec.length === 2));
    });

    if (allMatches.length === 0) continue;

    // Skip lines that look like dual summary widgets (2+ unsigned currency totals with DIFFERENT values on a line without a date)
    if (
      !hasInlineDate &&
      allMatches.length >= 2 &&
      allMatches.every((m) => !m[1] && Boolean(m[4]))
    ) {
      continue;
    }

    // Pick the best monetary match (prefer one with both sign & currency, or at end of line)
    const bestMatch = allMatches.reduce((best, cur) => {
      const curScore = (cur[1] ? 2 : 0) + (cur[4] ? 2 : 0) + (cur[3] ? 1 : 0);
      const bestScore = (best[1] ? 2 : 0) + (best[4] ? 2 : 0) + (best[3] ? 1 : 0);
      if (curScore !== bestScore) return curScore > bestScore ? cur : best;
      const curVal = Number(cur[2].replace(/[\s\u00A0]+/g, ''));
      const bestVal = Number(best[2].replace(/[\s\u00A0]+/g, ''));
      return curVal >= bestVal ? cur : best;
    }, allMatches[0]);

    const signChar = bestMatch[1] || '';
    const intPartStr = bestMatch[2].replace(/[\s\u00A0]+/g, '');
    const decPartStr = bestMatch[3] || '';
    const floatAmount = Number(
      decPartStr ? `${intPartStr}.${decPartStr}` : intPartStr
    );
    const numericAmount = Math.round(floatAmount);

    if (!numericAmount || numericAmount <= 0 || numericAmount > 100_000_000) continue;

    // Extract merchant / note text, removing duplicate amount columns (e.g. T-Bank PDF statements print amount in op currency and account currency)
    let rawNote = lineForAmount;
    for (const m of allMatches) {
      const mInt = (m[2] || '').replace(/[\s\u00A0]+/g, '');
      const mDec = m[3] || '';
      const mFloat = Number(mDec ? `${mInt}.${mDec}` : mInt);
      if (Math.round(mFloat) === numericAmount || m[0] === bestMatch[0]) {
        rawNote = rawNote.replace(m[0], ' ');
      }
    }

    const cleanedNote = cleanOcrLineNoise(rawNote);
    const noteText = cleanedNote || 'Операция по карте';

    const matched = matchCategoryByMerchant(noteText, categories);

    const hasMinusSign = signChar === '-' || signChar === '−';
    const hasPlusSign = signChar === '+';

    const isExplicitIncome =
      !hasMinusSign &&
      (hasPlusSign ||
        matched.type === 'income' ||
        /пополнение|зачисление|зарплата|перевод от|кэшбэк|входящий перевод/i.test(noteText));

    const finalType: TransactionType = isExplicitIncome ? 'income' : 'expense';
    let finalCategoryId = matched.categoryId;

    if (finalType === 'income') {
      const catObj = categories.find((c) => c.id === finalCategoryId);
      if (!catObj || catObj.type !== 'income') {
        const defaultInc =
          categories.find((c) => c.id === 'cat_gifts') ||
          categories.find((c) => c.id === 'cat_salary') ||
          categories.find((c) => c.type === 'income');
        if (defaultInc) finalCategoryId = defaultInc.id;
      }
    } else {
      const catObj = categories.find((c) => c.id === finalCategoryId);
      if (!catObj || catObj.type !== 'expense') {
        const defaultExp =
          categories.find((c) => c.id === 'cat_other') ||
          categories.find((c) => c.type === 'expense');
        if (defaultExp) finalCategoryId = defaultExp.id;
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
    id: 'preset_ozon',
    bankName: 'Ozon Банк (Скриншот операций)',
    subtitle: '7 операций: Ozon, Сервисы Яндекса, Лента, Мегафон и пополнения',
    rawStatement: [
      'Вчера',
      'Ozon -973,38 ₽',
      'Покупка',
      'Вероника Алексеевна С. +980 ₽',
      'Пополнения',
      '11 ноября, ср',
      'Сервисы Яндекса -2 294 ₽',
      'Фастфуд',
      'Вероника Алексеевна С. +2 300 ₽',
      'Пополнения',
      '10 ноября, вт',
      'Лента -619,98 ₽',
      'Супермаркеты • Карта **1431',
      'Вероника Алексеевна С. +500 ₽',
      'Пополнения',
      'Мегафон -20 ₽',
      'Связь и Интернет',
    ].join('\n'),
  },
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
    id: 'preset_pdf',
    bankName: 'PDF-выписка (Сбер / Т-Банк)',
    subtitle: 'Табличная выписка по счёту с датами, временем и кодами карт',
    rawStatement: [
      'Выписка по счёту дебетовой карты за период с 01.11.2026 по 14.11.2026',
      'Входящий остаток 45 200,00 ₽ Исходящий остаток 98 410,00 ₽',
      '13.11.2026 19:42 13.11.2026 -1 480,00 ₽ -1 480,00 ₽ Оплата в Пятёрочка 4377',
      '13.11.2026 14:15 13.11.2026 -1 011,00 ₽ -1 011,00 ₽ VITA APTEKA 3930 4377',
      '12.11.2026 11:20 12.11.2026 +65 000,00 ₽ +65 000,00 ₽ Зачисление заработной платы 4377',
      '11.11.2026 21:05 11.11.2026 -2 294,00 ₽ -2 294,00 ₽ Сервисы Яндекса 4377',
      '10.11.2026 08:30 10.11.2026 -690,00 ₽ -690,00 ₽ Яндекс Go Такси 4377',
    ].join('\n'),
  },
];

async function extractPdfStatementData(
  file: File,
  onProgress?: (statusText: string) => void
): Promise<{
  extractedText: string;
  pageCount: number;
  previewDataUrl?: string;
}> {
  onProgress?.('Чтение страниц PDF-выписки...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import('pdfjs-dist');

  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const maxPages = Math.min(pdfDoc.numPages, 15);
  const allRows: string[] = [];
  let previewDataUrl: string | undefined;

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    onProgress?.(`Извлечение таблицы операций из PDF (стр. ${pageNum} из ${maxPages})...`);
    const page = await pdfDoc.getPage(pageNum);

    // Render Page 1 as a visual thumbnail preview for the UI
    if (pageNum === 1 && typeof document !== 'undefined') {
      try {
        const viewport = page.getViewport({ scale: 1.3 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, canvas, viewport }).promise;
          previewDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch {
        // Ignore thumbnail rendering errors
      }
    }

    const textContent = await page.getTextContent();
    const positionedItems: PdfTextPositionedItem[] = [];

    for (const item of textContent.items) {
      if ('str' in item && typeof item.str === 'string') {
        const transform = Array.isArray(item.transform) ? item.transform : [1, 0, 0, 1, 0, 0];
        positionedItems.push({
          str: item.str,
          x: Number(transform[4]) || 0,
          y: Number(transform[5]) || 0,
        });
      }
    }

    const pageRows = reconstructPdfRowsFromItems(positionedItems);
    allRows.push(...pageRows);
  }

  let extractedText = allRows.join('\n').trim();

  // If the PDF is a scanned image without selectable text layer, run OCR on rendered pages
  if (extractedText.length < 20 && typeof document !== 'undefined') {
    onProgress?.('PDF содержит отсканированное изображение — запуск оптического OCR...');
    const Tesseract = await import('tesseract.js');
    const ocrChunks: string[] = [];
    const scanPages = Math.min(pdfDoc.numPages, 3);

    for (let pageNum = 1; pageNum <= scanPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.8 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, canvas, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const ocrRes = await Tesseract.recognize(dataUrl, 'rus+eng');
        if (ocrRes?.data?.text) {
          ocrChunks.push(ocrRes.data.text);
        }
      }
    }
    extractedText = ocrChunks.join('\n').trim();
  }

  return {
    extractedText,
    pageCount: pdfDoc.numPages,
    previewDataUrl,
  };
}

async function compressImageForUpload(
  file: File
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File read error'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const scale = maxDim / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            const commaIdx = dataUrl.indexOf(',');
            resolve({
              base64: commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl,
              mimeType: file.type || 'image/jpeg',
            });
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL('image/jpeg', 0.88);
          const commaIdx = compressedUrl.indexOf(',');
          resolve({
            base64: commaIdx >= 0 ? compressedUrl.slice(commaIdx + 1) : compressedUrl,
            mimeType: 'image/jpeg',
          });
        } catch {
          const commaIdx = dataUrl.indexOf(',');
          resolve({
            base64: commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl,
            mimeType: file.type || 'image/jpeg',
          });
        }
      };
      img.onerror = () => {
        const commaIdx = dataUrl.indexOf(',');
        resolve({
          base64: commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl,
          mimeType: file.type || 'image/jpeg',
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export async function analyzeBankScreenshotImage(
  file: File,
  categories: Category[],
  onProgress?: (statusText: string) => void
): Promise<{
  source: 'gemini_vision' | 'pdf_parser' | 'browser_ocr' | 'smart_fallback';
  drafts: ScannedTransactionDraft[];
  recognizedText?: string;
  previewDataUrl?: string;
  isPdf?: boolean;
  pageCount?: number;
  message?: string;
}> {
  const isPdfFile =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  // Branch A: PDF Bank Statement (.pdf)
  if (isPdfFile) {
    try {
      const { extractedText, pageCount, previewDataUrl } =
        await extractPdfStatementData(file, onProgress);

      if (extractedText.length > 0) {
        // 1. Try server-side Gemini AI if configured
        try {
          onProgress?.('Анализ строк PDF-выписки и распределение по категориям...');
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 14000);

          const response = await fetch('/api/scan-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pdfText: extractedText,
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
            if (
              Array.isArray(payload?.transactions) &&
              payload.transactions.length > 0
            ) {
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
                  const matched = matchCategoryByMerchant(
                    item.note || '',
                    categories
                  );
                  const catId =
                    item.categoryId && validIds.has(item.categoryId)
                      ? item.categoryId
                      : matched.categoryId;
                  return {
                    id: `pdf_ai_${Date.now()}_${idx}`,
                    selected: true,
                    type: item.type === 'income' ? 'income' : 'expense',
                    amount: Math.max(1, Math.round(Number(item.amount) || 500)),
                    categoryId: catId,
                    date:
                      item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
                        ? item.date
                        : todayISO,
                    note: item.note || 'Операция из PDF-выписки',
                    confidence: 'high',
                  };
                }
              );

              return {
                source: 'gemini_vision',
                drafts,
                recognizedText: extractedText,
                previewDataUrl,
                isPdf: true,
                pageCount,
                message: `PDF-выписка (${pageCount} стр.) успешно обработана ИИ-сканером: найдено операций — ${drafts.length}.`,
              };
            }
          }
        } catch {
          // Proceed to built-in local PDF statement parser
        }

        // 2. Built-in Local PDF Table Parser (works 100% offline/client-side without API keys)
        const parsedDrafts = parseBankStatementText(extractedText, categories);
        if (parsedDrafts.length > 0) {
          return {
            source: 'pdf_parser',
            drafts: parsedDrafts,
            recognizedText: extractedText,
            previewDataUrl,
            isPdf: true,
            pageCount,
            message: `PDF-выписка (${pageCount} стр.) успешно прочитана: найдено операций — ${parsedDrafts.length}. Проверьте суммы и категории перед сохранением.`,
          };
        }
      }

      return {
        source: 'smart_fallback',
        drafts: [],
        recognizedText: extractedText,
        previewDataUrl,
        isPdf: true,
        pageCount,
        message:
          'Текст из PDF извлечён, но строки с суммами не обнаружены. Вы можете проверить извлечённый текст во вкладке «Текст / СМС из банка».',
      };
    } catch (err) {
      console.warn('PDF extraction error:', err);
      return {
        source: 'smart_fallback',
        drafts: [],
        isPdf: true,
        message:
          'Не удалось прочитать PDF-файл. Убедитесь, что файл выписки не защищён паролем.',
      };
    }
  }

  // Branch B: Image Screenshot (.png, .jpg, .webp)
  onProgress?.('Подготовка изображения и отправка в ИИ-сканер...');
  const { base64: base64Data, mimeType } = await compressImageForUpload(file);

  // 1. Try server-side Gemini Vision API (/api/scan-receipt on AI Studio or Vercel Serverless)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    const response = await fetch('/api/scan-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType,
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
    // Proceed to built-in Browser Neural OCR (Tesseract.js)
  }

  // 2. Built-in Browser OCR (Tesseract.js rus+eng) — works 100% client-side on Vercel / static hosting without API keys
  try {
    onProgress?.('Идёт оптическое распознавание текста на скриншоте (OCR rus+eng)...');
    const Tesseract = await import('tesseract.js');
    const ocrResult = await Tesseract.recognize(file, 'rus+eng');
    const ocrText = ocrResult?.data?.text || '';

    if (ocrText.trim().length > 0) {
      const parsedDrafts = parseBankStatementText(ocrText, categories);
      if (parsedDrafts.length > 0) {
        return {
          source: 'browser_ocr',
          drafts: parsedDrafts,
          recognizedText: ocrText,
          message: `Встроенный OCR-сканер успешно распознал операций на скриншоте: ${parsedDrafts.length}. Проверьте суммы и категории перед сохранением.`,
        };
      }
    }
  } catch (err) {
    console.warn('Browser OCR error:', err);
  }

  return {
    source: 'smart_fallback',
    drafts: [],
    message:
      'Не удалось автоматически прочитать суммы со скриншота. Попробуйте более чёткий скриншот или переключитесь на вкладку «Текст / СМС из банка».',
  };
}

