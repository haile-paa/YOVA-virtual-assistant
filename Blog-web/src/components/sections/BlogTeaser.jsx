import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import BlogCard from './BlogCard'
import { blogPosts } from '../../data/content'
export default function BlogTeaser() {
  return (
    <section className="py-16">
      <div className="wrap">
        <Reveal>
          <h2 className="text-[clamp(28px,4vw,42px)] font-semibold">From the blog</h2>
          <p className="text-muted mt-3 max-w-[52ch]">Build notes on design choices, features and lessons learned.</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5 mt-9">
          {blogPosts.slice(0, 3).map((p, i) => <BlogCard key={p.s} p={p} i={i} />)}
        </div>
        <Link to="/blog" className="btn btn-ghost mt-8">All posts</Link>
      </div>
    </section>
  )
}
