import express from 'express';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  app.post('/api/analyze', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'OFFLINE_MODE',
        message: 'Серверный ключ ИИ не настроен, используется встроенный локальный аналитик.',
      });
      return;
    }

    try {
      const { summaryPrompt } = req.body as { summaryPrompt?: string };
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
      res.json({ source: 'gemini', data: parsed });
    } catch (error) {
      console.error('Gemini analysis fallback:', error);
      res.status(503).json({
        error: 'AI_UNAVAILABLE',
        message: 'Переключение на встроенный локальный модуль финансового анализа.',
      });
    }
  });

  app.post('/api/scan-receipt', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'OFFLINE_MODE',
        message: 'Серверный ключ ИИ не настроен, используется встроенный OCR-парсер.',
      });
      return;
    }

    try {
      const { imageBase64, mimeType, categories } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        categories?: { id: string; name: string; type: string }[];
      };

      if (!imageBase64) {
        res.status(400).json({ error: 'Missing imageBase64' });
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

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              text: `Распознай все отдельные банковские операции или позиции чека на этом скриншоте (игнорируй общие виджеты итогов за месяц в шапке вроде "Расходы 10 875 ₽ / Доходы 10 908 ₽"). Сегодняшняя дата: ${todayISO}. Учитывай заголовки дат ("Вчера", "11 ноября" и т.д.) и переводи их в формат YYYY-MM-DD. Сопоставь каждую операцию с наиболее подходящим categoryId из списка: [${categoriesListText}]. Если это списание/покупка (со знаком минус) — type="expense", если пополнение/перевод/зарплата/кэшбэк (со знаком плюс) — type="income". Сумму укажи целым положительным числом в рублях (округлив копейки). В поле note укажи название магазина/отправителя и подкатегорию из банка (например: "Сервисы Яндекса • Фастфуд" или "Лента • Супермаркеты").`,
            },
          ],
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
      res.json(parsed);
    } catch (error) {
      console.error('Gemini receipt scan error:', error);
      res.status(503).json({
        error: 'SCAN_FAILED',
        message: 'Переключение на локальный распознаватель.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
