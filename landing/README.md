## Actura Landing

A lightweight React + TypeScript + Tailwind site for Actura’s marketing, downloads, and docs.

### Tech Stack
- React 19, React Router
- TypeScript
- Tailwind CSS 4
- Vite 7
- Optional: Supabase JS (for simple forms/data)

### Requirements
- Node 18+
- pnpm or npm

### Setup
```bash
cd landing
npm install
npm run dev
```

### Scripts
- `npm run dev` – start local dev server
- `npm run build` – type-check and build production bundle
- `npm run preview` – preview the production build
- `npm run lint` – lint the codebase

### Environment Variables (optional)
Create `.env.local` in `landing/` if using Supabase:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Project Structure (partial)
- `src/pages/` – routes and sections
- `src/components/` – UI components
- `src/lib/` – utilities and clients (e.g., `supabaseClient.ts`)
- `public/` – static assets, installer, favicon

### Deployment
- Any static hosting (Netlify, Vercel, Cloudflare Pages, GitHub Pages)
- Build with `npm run build` and deploy the contents of `dist/`

### License
Proprietary – all rights reserved.
