import type { APIRoute } from 'astro';
import Groq, { toFile } from 'groq-sdk';

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

    // In Node.js the File from FormData isn't directly usable by the Groq SDK.
    // toFile() wraps the buffer into the expected Uploadable format.
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const ext = audioFile.type.includes('mp4') ? 'mp4'
        : audioFile.type.includes('ogg') ? 'ogg'
            : 'webm';

    const file = await toFile(buffer, `recording.${ext}`, { type: audioFile.type });

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
