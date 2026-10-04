import { lazy, Suspense } from 'react'
import { useReducedMotion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import DownloadButtons from '../components/DownloadButtons'
import { site } from '../config'
import { hasWebGL, useInView } from '../hooks'

const PhoneScene = lazy(() => import('../components/three/PhoneScene'))

export default function DownloadCta() {
  const calm = useReducedMotion()
  const [ref, inView] = useInView()
  const meta = [`Version ${site.apk.version}`, site.apk.size, site.apk.minAndroid].filter(Boolean)
  const apkAbsolute = new URL(site.apk.url, site.url).href

  return (
    <section id="download" ref={ref} className="relative scroll-mt-16 overflow-hidden bg-espresso py-24 text-cream md:py-32">
      <div className="absolute right-0 top-0 h-[34rem] w-[34rem] rounded-full bg-amber/15 blur-[130px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-8 lg:grid-cols-2">
        <div>
          <h2 className="max-w-lg font-display text-4xl font-extrabold leading-tight md:text-6xl">Get YOVA on your phone</h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-cream/75">Download the Android app straight from this page.</p>
          <DownloadButtons className="mt-8" />
          {meta.length > 0 && <p className="mt-4 text-sm text-cream/55">Android, {meta.join(', ')}</p>}
          <div className="mt-10 flex items-center gap-5 rounded-3xl bg-cream/[0.06] p-4 sm:w-fit sm:pr-8">
            <div className="rounded-2xl bg-white p-2.5">
              <QRCodeSVG value={apkAbsolute} size={104} fgColor="#241c16" bgColor="#ffffff" level="M" />
            </div>
            <p className="max-w-[11rem] text-sm leading-6 text-cream/75">Scan with your phone to download</p>
          </div>
        </div>
        <div className="relative h-[30rem] md:h-[40rem]">
          {hasWebGL() ? (
            <Suspense fallback={null}>
              <PhoneScene calm={!!calm} active={inView} />
            </Suspense>
          ) : null}
        </div>
      </div>
    </section>
  )
}
