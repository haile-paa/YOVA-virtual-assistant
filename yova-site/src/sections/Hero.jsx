import { lazy, Suspense } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import DownloadButtons from '../components/DownloadButtons'
import { hasWebGL, useInView, useWindowWidth } from '../hooks'

const OrbScene = lazy(() => import('../components/three/OrbScene'))

const WORDS = ['Ask.', 'Plan.', 'Remember.']
const word = {
  hidden: { y: '110%', rotate: 4 },
  show: (i) => ({ y: 0, rotate: 0, transition: { delay: 0.15 + i * 0.16, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } }),
}

export default function Hero() {
  const calm = useReducedMotion()
  const w = useWindowWidth()
  const [ref, inView] = useInView()

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-espresso">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(60%_60%_at_75%_45%,#5a4026_0%,#241c16_70%)]" />
      <div className="absolute inset-0 -z-10">
        {hasWebGL() ? (
          <Suspense fallback={null}>
            <OrbScene calm={!!calm} narrow={w < 900} active={inView} />
          </Suspense>
        ) : (
          <img src="/logo.png" alt="" className="absolute right-[14%] top-1/2 h-64 w-64 -translate-y-1/2 rounded-[3rem]" />
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-gradient-to-r from-espresso via-espresso/55 to-transparent max-md:bg-gradient-to-b max-md:from-espresso max-md:via-espresso/45 max-md:to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-28 md:px-8">
        <div className="max-w-2xl">
          <h1 className="font-display text-6xl font-extrabold leading-[0.95] text-cream sm:text-7xl md:text-8xl">
            {WORDS.map((wd, i) => (
              <span key={wd} className="block overflow-hidden pb-[0.08em]">
                <motion.span custom={i} variants={word} initial="hidden" animate="show" className={`inline-block ${i === 2 ? 'text-amber' : ''}`}>
                  {wd}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95, duration: 0.6 }} className="mt-7 max-w-xl text-lg leading-8 text-cream/80">
            YOVA is a virtual assistant for Android. Chat with it, keep your schedule, notes and tasks in one place, and get a fresh idea when you are stuck.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6 }}>
            <DownloadButtons className="mt-8" />
            <Link to="/#screens" className="mt-5 inline-block text-sm font-semibold text-cream/80 underline decoration-amber decoration-2 underline-offset-4 hover:text-cream">
              See the app
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
