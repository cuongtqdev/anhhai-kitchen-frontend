"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-50/60 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/60 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase">
                Dang phuc vu
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.04em] leading-[1.08] text-slate-900">
              Com ga truyen thong,{" "}
              <span className="text-amber-500">huong vi</span> hien dai
            </h1>

            <p className="mt-5 text-base md:text-lg text-slate-500 leading-relaxed max-w-[52ch]">
              Dat mon truc tuyen, theo doi don hang thoi gian thuc.
              Giao hang tan noi hoac ghe quan thuong thuc.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/thuc-don"
                className="group inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
              >
                <span>Xem thuc don</span>
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                  <ArrowRight size={14} weight="bold" />
                </span>
              </Link>
              <Link
                href="/dat-mon"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-semibold px-6 py-3 rounded-full border border-slate-200 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] shadow-sm"
              >
                Dat mon ngay
              </Link>
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Double-bezel card (from high-end-visual-design skill) */}
            <div className="rounded-[2rem] bg-slate-100/50 p-2 ring-1 ring-slate-200/40">
              <div className="rounded-[calc(2rem-0.5rem)] overflow-hidden bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <img
                  src="https://picsum.photos/seed/anhhai-chicken-rice-hero/800/600"
                  alt="Com ga Anh Hai Lua thom ngon"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
            </div>

            {/* Floating info pill */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-4 left-6 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-slate-100 px-5 py-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <span className="text-lg">🍗</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Com Ga Xoi Mo</p>
                <p className="text-xs text-slate-500">Best seller</p>
              </div>
              <span className="text-sm font-bold text-amber-600 ml-2">45.000d</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
