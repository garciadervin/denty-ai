import type { APIRoute } from 'astro';
import Groq from 'groq-sdk';

export const POST: APIRoute = async ({ request }) => {
    const groq = new Groq({ apiKey: import.meta.env.GROQ_API_KEY });

    const { audio, mimeType, ext } = await request.json();

    if (!audio) {
        return new Response(JSON.stringify({ error: 'No audio data' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Decode base64 to binary
    const binary = atob(audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    const file = new File([bytes], `recording.${ext}`, { type: mimeType });

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
