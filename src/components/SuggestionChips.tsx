interface SuggestionChipsProps {
    onSelect: (text: string) => void;
}

const SUGGESTIONS = [
    '¿Qué es una caries y cómo se trata?',
    '¿Cuándo es necesaria una endodoncia?',
    '¿Cómo interpretar una radiografía dental?',
    'Tipos de anestesia usados en odontología',
    'Me duele una muela, ¿qué puede ser?',
    'Diferencia entre resina y amalgama dental',
];

export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
    return (
        <div className="welcome">
            <div className="welcome-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 3C7 3 5 4.8 5 7c0 2.2 1 4 2 5.5L8.5 20c.2.9.7 1.5 1.5 1.5s1.2-.6 1.5-1.5L12 17l.5 3c.3.9.8 1.5 1.5 1.5s1.3-.6 1.5-1.5L17 12.5C18 11 19 9.2 19 7c0-2.2-1.5-4-3.5-4H9z" />
                </svg>
            </div>
            <h1 className="welcome-title">Hola, soy Denty 👋</h1>
            <p className="welcome-subtitle">
                Tu asistente de odontología para formación académica. Puedo ayudarte con dudas sobre salud bucal, procedimientos, interpretación de imágenes y más.
            </p>
            <div className="suggestions-grid">
                {SUGGESTIONS.map((s) => (
                    <button
                        key={s}
                        className="suggestion-chip"
                        onClick={() => onSelect(s)}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}
