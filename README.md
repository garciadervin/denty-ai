# Denty-AI 🦷

Chatbot educativo de odontología impulsado por IA, diseñado para la formación académica dental en el contexto venezolano.

## Características

- 💬 Chat en tiempo real con streaming
- 🖼️ Análisis de imágenes dentales (radiografías, fotos clínicas)
- 🎙️ Transcripción de audio para consultas por voz
- 📱 Interfaz responsive (desktop y móvil)
- 💾 Historial de chats persistido en localStorage

## Stack

- **Framework:** [Astro](https://astro.build) con SSR + adaptador Vercel
- **UI:** React 19 + Vanilla CSS
- **IA:** [Vercel AI SDK](https://sdk.vercel.ai/) + [Groq](https://groq.com/)
  - Chat: `meta-llama/llama-4-scout-17b-16e-instruct` (texto + visión)
  - Audio: `whisper-large-v3`

## Desarrollo local

```bash
# 1. Clonar e instalar dependencias
npm install

# 2. Configurar variable de entorno
cp .env.example .env
# Editar .env y agregar tu GROQ_API_KEY (https://console.groq.com/keys)

# 3. Correr servidor de desarrollo
npm run dev
# → http://localhost:4321
```

## Despliegue en Vercel

1. Sube el repositorio a GitHub
2. Importa el proyecto en [vercel.com](https://vercel.com)
3. Agrega la variable de entorno `GROQ_API_KEY` en **Settings → Environment Variables**
4. Despliega — Vercel detecta Astro automáticamente

## Estructura

```
src/
├── components/
│   ├── ChatApp.tsx        # Orquestador principal
│   ├── Sidebar.tsx        # Lista de conversaciones
│   ├── MessageBubble.tsx  # Burbuja de mensaje (markdown)
│   ├── MessageInput.tsx   # Input con imagen y audio
│   └── SuggestionChips.tsx # Pantalla de bienvenida
├── lib/
│   ├── system-prompt.ts   # Prompt del sistema de Denty
│   └── types.ts           # Tipos compartidos
├── pages/
│   ├── index.astro        # Página principal
│   └── api/
│       ├── chat.ts        # Endpoint de chat (streaming)
│       └── transcribe.ts  # Endpoint de transcripción de audio
└── styles/
    └── global.css         # Sistema de diseño completo
```

> **Nota:** Denty orienta, pero no reemplaza al odontólogo. Siempre consulta a un profesional.
