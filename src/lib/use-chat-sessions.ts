import { useState, useEffect, useCallback } from 'react';
import type { ChatSession, ChatMessage } from './types';

const STORAGE_KEY = 'denty-ai-chats';

function loadSessions(): ChatSession[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveSessions(sessions: ChatSession[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function generateId(): string {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function useChatSessions() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        const loaded = loadSessions();
        setSessions(loaded);
        if (loaded.length > 0) setActiveId(loaded[0].id);
    }, []);

    const activeSession = sessions.find((s) => s.id === activeId) ?? null;

    const createSession = useCallback(() => {
        const session: ChatSession = {
            id: generateId(),
            title: 'Nueva consulta',
            createdAt: Date.now(),
            messages: [],
        };
        setSessions((prev) => {
            const next = [session, ...prev];
            saveSessions(next);
            return next;
        });
        setActiveId(session.id);
        return session.id;
    }, []);

    const updateSession = useCallback((id: string, messages: ChatMessage[]) => {
        setSessions((prev) => {
            const next = prev.map((s) => {
                if (s.id !== id) return s;
                const firstUserMsg = messages.find((m) => m.role === 'user');
                const title = firstUserMsg
                    ? (typeof firstUserMsg.content === 'string'
                        ? firstUserMsg.content
                        : (firstUserMsg.content[0] as { text?: string }).text ?? 'Nueva consulta'
                    ).slice(0, 48)
                    : s.title;
                return { ...s, messages, title };
            });
            saveSessions(next);
            return next;
        });
    }, []);

    const deleteSession = useCallback((id: string) => {
        setSessions((prev) => {
            const next = prev.filter((s) => s.id !== id);
            saveSessions(next);
            if (activeId === id) setActiveId(next[0]?.id ?? null);
            return next;
        });
    }, [activeId]);

    return {
        sessions,
        activeId,
        activeSession,
        setActiveId,
        createSession,
        updateSession,
        deleteSession,
    };
}
