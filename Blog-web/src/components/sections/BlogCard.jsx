import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import { ArrowIcon } from '../Icons'
export default function BlogCard({ p, i = 0 }) {
  return (
    <Reveal delay={i * 0.08}>
      <Link to={`/blog/${p.s}`} className="card group flex flex-col gap-3 p-7 h-full transition hover:border-amber hover:-translate-y-1">
        <span className="tag">{p.c}</span>
        <h3 className="text-[22px] font-semibold">{p.title}</h3>
        <p className="text-muted text-[15px]">{p.ex}</p>
        <div className="text-[13px] text-muted2">{p.d} · {p.t}</div>
        <span className="mt-auto pt-2 text-amber font-semibold text-sm inline-flex items-center gap-1.5">
          Read the post <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </Link>
    </Reveal>
  )
}
