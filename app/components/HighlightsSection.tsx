"use client";

import { motion, useReducedMotion } from "motion/react";

const highlights = [
  {
    image: "https://picsum.photos/seed/anhhai-comga-dui/600/400",
    title: "Com Ga Xoi Mo",
    subtitle: "Ga ta chon loc, xoi mo vang gion, com dau thom ngat",
  },
  {
    image: "https://picsum.photos/seed/anhhai-comga-luoc/600/400",
    title: "Com Ga Luoc",
    subtitle: "Ga luoc da vang, thit mem ngot, cham muoi tieu chanh",
  },
  {
    image: "https://picsum.photos/seed/anhhai-comga-quay/600/400",
    title: "Com Ga Quay",
    subtitle: "Ga quay lu, da gion rum, thit thom dam da",
  },
];

export function HighlightsSection() {
  const reduce = useReducedMotion();

  return (
    <section className="py-24 lg:py-32 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] text-slate-900">
            Mon an noi bat
          </h2>
          <p className="mt-4 text-base text-slate-500 leading-relaxed">
            Nhung mon com ga dac trung lam nen thuong hieu Anh Hai Lua.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group cursor-pointer"
            >
              {/* Double-bezel pattern */}
              <div className="rounded-[1.5rem] bg-slate-100/60 p-1.5 ring-1 ring-slate-200/30">
                <div className="rounded-[calc(1.5rem-6px)] overflow-hidden bg-white">
                  <div className="overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full aspect-[3/2] object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
