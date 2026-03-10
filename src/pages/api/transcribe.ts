import type { APIRoute } from 'astro';
import Groq from 'groq-sdk';

export const POST: APIRoute = async ({ request }) => {
    const groq = new Groq({ apiKey: import.meta.env.GROQ_API_KEY });

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
        return new Response(JSON.stringify({ error: 'No audio file provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Use native File constructor (Node.js 20+, available on Vercel)
    // Avoids toFile() which can fail due to ESM/CJS bundling differences in production
    const buffer = await audioFile.arrayBuffer();
    const ext = audioFile.type.includes('mp4') ? 'mp4'
        : audioFile.type.includes('ogg') ? 'ogg'
            : 'webm';

    const file = new File([buffer], `recording.${ext}`, { type: audioFile.type });

    const transcription = await groq.audio.transcriptions.create({
        file,
        model: 'whisper-large-v3',
        response_format: 'json',
        language: 'es',
    });

    return new Response(JSON.stringify({ text: transcription.text }), {
        headers: { 'Content-Type': 'application/json' },
    });
};
