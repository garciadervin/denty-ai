import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './Sidebar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import SuggestionChips from './SuggestionChips';
import type { ContentPart, ChatMessage, ChatSession } from '../lib/types';

const STORAGE_KEY = 'denty-sessions';

function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadSessions(): ChatSession[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
    catch { return []; }
}

function saveSessions(s: ChatSession[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function ChatApp() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Refs to avoid stale closures in async operations
    const messagesRef = useRef<ChatMessage[]>([]);
    const activeIdRef = useRef<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { messagesRef.current = messages; }, [messages]);
    useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

    useEffect(() => {
        const saved = loadSessions();
        setSessions(saved);
        if (saved.length > 0) {
            setActiveId(saved[0].id);
            setMessages(saved[0].messages);
        }
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const persistMessages = useCallback((sid: string, msgs: ChatMessage[]) => {
        setSessions((prev) => {
            const updated = prev.map((s) => (s.id === sid ? { ...s, messages: msgs } : s));
            saveSessions(updated);
            return updated;
        });
    }, []);

    const selectSession = useCallback((id: string) => {
        const s = sessions.find((s) => s.id === id);
        if (!s) return;
        setActiveId(id);
        setMessages(s.messages);
        setSidebarOpen(false);
    }, [sessions]);

    const newSession = useCallback(() => {
        const s: ChatSession = { id: genId(), title: 'Nueva consulta', createdAt: Date.now(), messages: [] };
        setSessions((prev) => { const next = [s, ...prev]; saveSessions(next); return next; });
        setActiveId(s.id);
        setMessages([]);
        setSidebarOpen(false);
    }, []);

    const deleteSession = useCallback((id: string) => {
        setSessions((prev) => {
            const next = prev.filter((s) => s.id !== id);
            saveSessions(next);
            if (activeIdRef.current === id) {
                const fallback = next[0] ?? null;
                setActiveId(fallback?.id ?? null);
                setMessages(fallback?.messages ?? []);
            }
            return next;
        });
    }, []);

    const handleSend = useCallback(async (content: string | ContentPart[]) => {
        if (isLoading) return;

        // Snapshot current messages BEFORE any state update (avoids stale closure)
        const history = messagesRef.current.map((m) => ({ role: m.role, content: m.content }));
        history.push({ role: 'user', content });

        // Ensure we have a session
        let sid = activeIdRef.current;
        if (!sid) {
            const title = typeof content === 'string' ? content.slice(0, 48) : 'Nueva consulta';
            const s: ChatSession = { id: genId(), title, createdAt: Date.now(), messages: [] };
            setSessions((prev) => { const next = [s, ...prev]; saveSessions(next); return next; });
            setActiveId(s.id);
            activeIdRef.current = s.id;
            sid = s.id;
        }

        const userMsg: ChatMessage = { id: genId(), role: 'user', content, createdAt: Date.now() };
        const asstId = genId();
        const asstMsg: ChatMessage = { id: asstId, role: 'assistant', content: '', createdAt: Date.now() };

        // Update title from first user message
        const isFirst = messagesRef.current.length === 0;
        if (isFirst) {
            const title = typeof content === 'string' ? content.slice(0, 48) : 'Nueva consulta';
            setSessions((prev) => {
                const updated = prev.map((s) => (s.id === sid ? { ...s, title } : s));
                saveSessions(updated);
                return updated;
            });
        }

        setMessages((prev) => [...prev, userMsg, asstMsg]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulated += decoder.decode(value, { stream: true });
                setMessages((prev) =>
                    prev.map((m) => (m.id === asstId ? { ...m, content: accumulated } : m))
                );
            }

            // Persist final state to localStorage
            setMessages((prev) => {
                persistMessages(sid!, prev);
                return prev;
            });
        } catch {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === asstId
                        ? { ...m, content: 'Lo siento, ocurrió un error. Por favor intenta de nuevo.' }
                        : m
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, persistMessages]);

    const activeSession = sessions.find((s) => s.id === activeId) ?? null;
    const isEmpty = messages.length === 0;

    return (
        <div className="app">
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}
            <Sidebar
                sessions={sessions}
                activeId={activeId}
                onSelect={selectSession}
                onNew={newSession}
                onDelete={deleteSession}
                isOpen={sidebarOpen}
            />

            <main className="main">
                <header className="chat-header">
                    <button
                        className="menu-btn"
                        onClick={() => setSidebarOpen((v) => !v)}
                        aria-label="Abrir menú"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <h2 className="chat-header-title">{activeSession?.title ?? 'Denty-AI'}</h2>
                    <span className="chat-header-badge">Odontología</span>
                </header>

                <div className="chat-window">
                    {isEmpty ? (
                        <SuggestionChips onSelect={handleSend} />
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}
                            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                                <div className="message assistant">
                                    <div className="message-avatar">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 2c-1.5 0-3 .5-4 2C4 6 4 8 4 10c0 3 2 5 5 6v3a1 1 0 0 0 2 0v-3c3-1 5-3 5-6 0-2 0-4-1-6-1-1.5-2.5-2-4-2H9Z" />
                                        </svg>
                                    </div>
                                    <div className="message-content">
                                        <div className="typing-indicator">
                                            <div className="typing-dot" />
                                            <div className="typing-dot" />
                                            <div className="typing-dot" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </>
                    )}
                </div>

                <MessageInput onSend={handleSend} isLoading={isLoading} />
            </main>
        </div>
    );
}
