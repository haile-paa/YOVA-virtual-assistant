import { Download } from 'lucide-react'
import { site } from '../config'

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
    <path d="M4 2.6v18.8a1 1 0 0 0 1.5.9L21 12 5.5 1.7A1 1 0 0 0 4 2.6Z" />
  </svg>
)

export default function DownloadButtons({ className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={site.apk.url}
        download
        className="group inline-flex items-center gap-2.5 rounded-full bg-amber px-6 py-3.5 font-bold text-espresso shadow-[0_12px_30px_-8px_rgba(246,196,83,0.6)] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
      >
        <Download className="h-5 w-5 transition group-hover:translate-y-0.5" />
        Download APK
      </a>
      {site.playStoreUrl && (
        <a
          href={site.playStoreUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 rounded-full border border-cream/30 px-6 py-3.5 font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-cream/10"
        >
          <PlayIcon />
          Get it on Google Play
        </a>
      )}
    </div>
  )
}
