import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MenuIcon, CloseIcon } from "./Icons";
import { appDownload } from "../data/content";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/#showcase", label: "Features" },
  { to: "/blog", label: "Blog" },
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className='sticky top-0 z-50 backdrop-blur-md bg-bg/80 border-b border-line'>
        <div className='wrap flex items-center justify-between py-3.5'>
          <Link
            to='/'
            className='flex items-center gap-2.5 font-disp font-bold text-[18px]'
          >
            <img
              src='/brand/icon.png'
              alt=''
              className='w-[34px] h-[34px] rounded-[10px]'
            />
            YOVA
          </Link>
          <nav className='hidden md:flex items-center gap-8 text-[14.5px] font-medium text-muted'>
            {links.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  isActive && !l.to.includes("#")
                    ? "text-amber"
                    : "hover:text-cream transition"
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className='hidden md:block'>
            <a
              href={appDownload.file}
              download={appDownload.filename}
              className='btn btn-primary btn-sm'
            >
              Get the app
            </a>
          </div>
          <button
            className='md:hidden'
            aria-label='Open menu'
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[60] bg-bg flex flex-col px-7 py-6'
          >
            <button
              className='self-end mb-8'
              aria-label='Close menu'
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>
            {links.map((l, i) => (
              <motion.div
                key={l.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
              >
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className='block font-disp text-3xl font-semibold py-3 border-b border-line'
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <a
              href={appDownload.file}
              download={appDownload.filename}
              onClick={() => setOpen(false)}
              className='btn btn-primary mt-8 self-start'
            >
              Get the app
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
