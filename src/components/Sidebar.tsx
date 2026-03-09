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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 2c-1.5 0-3 .5-4 2C4 6 4 8 4 10c0 3 2 5 5 6v3a1 1 0 0 0 2 0v-3c3-1 5-3 5-6 0-2 0-4-1-6-1-1.5-2.5-2-4-2H9Z" />
                            <path d="M12 10v4" />
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
                            <button
                                key={session.id}
                                className={`chat-item ${activeId === session.id ? 'active' : ''}`}
                                onClick={() => onSelect(session.id)}
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
                            </button>
                        ))}
                    </>
                )}
            </div>
        </aside>
    );
}
