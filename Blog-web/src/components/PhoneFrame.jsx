import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
// 2D phone with mouse-tilt (used in blog posts and the marquee)
export default function PhoneFrame({ src, alt = 'YOVA screen', size = 220, tilt = true, className = '' }) {
  const ref = useRef(null)
  const mx = useMotionValue(0.5), my = useMotionValue(0.5)
  const rX = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 150, damping: 18 })
  const rY = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 150, damping: 18 })
  const move = (e) => {
    if (!tilt || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width); my.set((e.clientY - r.top) / r.height)
  }
  return (
    <motion.div ref={ref} onMouseMove={move} onMouseLeave={() => { mx.set(0.5); my.set(0.5) }}
      style={{ width: size, rotateX: tilt ? rX : 0, rotateY: tilt ? rY : 0, transformPerspective: 900 }}
      className={`phone-frame shrink-0 ${className}`}>
      <img src={src} alt={alt} className="w-full block" loading="lazy" />
    </motion.div>
  )
}
