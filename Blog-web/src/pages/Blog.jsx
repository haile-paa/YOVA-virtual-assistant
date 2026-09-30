import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import PhoneFrame from '../components/PhoneFrame'
import BlogCard from '../components/sections/BlogCard'
import { blogPosts, screen } from '../data/content'

const cats = ['All', ...new Set(blogPosts.map((p) => p.c))]
export default function Blog() {
  const [cat, setCat] = useState('All')
  const list = blogPosts.filter((p) => cat === 'All' || p.c === cat)
  const [first, ...rest] = list
  return (
    <>
      <section className="pt-16 pb-6">
        <div className="wrap">
          <Reveal>
            <h1 className="text-[clamp(36px,5vw,58px)] font-bold">Notes on building YOVA</h1>
            <p className="text-muted text-lg max-w-[54ch] mt-4">Build logs on design decisions, features and what I learn while making a personal assistant app.</p>
          </Reveal>
          <div className="flex flex-wrap gap-2 mt-8">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-sm font-medium border transition ${cat === c ? 'bg-amber text-ink border-amber' : 'border-line2 text-muted hover:text-cream'}`}>{c}</button>
            ))}
          </div>
        </div>
      </section>
      <section className="pb-16 pt-6">
        <div className="wrap grid md:grid-cols-2 gap-5">
          {first && (
            <Reveal className="md:col-span-2">
              <Link to={`/blog/${first.s}`} className="card flex flex-col md:flex-row items-center gap-8 p-8 bg-gradient-to-br from-bg2 to-bg1 hover:border-amber transition">
                <div className="flex flex-col gap-3 flex-1">
                  <span className="tag">Latest · {first.c}</span>
                  <h2 className="text-[clamp(26px,3.4vw,38px)] font-semibold">{first.title}</h2>
                  <p className="text-muted">{first.ex}</p>
                  <div className="text-[13px] text-muted2">{first.d} · {first.t}</div>
                </div>
                <PhoneFrame src={screen(first.img)} size={170} />
              </Link>
            </Reveal>
          )}
          {rest.map((p, i) => <BlogCard key={p.s} p={p} i={i} />)}
        </div>
      </section>
    </>
  )
}
