import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../lib/types';

interface MessageBubbleProps {
    message: ChatMessage;
}

function getImageUrl(content: ChatMessage['content']): string | null {
    if (Array.isArray(content)) {
        const img = content.find((p) => p.type === 'image_url');
        return img?.image_url?.url ?? null;
    }
    return null;
}

function getText(content: ChatMessage['content']): string {
    if (typeof content === 'string') return content;
    const textPart = content.find((p) => p.type === 'text');
    return textPart?.text ?? '';
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';
    const text = getText(message.content);
    const imageUrl = getImageUrl(message.content);

    return (
        <div className={`message ${message.role}`}>
            <div className="message-avatar">
                {isUser ? 'T' : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 2c-1.5 0-3 .5-4 2C4 6 4 8 4 10c0 3 2 5 5 6v3a1 1 0 0 0 2 0v-3c3-1 5-3 5-6 0-2 0-4-1-6-1-1.5-2.5-2-4-2H9Z" />
                    </svg>
                )}
            </div>

            <div className="message-content">
                {imageUrl && (
                    <img src={imageUrl} alt="Imagen adjunta" className="message-image" />
                )}
                <div className="message-bubble">
                    {isUser ? (
                        <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                    )}
                </div>
            </div>
        </div>
    );
}
