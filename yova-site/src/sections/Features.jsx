import { motion } from 'framer-motion'
import { CalendarDays, CheckSquare, Lightbulb, MessageCircle, Search, StickyNote } from 'lucide-react'

const tiles = [
  { Icon: MessageCircle, title: 'Ask YoVA anything', text: 'Chat with your assistant for answers and help. Start a new chat whenever you like, and look back through your history.', cls: 'bg-bark text-cream md:col-span-2', icon: 'bg-amber text-espresso' },
  { Icon: CalendarDays, title: 'Schedule', text: 'Add an event with a title, a day and a time. Today is always at the top of your home screen.', cls: 'bg-white', icon: 'bg-espresso text-amber' },
  { Icon: StickyNote, title: 'Notes', text: 'Write a title and your thoughts. Tap a note to read it, edit it or delete it.', cls: 'bg-clay text-cream', icon: 'bg-amber text-espresso' },
  { Icon: CheckSquare, title: 'Tasks', text: 'A simple checklist that tells you how many tasks you have finished.', cls: 'bg-white', icon: 'bg-espresso text-amber' },
  { Icon: Lightbulb, title: 'Brainstorm ideas', text: 'Idea cards with a category, a title and a short description. Tap refresh whenever you want a new one to think about.', cls: 'bg-amber text-espresso md:col-span-2', icon: 'bg-espresso text-amber' },
  { Icon: Search, title: 'One search bar', text: 'Search across your tasks, notes and events from the home screen.', cls: 'bg-bark text-cream md:col-span-3 lg:col-span-1', icon: 'bg-amber text-espresso' },
]

export default function Features() {
  return (
    <section id="features" className="scroll-mt-16 bg-cream py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="max-w-2xl font-display text-4xl font-extrabold leading-tight md:text-6xl">Everything you keep track of, in one assistant</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {tiles.map(({ Icon, title, text, cls, icon }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
              whileHover={{ y: -6 }}
              className={`group rounded-[2rem] p-7 shadow-sm md:p-8 ${cls}`}
            >
              <span className={`grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${icon}`}>
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="mt-6 text-2xl font-bold">{title}</h3>
              <p className="mt-2 max-w-md leading-7 opacity-80">{text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
