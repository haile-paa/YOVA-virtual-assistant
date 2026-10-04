import { Link } from 'react-router-dom'
import Logo from './Logo'
import { site } from '../config'

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-6">Your virtual assistant for schedule, notes, tasks and ideas.</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-display text-base font-semibold text-cream">Explore</p>
          <Link className="block hover:text-cream" to="/#features">What it does</Link>
          <Link className="block hover:text-cream" to="/#screens">Screens</Link>
          <Link className="block hover:text-cream" to="/blog">Blog</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-display text-base font-semibold text-cream">Contact</p>
          <a className="block hover:text-cream" href={`mailto:${site.support.email}`}>{site.support.email}</a>
          <a className="block hover:text-cream" href={site.apk.url} download>Download APK</a>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs md:px-8">
          © {new Date().getFullYear()} YOVA. Built by{' '}
          <a className="underline underline-offset-2 hover:text-cream" href={site.developer.portfolio} target="_blank" rel="noreferrer">{site.developer.name}</a>.
        </p>
      </div>
    </footer>
  )
}
