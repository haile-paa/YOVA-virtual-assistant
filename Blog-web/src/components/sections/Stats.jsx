import CountUp from '../CountUp'
import Reveal from '../Reveal'
const stats = [[35, '+', 'brainstorm ideas to browse'], [3, '', 'tabs: Home, YoVA and More'], [1, '', 'dashboard for your whole day']]
export default function Stats() {
  return (
    <section className="py-16">
      <div className="wrap grid sm:grid-cols-3 gap-5">
        {stats.map(([n, s, l], i) => (
          <Reveal key={l} delay={i * 0.08} className="card p-7">
            <div className="font-disp text-5xl font-bold text-amber"><CountUp to={n} suffix={s} /></div>
            <p className="text-muted mt-2">{l}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
