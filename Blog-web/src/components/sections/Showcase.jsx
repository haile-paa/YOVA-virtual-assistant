import { lazy, Suspense, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { features } from '../../data/content'
const ShowcaseScene = lazy(() => import('../ShowcaseScene'))

// Scroll-driven 3D: the phone spins and swaps screens as you scroll through the features.
export default function Showcase() {
  const ref = useRef(null)
  const [i, setI] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => setI(Math.min(features.length - 1, Math.max(0, Math.floor(v * features.length)))))
  const f = features[i]
  return (
    <section id="showcase" ref={ref} style={{ height: `${features.length * 85}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex items-center pt-14">
        <div className="wrap w-full grid md:grid-cols-2 gap-4 items-center">
          <div className="min-h-[300px]">
            <h2 className="text-[clamp(28px,3.6vw,42px)] font-semibold mb-6 max-w-[16ch]">Scroll through YOVA</h2>
            <AnimatePresence mode="wait">
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <h3 className="text-2xl font-semibold text-amber">{f.title}</h3>
                <p className="text-muted mt-3 mb-5 max-w-[44ch]">{f.desc}</p>
                <ul className="grid gap-2.5">
                  {f.list.map((x) => (
                    <li key={x} className="relative pl-6 text-[15px] before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-amber">{x}</li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-2 mt-8" aria-hidden="true">
              {features.map((_, k) => (
                <span key={k} className={`h-1.5 rounded-full transition-all duration-300 ${k === i ? 'w-8 bg-amber' : 'w-3 bg-line2'}`} />
              ))}
            </div>
          </div>
          <Suspense fallback={<div className="h-[460px] md:h-[600px]" />}>
            <ShowcaseScene index={i} />
          </Suspense>
        </div>
      </div>
    </section>
  )
}
