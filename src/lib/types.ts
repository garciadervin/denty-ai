export interface ChatSession {
    id: string;
    title: string;
    createdAt: number;
    messages: ChatMessage[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string | ContentPart[];
    createdAt?: number;
}

export interface ContentPart {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
}
