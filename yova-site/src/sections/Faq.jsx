import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'

const faqs = [
  ['What can YOVA do?', 'Chat with you as a virtual assistant, and keep your schedule, notes, tasks and brainstorm ideas in one place, with one search bar across them.'],
  ['How do I install the APK?', 'Tap Download APK, open the downloaded file and allow installs from your browser if Android asks. Our blog has a step-by-step install guide.'],
  ['How do I add an event?', 'On the home screen, fill in the Schedule card with a title, a day and a time, then tap Add Event.'],
  ['Can I edit or delete a note?', 'Yes. Tap the note to open it, then choose Edit or Delete.'],
  ['Where are my settings?', 'In the More tab: Profile, Notifications, Settings, Help & Support and Logout, plus quick switches for notifications and sound.'],
  ['Is it safe to install an APK?', 'Install it only from this website or from the official store listing. Android will ask for a one-time permission, which you can turn off again afterwards.'],
]

export default function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="mx-auto grid max-w-5xl gap-12 px-5 md:px-8 lg:grid-cols-[0.7fr_1.3fr]">
        <h2 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">Questions, answered</h2>
        <div className="divide-y divide-espresso/10">
          {faqs.map(([q, a], i) => (
            <div key={q}>
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-6 py-5 text-left text-lg font-semibold">
                {q}
                <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber/40 text-espresso"><Plus className="h-4 w-4" /></motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="max-w-xl pb-6 leading-7 text-espresso/70">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
