"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Timer,
  MapPin,
  Motorcycle,
} from "@phosphor-icons/react";

const features = [
  {
    icon: Timer,
    title: "Dat mon nhanh chong",
    description: "Chon mon, xac nhan va theo doi don hang chi trong vai buoc don gian.",
  },
  {
    icon: MapPin,
    title: "An tai quan hoac mang di",
    description: "Linh hoat lua chon an tai cho, mang ve hoac giao hang tan nha.",
  },
  {
    icon: Motorcycle,
    title: "Giao hang tan noi",
    description: "Theo doi don hang thoi gian thuc, biet chinh xac khi nao mon an san sang.",
  },
];

export function FeaturesSection() {
  const reduce = useReducedMotion();

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] text-slate-900">
            Dat mon chua bao gio de hon
          </h2>
          <p className="mt-4 text-base text-slate-500 leading-relaxed max-w-[55ch]">
            Tu viec chon mon den khi nhan hang, moi thu deu duoc toi uu
            de ban co trai nghiem tot nhat.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative rounded-2xl bg-white p-7 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
                <feature.icon size={22} weight="duotone" className="text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
