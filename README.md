## Actura – AI meeting copilot for transcripts, actions, and sync

### Inspiration
Are you tired of wasting hours writing meeting minutes, turning them into action items, and organising them into kanban boards? Actura cuts the noise, skips the overhead, and lets you get back to the part of your work you actually enjoy.

### What it does
With consent, Actura records your meetings and produces transcripts. It extracts actionable tasks and decisions, then syncs them to your workspace tools. An always‑on‑top overlay offers quick controls and context, and a global shortcut toggles visibility. The app captures tasks offline and syncs automatically when you reconnect.

### Technologies used
- **Desktop app**: Tauri v2 (Rust), `tauri`, `tauri-plugin-global-shortcut`, `tauri-plugin-opener`, system tray/menu, global shortcuts
- **Audio**: `cpal` for capture, `hound` for WAV; browser `MediaRecorder` with WebAudio mix (mic + system)
- **Frontend (app overlay)**: React 19, Vite, Tailwind 4, Lucide icons
- **Backend/workflows**: n8n (Docker) for transcription + task extraction and syncing to tools
- **Storage/Auth/Data**: Supabase (`@supabase/supabase-js`) for user profiles, metadata, and recordings storage
- **Landing site**: React + TypeScript + Tailwind + Vite
- **Packaging**: Windows installer (distributed on the landing site)

### Team
- [Bonsen Wakjira](https://github.com/BonsenW)
- [Zahir Hassan](https://github.com/WalrusPSD)
- [Jia Wen Ooi](https://github.com/jiawen001)
- [Anika Ojha](https://github.com/anika-ojha)

---

## Getting started

### Prerequisites
- Node 18+ and pnpm/npm
- Rust toolchain (stable) and Tauri prerequisites for your OS
- Docker (for n8n workflows)
- Supabase project (URL + anon key)

### Environment variables
Create a `.env` (or `.env.local`) in `application/` and `landing/` with:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
For Docker n8n, set an encryption key in your shell or `.env` in repo root:
```
N8N_ENCRYPTION_KEY=replace-with-a-strong-secret
```

### Run the desktop app (Tauri)
```bash
cd application
npm install
npm run dev
# In another terminal, run the Tauri dev build if needed
npm run tauri dev
```

### Run the landing site
```bash
cd landing
npm install
npm run dev
```

### Start n8n (transcription/task workflows)
```bash
docker compose up -d
# n8n will be available at http://localhost:5678
```

> Note: Example n8n flows were previously stored under `n8n/` and may be re-imported into your n8n instance as needed.

---

## Project structure
- `application/`: Tauri v2 desktop app
  - `src/overlay.jsx`: React overlay and recording UI (+ Supabase upload)
  - `src/components/recorder.jsx`: simple invoke-driven recorder
  - `src/lib/supabaseClient.js`: Supabase client
  - `src-tauri/`: Rust sources (`tauri`, tray, global shortcuts, audio libs)
- `landing/`: React + TypeScript + Tailwind marketing site
- `docker-compose.yml`: n8n for workflow automation

## Scripts (high-level)
- App: `npm run dev`, `npm run build`, `npm run preview`, `npm run tauri`
- Landing: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`

## License
Proprietary – all rights reserved unless otherwise noted.
