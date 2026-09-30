import { lazy, Suspense } from "react";
import { appDownload } from "../../data/content";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
const HeroScene = lazy(() => import("../HeroScene"));

const words = "Your day, organized. With an assistant built in.".split(" ");
export default function Hero() {
  return (
    <section className='pt-10 lg:pt-14 pb-6'>
      <div className='wrap grid lg:grid-cols-[1fr_1.1fr] items-center gap-4'>
        <div>
          <h1 className='text-[clamp(40px,6vw,68px)] font-bold leading-[1.05]'>
            {words.map((w, i) => (
              <motion.span
                key={i}
                className='inline-block mr-[0.25em]'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.08 * i,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className='text-muted text-[19px] max-w-[46ch] mt-6 mb-8'
          >
            YOVA puts your schedule, notes, tasks and an AI assistant on one
            calm dashboard. This is the build log.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className='flex flex-wrap gap-3'
          >
            <a
              href={appDownload.file}
              download={appDownload.filename}
              className='btn btn-primary'
            >
              See the app
            </a>
            <Link to='/blog' className='btn btn-ghost'>
              Read the blog
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.9 }}
        >
          <Suspense fallback={<div className='h-[440px] lg:h-[560px]' />}>
            <HeroScene className='h-[440px] lg:h-[560px]' />
          </Suspense>
        </motion.div>
      </div>
    </section>
  );
}
