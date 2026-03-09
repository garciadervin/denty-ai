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
                    <path d="M9 2c-1.5 0-3 .5-4 2C4 6 4 8 4 10c0 3 2 5 5 6v3a1 1 0 0 0 2 0v-3c3-1 5-3 5-6 0-2 0-4-1-6-1-1.5-2.5-2-4-2H9Z" />
                    <path d="M12 10v4" />
                    <path d="M10 12h4" />
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
