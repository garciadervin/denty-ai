import type { ChatSession } from '../lib/types';

interface SidebarProps {
    sessions: ChatSession[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onNew: () => void;
    onDelete: (id: string) => void;
    isOpen?: boolean;
}

export default function Sidebar({ sessions, activeId, onSelect, onNew, onDelete, isOpen }: SidebarProps) {
    return (
        <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 3C7 3 5 4.8 5 7c0 2.2 1 4 2 5.5L8.5 20c.2.9.7 1.5 1.5 1.5s1.2-.6 1.5-1.5L12 17l.5 3c.3.9.8 1.5 1.5 1.5s1.3-.6 1.5-1.5L17 12.5C18 11 19 9.2 19 7c0-2.2-1.5-4-3.5-4H9z" />
                        </svg>
                    </div>
                    <span className="sidebar-logo-text">Denty-AI</span>
                </div>
                <button id="new-chat-btn" className="new-chat-btn" onClick={onNew} title="Nueva consulta">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </button>
            </div>

            <div className="sidebar-list">
                {sessions.length === 0 ? (
                    <p className="sidebar-empty">Sin conversaciones aún.<br />¡Empieza tu primera consulta!</p>
                ) : (
                    <>
                        <p className="sidebar-section-label">Recientes</p>
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`chat-item ${activeId === session.id ? 'active' : ''}`}
                                onClick={() => onSelect(session.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && onSelect(session.id)}
                            >
                                <svg className="chat-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                <span className="chat-item-title">{session.title}</span>
                                <button
                                    className="chat-item-delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(session.id);
                                    }}
                                    title="Eliminar"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6 6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </aside>
    );
}
