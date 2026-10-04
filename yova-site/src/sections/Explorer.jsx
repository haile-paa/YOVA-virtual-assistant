import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PhoneFrame from '../components/PhoneFrame'
import { features } from '../data/shots'

export default function Explorer() {
  const [i, setI] = useState(0)
  const f = features[i]

  return (
    <section id="screens" className="relative scroll-mt-16 overflow-hidden bg-sand py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="max-w-2xl font-display text-4xl font-extrabold leading-tight md:text-6xl">A look inside the app</h2>
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_auto_1fr] lg:gap-16">
          <div className="order-2 lg:order-1 lg:col-span-1">
            <ul className="space-y-2" role="tablist" aria-label="App screens">
              {features.slice(0, 3).map((it, k) => <Tab key={it.id} it={it} active={i === k} onClick={() => setI(k)} />)}
            </ul>
          </div>

          <div className="relative order-1 mx-auto w-[15rem] sm:w-[17rem] lg:order-2">
            <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-amber/50 blur-[70px]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: 40, rotateY: -28 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -40, rotateY: 28 }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                style={{ transformPerspective: 1200 }}
              >
                <PhoneFrame id={f.id} alt={f.title} tilt eager />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="order-3 lg:col-span-1">
            <ul className="space-y-2" role="tablist" aria-label="More app screens">
              {features.slice(3).map((it, k) => <Tab key={it.id} it={it} active={i === k + 3} onClick={() => setI(k + 3)} />)}
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-14 min-h-24 max-w-xl text-center" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <h3 className="text-2xl font-bold">{f.title}</h3>
              <p className="mt-2 leading-7 text-espresso/70">{f.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Tab({ it, active, onClick }) {
  return (
    <li>
      <button
        role="tab"
        aria-selected={active}
        onClick={onClick}
        className={`w-full rounded-2xl px-5 py-4 text-left text-lg font-bold transition ${active ? 'bg-espresso text-amber shadow-lg' : 'text-espresso/70 hover:bg-white/60'}`}
      >
        {it.title}
      </button>
    </li>
  )
}
