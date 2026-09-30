import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'
export default function CountUp({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 1.4, ease: 'easeOut', onUpdate: (n) => setV(Math.round(n)) })
    return () => c.stop()
  }, [inView, to])
  return <span ref={ref}>{v}{suffix}</span>
}
