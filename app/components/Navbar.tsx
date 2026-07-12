"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { label: "Trang chu", href: "/" },
  { label: "Thuc don", href: "/thuc-don" },
  { label: "Dat mon", href: "/dat-mon" },
  { label: "Don hang cua ban", href: "/theo-doi-don" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">
        <div className="relative rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] px-4 py-2.5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
              AH
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight hidden sm:block">
              Anh Hai Lua
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100/80 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-2">
            <Link
              href="/thuc-don"
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] hidden sm:block"
            >
              Dat mon ngay
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
            </button>
          </div>
        </div>
        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden md:hidden"
            >
              <div className="p-2 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-sm font-semibold text-slate-700 hover:text-amber-600 hover:bg-slate-50/80 rounded-xl transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-slate-100 my-1 mx-2" />
                <Link
                  href="/thuc-don"
                  onClick={() => setOpen(false)}
                  className="mx-2 my-1 bg-slate-900 text-white text-sm font-bold px-4 py-3 rounded-xl text-center hover:bg-slate-800 transition-colors"
                >
                  Dat mon ngay
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
