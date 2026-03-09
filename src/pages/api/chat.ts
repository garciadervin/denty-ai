import type { APIRoute } from 'astro';
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { SYSTEM_PROMPT } from '../../lib/system-prompt';

// Convert image_url (our internal format) to CoreImagePart that AI SDK expects.
// The Groq provider needs a Buffer or Uint8Array — passing a raw data URL string
// won't be interpreted as base64 by the SDK.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePart(p: any) {
    if (p.type === 'text') return { type: 'text' as const, text: p.text };

    if (p.type === 'image_url') {
        const dataUrl: string = p.image_url?.url ?? '';

        if (dataUrl.startsWith('data:')) {
            const [header, base64] = dataUrl.split(',');
            const mimeType = header.match(/^data:([^;]+)/)?.[1] ?? 'image/jpeg';
            return {
                type: 'image' as const,
                image: Buffer.from(base64, 'base64'),
                mimeType,
            };
        }

        // For regular https:// URLs
        return { type: 'image' as const, image: new URL(dataUrl) };
    }

    return p;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMessages(messages: any[]) {
    return messages.map((m) => ({
        role: m.role,
        content: Array.isArray(m.content) ? m.content.map(normalizePart) : m.content,
    }));
}

export const POST: APIRoute = async ({ request }) => {
    const groq = createGroq({ apiKey: import.meta.env.GROQ_API_KEY });
    const body = await request.json();
    const messages = normalizeMessages(body.messages ?? []);

    const result = streamText({
        model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
        system: SYSTEM_PROMPT,
        messages,
        maxOutputTokens: 1024,
        temperature: 0.7,
    });

    return result.toTextStreamResponse();
};
