# YOVA Web (React + Tailwind + Three.js)

Marketing + blog site for the YOVA app.

**Stack:** React 18, Vite, Tailwind CSS, Framer Motion, Three.js via @react-three/fiber and @react-three/drei, React Router.

## Run
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # outputs dist/
    npm run preview

## What's animated / 3D
- Hero: three real 3D phones (your screenshots as textures) that float and follow the mouse, with a ring and sparkles.
- Showcase: scroll-pinned 3D phone that spins and swaps screens as you scroll through features.
- Framer Motion: word-by-word headline, scroll reveals, count-up stats, tilting phone frames, reading progress bar, mobile menu.

## Edit content
- `src/data/content.js` : blog posts (`blogPosts`) and feature copy. Add a post by adding an object.
- `public/screens/`     : screenshots (home, dash, tasks, chat, more). Replace with higher-res files anytime.
- `public/brand/icon.png` : replace with your real app icon.
- `src/components/sections/DownloadBand.jsx` : set your download / Expo / store link.

## Deploy
Netlify, Vercel or Cloudflare Pages. `public/_redirects` handles SPA routing on Netlify.
