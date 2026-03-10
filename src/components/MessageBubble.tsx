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
                        <path d="M9 3C7 3 5 4.8 5 7c0 2.2 1 4 2 5.5L8.5 20c.2.9.7 1.5 1.5 1.5s1.2-.6 1.5-1.5L12 17l.5 3c.3.9.8 1.5 1.5 1.5s1.3-.6 1.5-1.5L17 12.5C18 11 19 9.2 19 7c0-2.2-1.5-4-3.5-4H9z" />
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
