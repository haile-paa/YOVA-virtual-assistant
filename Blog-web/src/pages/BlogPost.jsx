import { Link, useParams } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import PhoneFrame from '../components/PhoneFrame'
import BlogCard from '../components/sections/BlogCard'
import { blogPosts, screen } from '../data/content'

export default function BlogPost() {
  const { slug } = useParams()
  const { scrollYProgress } = useScroll()
  const w = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })
  const i = blogPosts.findIndex((p) => p.s === slug)
  if (i < 0) return <div className="wrap py-24"><h1 className="text-4xl font-bold">Post not found</h1><Link to="/blog" className="btn btn-primary mt-6">Back to the blog</Link></div>
  const p = blogPosts[i], next = blogPosts[(i + 1) % blogPosts.length]
  return (
    <>
      <motion.div style={{ scaleX: w }} className="fixed top-0 left-0 right-0 h-[3px] bg-amber origin-left z-[70]" />
      <article className="max-w-[700px] mx-auto px-6 pt-14 pb-10 relative z-10">
        <Link to="/blog" className="text-amber font-semibold text-sm">← All posts</Link>
        <div className="mt-6"><span className="tag">{p.c}</span></div>
        <h1 className="text-[clamp(34px,5vw,50px)] font-bold mt-4">{p.title}</h1>
        <div className="flex items-center gap-3 mt-6 text-sm text-muted">
          <span className="w-9 h-9 rounded-full bg-amber text-ink font-bold grid place-items-center">H</span>
          Haile · {p.d} · {p.t}
        </div>
        <div className="flex justify-center my-9 py-9 card"><PhoneFrame src={screen(p.img)} size={230} /></div>
        {p.b.map((x, k) =>
          x[0] === 'p' ? <p key={k} className="text-[18px] leading-[1.75] mb-5 text-cream/90">{x[1]}</p>
          : x[0] === 'h' ? <h2 key={k} className="text-[26px] font-semibold mt-10 mb-3">{x[1]}</h2>
          : <ul key={k} className="list-disc pl-6 mb-6 text-[17.5px] space-y-2 marker:text-amber">{x[1].map((l) => <li key={l}>{l}</li>)}</ul>
        )}
        <div className="mt-14"><div className="text-sm text-muted mb-3">Read next</div><BlogCard p={next} /></div>
      </article>
    </>
  )
}
