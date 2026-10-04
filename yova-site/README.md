# YOVA website

Landing page + blog for the YOVA virtual assistant app.
React 19, Vite, Tailwind CSS 4, Three.js (react-three-fiber + drei), Framer Motion, React Router.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
```

## Before you launch

1. **Add your APK**: copy it to `public/downloads/yova.apk`
   (or host it elsewhere, e.g. a GitHub Release, and paste the URL into `src/config.js`).
2. **Edit `src/config.js`**: site URL (used by the QR code), version/size, Google Play link (the Play button appears only when set), support email.
3. **Replace the logo**: `public/logo.png` and `public/favicon.png` are a placeholder "Y". Drop in your real logo.
4. **Retake screenshots if you like**: there are 5, `public/shots/y1.webp` to `y5.webp`.

## Where things are

| Want to change | Edit |
| --- | --- |
| Screenshot captions and the "A look inside" tabs | `src/data/shots.js` |
| Blog posts | `src/data/posts.js` (add an object at the top of the array) |
| Chat replay text | `SCRIPT` in `src/sections/ChatDemo.jsx` |
| Colors and fonts | `@theme` block in `src/index.css` |
| The 3D hero (orb with floating cards) | `src/components/three/OrbScene.jsx` |
| The 3D phone in the download section | `src/components/three/PhoneScene.jsx` |
| Phone frame | `src/components/PhoneFrame.jsx` |

## Deploy

Vercel: import the repo, framework "Vite". `vercel.json` handles page refreshes on `/blog/...`.
Netlify: `public/_redirects` is included.
A single static file on Vercel is limited to 100 MB, so host a very large APK on a GitHub Release.
