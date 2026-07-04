"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";

export function CTASection() {
  const reduce = useReducedMotion();

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[2rem] bg-slate-900 overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative px-8 py-16 md:px-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] text-white leading-tight">
                San sang thuong thuc?
              </h2>
              <p className="mt-4 text-base text-slate-400 leading-relaxed">
                Dat mon ngay de trai nghiem com ga Anh Hai Lua.
                Nhanh chong, tien loi, giao tan noi.
              </p>
            </div>
            <Link
              href="/thuc-don"
              className="group inline-flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-7 py-3.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] shrink-0"
            >
              <span>Xem thuc don</span>
              <span className="w-7 h-7 rounded-full bg-slate-900/10 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                <ArrowRight size={14} weight="bold" />
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
