import 'dotenv/config';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

type DraftType = 'follow_up' | 'proposal';
type DraftTone = 'warm' | 'concise' | 'executive';

interface DraftRequestBody {
  draftType?: unknown;
  tone?: unknown;
  recipientName?: unknown;
  recipientRole?: unknown;
  company?: unknown;
  industry?: unknown;
  scope?: unknown;
  dealValueFormatted?: unknown;
  stageOrStatus?: unknown;
  senderName?: unknown;
  workspaceName?: unknown;
  recentContext?: unknown;
  customInstructions?: unknown;
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n/g, '\n').trim().slice(0, maxLen);
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: unknown }).status)
          : 0;
      const retryable = status === 429 || status >= 500 || status === 0;
      if (!retryable || attempt === maxRetries) {
        throw err;
      }
      const delayMs = 400 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastErr;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const aiConfigured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
    res.json({ ok: true, aiConfigured });
  });

  app.post('/api/ai/draft', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as DraftRequestBody;

    const draftType: DraftType =
      body.draftType === 'proposal' ? 'proposal' : body.draftType === 'follow_up' ? 'follow_up' : 'follow_up';
    const tone: DraftTone =
      body.tone === 'concise' || body.tone === 'executive' ? body.tone : 'warm';

    const recipientName = sanitizeText(body.recipientName, 120);
    const company = sanitizeText(body.company, 120);
    if (!recipientName || !company) {
      res.status(400).json({
        error: 'Recipient name and company are required to draft a message.',
      });
      return;
    }

    const recipientRole = sanitizeText(body.recipientRole, 120) || 'Stakeholder';
    const industry = sanitizeText(body.industry, 80) || 'General';
    const scope = sanitizeText(body.scope, 300) || 'Consulting & Design Engagement';
    const dealValueFormatted = sanitizeText(body.dealValueFormatted, 60);
    const stageOrStatus = sanitizeText(body.stageOrStatus, 60);
    const senderName = sanitizeText(body.senderName, 120) || 'Oluwafemi Olukoyi';
    const workspaceName = sanitizeText(body.workspaceName, 120) || 'Oluwafemi Studio';
    const recentContext = sanitizeText(body.recentContext, 1500);
    const customInstructions = sanitizeText(body.customInstructions, 600);

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Gemini API key is not configured yet. Add GEMINI_API_KEY in Settings > Secrets to enable AI drafting.',
      });
      return;
    }

    const toneGuidance: Record<DraftTone, string> = {
      warm: 'Warm, collaborative, trustworthy, and grounded—never salesy or overly casual.',
      concise: 'Crisp, direct, and respectful of executive time. Under 150 words if follow-up.',
      executive: 'Strategic, structured, and ROI-focused for senior decision-makers.',
    };

    const systemInstruction =
      draftType === 'follow_up'
        ? `You are an experienced principal consultant writing a client follow-up email for ${workspaceName} (${senderName}). Tone: ${toneGuidance[tone]} Write natural, ready-to-send business prose without placeholders like [Date] unless genuinely unknown; propose a concrete next step.`
        : `You are an experienced principal consultant preparing a concise, high-trust project proposal outline for ${workspaceName} (${senderName}). Tone: ${toneGuidance[tone]} Structure the body cleanly with short sections (Context & Objectives, Recommended Scope & Phases, Investment & Timeline, Next Step) using plain text headings and bullets (no markdown tables).`;

    const prompt = [
      `Draft type: ${draftType === 'follow_up' ? 'Follow-up email' : 'Project proposal outline'}`,
      `Recipient: ${recipientName} (${recipientRole}) at ${company}`,
      `Industry: ${industry}`,
      `Engagement scope: ${scope}`,
      dealValueFormatted ? `Estimated / account value: ${dealValueFormatted}` : '',
      stageOrStatus ? `Current CRM stage / status: ${stageOrStatus}` : '',
      recentContext ? `Recent notes & timeline context:\n${recentContext}` : '',
      customInstructions ? `Additional instructions from user:\n${customInstructions}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      const response = await generateWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subject: {
                  type: Type.STRING,
                  description:
                    draftType === 'follow_up'
                      ? 'Clear, specific email subject line.'
                      : 'Concise proposal title and subject line.',
                },
                summary: {
                  type: Type.STRING,
                  description: 'One-sentence CRM timeline summary describing this draft.',
                },
                body: {
                  type: Type.STRING,
                  description: 'Complete ready-to-send email or structured proposal body in clean plain text.',
                },
                suggestedNextStep: {
                  type: Type.STRING,
                  description: 'One concrete next action to schedule or track after sending.',
                },
              },
              required: ['subject', 'summary', 'body', 'suggestedNextStep'],
            },
          },
        })
      );

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
        return;
      }

      const parsed = JSON.parse(rawText) as {
        subject?: string;
        summary?: string;
        body?: string;
        suggestedNextStep?: string;
      };

      res.json({
        subject: parsed.subject ?? '',
        summary: parsed.summary ?? '',
        body: parsed.body ?? '',
        suggestedNextStep: parsed.suggestedNextStep ?? '',
      });
    } catch (err: unknown) {
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: unknown }).status)
          : 500;
      const message = err instanceof Error ? err.message : 'Unable to generate draft.';

      if (status === 400 || status === 403) {
        res.status(status).json({
          error: 'Gemini API request was rejected. Please verify your GEMINI_API_KEY in Settings > Secrets.',
        });
        return;
      }
      if (status === 429) {
        res.status(429).json({
          error: 'Gemini API rate limit reached. Please wait a moment and try again.',
        });
        return;
      }
      if (status === 404) {
        res.status(502).json({
          error: 'Configured Gemini model was unavailable. Please verify model configuration.',
        });
        return;
      }

      res.status(502).json({
        error: message || 'Failed to generate AI draft.',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClientFlow server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ClientFlow server:', err);
  process.exit(1);
});
