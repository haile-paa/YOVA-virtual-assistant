import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { RotateCcw, Send } from 'lucide-react'
import { useInView } from '../hooks'

// Real conversation from the app.
const SCRIPT = [
  { from: 'You', text: 'Introduce yourself' },
  { from: 'YoVA', text: "I'm YoVA, your virtual assistant - here to help with any questions or tasks you've got, so feel free to ask me anything. I'll do my best to give you quick and helpful answers." },
  { from: 'You', text: 'What is virtual assistant' },
  { from: 'YoVA', text: 'A virtual assistant is basically a computer program that helps with tasks and answers questions, like me! I can assist with things like scheduling, reminders, and finding info online.' },
]

export default function ChatDemo() {
  const calm = useReducedMotion()
  const [ref, inView] = useInView({ threshold: 0.35 })
  const [started, setStarted] = useState(false)
  const [shown, setShown] = useState(0)
  const [typed, setTyped] = useState(0)

  useEffect(() => { if (inView) setStarted(true) }, [inView])
  useEffect(() => { if (calm) { setStarted(true); setShown(SCRIPT.length) } }, [calm])

  useEffect(() => {
    if (!started || shown >= SCRIPT.length) return
    const m = SCRIPT[shown]
    let id
    if (m.from === 'You') id = setTimeout(() => { setShown(shown + 1); setTyped(0) }, 750)
    else if (typed < m.text.length) id = setTimeout(() => setTyped(typed + 2), 16)
    else id = setTimeout(() => { setShown(shown + 1); setTyped(0) }, 900)
    return () => clearTimeout(id)
  }, [started, shown, typed])

  const current = shown < SCRIPT.length ? SCRIPT[shown] : null
  const done = shown >= SCRIPT.length

  return (
    <section id="chat" ref={ref} className="relative scroll-mt-16 overflow-hidden bg-espresso py-24 text-cream md:py-32">
      <div className="absolute -left-40 top-10 h-[30rem] w-[30rem] rounded-full bg-amber/15 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="font-display text-4xl font-extrabold leading-tight md:text-6xl">Just ask. YoVA answers in plain language.</h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-cream/75">
            Type a question the way you would say it. This is a real conversation from the app, replayed here.
          </p>
          <button
            onClick={() => { setShown(0); setTyped(0); setStarted(true) }}
            disabled={!done}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-cream/30 px-5 py-2.5 text-sm font-semibold transition enabled:hover:bg-cream/10 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" /> Replay
          </button>
        </div>

        <div className="rounded-[2rem] bg-bark p-4 shadow-2xl ring-1 ring-cream/10 sm:p-6" aria-live="polite">
          <div className="min-h-[27rem] space-y-4">
            {SCRIPT.slice(0, shown).map((m, i) => <Bubble key={i} m={m} />)}
            {current?.from === 'YoVA' && <Bubble m={{ ...current, text: current.text.slice(0, typed) }} typing />}
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-full bg-espresso/60 py-2 pl-5 pr-2 text-cream/50">
            <span className="flex-1 text-sm">Message YoVA...</span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-amber text-espresso"><Send className="h-4 w-4" /></span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Bubble({ m, typing = false }) {
  const you = m.from === 'You'
  return (
    <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${you ? 'ml-auto bg-cream/10' : 'bg-espresso/70 ring-1 ring-cream/10'}`}>
      <p className="text-xs font-semibold text-amber">{m.from}</p>
      <p className={`mt-1 leading-7 ${typing ? 'caret' : ''}`}>{m.text}</p>
    </div>
  )
}
