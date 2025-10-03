## Actura Desktop (Tauri)

Tauri v2 desktop app that provides an always-on-top overlay for meeting recording and quick controls. Captures audio, uploads recordings, and integrates with n8n workflows and Supabase.

### Tech Stack
- Tauri v2 (Rust + WebView)
- React 19 + Vite 7 + Tailwind 4 (overlay UI)
- Audio: `cpal` (capture), `hound` (WAV), WebAudio + MediaRecorder (mix mic + system)
- Supabase JS for auth/storage/metadata
- Global shortcuts, tray/menu via Tauri plugins

### Requirements
- Node 18+
- Rust toolchain (stable) and platform prerequisites for Tauri
- Docker (optional, for n8n workflows)

### Environment
Create `.env.local` in `application/`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Run (development)
```bash
cd application
npm install
npm run dev            # start Vite
npm run tauri dev      # run Tauri app
```

### Build (desktop bundles)
```bash
cd application
npm run build
npm run tauri build
```
Bundles are configured in `src-tauri/tauri.conf.json`.

### Overlay & Recording
- Overlay is defined under `src/overlay.jsx` and sized/configured in `src-tauri/tauri.conf.json`.
- Recording uses mic and (optionally) system audio via display capture; mixed with WebAudio and recorded with `MediaRecorder` when supported.
- On stop, artifacts can be uploaded to Supabase Storage (bucket: `recordings`).

### Workflows (n8n)
An optional n8n instance (see repo-level `docker-compose.yml`) can run transcription and task extraction flows and sync results to tools.
```bash
# from repo root
docker compose up -d
# n8n available at http://localhost:5678
```

### Troubleshooting
- Windows screen/audio capture permissions: ensure you share system audio in the picker.
- If overlay resizes oddly: it temporarily expands to avoid permission UI clipping, then restores.
- Supabase upload issues: verify env vars and bucket permissions; see `src/lib/supabaseClient.js`.
- Rust audio backend differences: latency/format can vary by OS; prefer testing early on Windows.

### Scripts
- `npm run dev` – Vite dev server
- `npm run tauri` – Tauri CLI
- `npm run build` – build web assets
- `npm run preview` – preview built assets

### License
Proprietary – all rights reserved.
