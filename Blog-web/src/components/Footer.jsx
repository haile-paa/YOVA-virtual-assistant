import { Link } from 'react-router-dom'
export default function Footer() {
  return (
    <footer className="border-t border-line mt-10 py-10 text-muted text-sm">
      <div className="wrap flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 font-disp font-bold text-cream">
          <img src="/brand/icon.png" alt="" className="w-7 h-7 rounded-lg" /> YOVA
        </Link>
        <span>Your Virtual Assistant · Built by Haile · #BuildInPublic</span>
      </div>
    </footer>
  )
}
