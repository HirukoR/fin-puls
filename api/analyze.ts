import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(503).json({
      error: 'OFFLINE_MODE',
      message: 'Серверный ключ ИИ не настроен, используется встроенный локальный аналитик.',
    });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { summaryPrompt } = body as { summaryPrompt?: string };
    if (!summaryPrompt) {
      res.status(400).json({ error: 'Missing summaryPrompt' });
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

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: summaryPrompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction:
          'Ты — опытный личный финансовый консультант. Твоя задача — проанализировать обезличенную сводку доходов, расходов по категориям, лимитов и целей пользователя за месяц и вернуть строго структурированный JSON на русском языке без воды: 3 главных наблюдения (куда утекают деньги), конкретный план сокращения расходов на 10–15% в следующем месяце с расчётами экономии, и 1 практический персональный челлендж на неделю.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            observations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  impact: { type: Type.STRING },
                },
              },
            },
            reductionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  action: { type: Type.STRING },
                  potentialSavings: { type: Type.NUMBER },
                },
              },
            },
            weeklyChallenge: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedReward: { type: Type.STRING },
              },
            },
          },
        },
      },
    });

    const rawText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(rawText);
    res.status(200).json({ source: 'gemini', data: parsed });
  } catch (error) {
    console.error('Gemini analysis fallback:', error);
    res.status(503).json({
      error: 'AI_UNAVAILABLE',
      message: 'Переключение на встроенный локальный модуль финансового анализа.',
    });
  }
}
