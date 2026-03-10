import { useRef, useState, useCallback, useEffect } from 'react';
import type { ContentPart } from '../lib/types';

interface MessageInputProps {
    onSend: (content: string | ContentPart[]) => void;
    isLoading: boolean;
    disabled?: boolean;
}

export default function MessageInput({ onSend, isLoading, disabled }: MessageInputProps) {
    const [text, setText] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const adjustHeight = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 150) + 'px';
    }, []);

    useEffect(() => { adjustHeight(); }, [text, adjustHeight]);

    const handleSend = useCallback(() => {
        const trimmed = text.trim();
        if (!trimmed && images.length === 0) return;
        if (isLoading) return;

        let content: string | ContentPart[];
        if (images.length > 0) {
            const parts: ContentPart[] = [];
            if (trimmed) parts.push({ type: 'text', text: trimmed });
            images.forEach((url) => parts.push({ type: 'image_url', image_url: { url } }));
            content = parts;
        } else {
            content = trimmed;
        }

        onSend(content);
        setText('');
        setImages([]);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }, [text, images, isLoading, onSend]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Resize image to max 1024px before encoding to keep payload small
    const resizeImage = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const MAX_PX = 1024;
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                let { width, height } = img;
                if (width > MAX_PX || height > MAX_PX) {
                    if (width >= height) {
                        height = Math.round((height * MAX_PX) / width);
                        width = MAX_PX;
                    } else {
                        width = Math.round((width * MAX_PX) / height);
                        height = MAX_PX;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.onerror = reject;
            img.src = objectUrl;
        });

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
        const files = Array.from(e.target.files ?? []);
        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                alert(`La imagen "${file.name}" supera los 20 MB.`);
                continue;
            }
            try {
                const resized = await resizeImage(file);
                setImages((prev) => [...prev, resized]);
            } catch {
                alert(`No se pudo procesar la imagen "${file.name}".`);
            }
        }
        e.target.value = '';
    };

    const startRecording = async () => {
        // Detect best supported audio format — iOS Safari requires audio/mp4
        const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
            .find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            chunksRef.current = [];
            recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                const actualMime = recorder.mimeType || mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: actualMime });
                await transcribeAudio(blob, actualMime);
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
        } catch {
            alert('No se pudo acceder al micrófono. Verifica los permisos del navegador.');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        setIsTranscribing(true);
    };

    const transcribeAudio = async (blob: Blob, mimeType: string) => {
        const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
        const formData = new FormData();
        formData.append('audio', blob, `recording.${ext}`);
        try {
            const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.text) setText((prev) => prev ? `${prev} ${data.text}` : data.text);
        } catch (err) {
            console.error('Transcription error:', err);
        } finally {
            setIsTranscribing(false);
        }
    };

    const canSend = (text.trim().length > 0 || images.length > 0) && !isLoading && !disabled;

    return (
        <div className="input-area">
            <div className="input-container">
                {(images.length > 0 || isTranscribing) && (
                    <div className="input-attachments">
                        {images.map((src, i) => (
                            <div key={i} className="attachment-preview">
                                <img src={src} alt={`Imagen ${i + 1}`} />
                                <button
                                    className="remove-btn"
                                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                                >✕</button>
                            </div>
                        ))}
                        {isTranscribing && (
                            <div className="audio-preview">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                </svg>
                                Transcribiendo audio…
                            </div>
                        )}
                    </div>
                )}

                <div className="input-box">
                    <textarea
                        ref={textareaRef}
                        id="chat-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe tu consulta odontológica…"
                        rows={1}
                        disabled={disabled}
                    />

                    <div className="input-actions">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleImageSelect}
                        />
                        <button
                            id="attach-image-btn"
                            className="icon-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Adjuntar imagen"
                            disabled={disabled}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                        </button>

                        <button
                            id="record-audio-btn"
                            className={`icon-btn ${isRecording ? 'recording' : ''}`}
                            onClick={isRecording ? stopRecording : startRecording}
                            title={isRecording ? 'Detener grabación' : 'Grabar audio'}
                            disabled={disabled || isTranscribing}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" x2="12" y1="19" y2="22" />
                            </svg>
                        </button>

                        <button
                            id="send-message-btn"
                            className="send-btn"
                            onClick={handleSend}
                            disabled={!canSend}
                            title="Enviar"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <p className="input-hint">
                    Denty orienta, pero no reemplaza al odontólogo. Siempre consulta a un profesional.
                </p>
            </div>
        </div>
    );
}
