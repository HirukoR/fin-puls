import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(503).json({
      error: 'OFFLINE_MODE',
      message: 'Серверный ключ ИИ не настроен, используется встроенный OCR-парсер.',
    });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { imageBase64, mimeType, pdfText, categories } = body;

    if (!imageBase64 && !pdfText) {
      res.status(400).json({ error: 'Missing imageBase64 or pdfText' });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const categoriesListText = (categories || [])
      .map((c) => `${c.id}: ${c.name} (${c.type})`)
      .join(', ');
    const todayISO = new Date().toISOString().slice(0, 10);

    const promptText = `Распознай все отдельные банковские операции из этой банковской выписки или скриншота (игнорируй общие виджеты итогов за период, входящий/исходящий остаток, номера счетов и мелкие строки начисления бонусов вроде "РАЛЛИБУСТ +31₽"). Сегодняшняя дата: ${todayISO}. Учитывай даты операций (ДД.ММ.ГГГГ, "Сегодня", "Вчера", "11 ноября" и т.д.) и переводи их в формат YYYY-MM-DD. Сопоставь каждую операцию с наиболее подходящим categoryId из списка: [${categoriesListText}]. Если это списание/покупка — type="expense", если пополнение/перевод/зарплата/кэшбэк — type="income". Сумму укажи целым положительным числом в рублях (округлив копейки). В поле note укажи чистое название магазина, сервиса или отправителя на русском языке.`;

    const parts = [];
    if (pdfText && String(pdfText).trim().length > 0) {
      parts.push({
        text: `Текст банковской PDF-выписки:\n${String(pdfText).slice(0, 30000)}\n\n${promptText}`,
      });
    } else if (imageBase64) {
      parts.push(
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          text: promptText,
        }
      );
    }

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: {
        parts,
      },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  categoryId: { type: Type.STRING },
                  date: { type: Type.STRING },
                  note: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const rawText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(rawText);
    res.status(200).json(parsed);
  } catch (error) {
    console.error('Gemini receipt scan error:', error);
    res.status(503).json({
      error: 'SCAN_FAILED',
      message: 'Переключение на встроенный OCR-распознаватель.',
    });
  }
}
