"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShoppingCart, FunnelSimple } from "@phosphor-icons/react";
import { useCartStore } from "../lib/cart-store";
import { mockMenuItems } from "../lib/mock-data";
import { MenuItemCard } from "./MenuItemCard";

export function MenuContent() {
  const [activeCategory, setActiveCategory] = useState<string>("Tat ca");
  const { openCart, totalItems } = useCartStore();
  const count = totalItems();
  const reduce = useReducedMotion();

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(mockMenuItems.map((item) => item.category)));
    return ["Tat ca", ...cats];
  }, []);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (activeCategory === "Tat ca") return mockMenuItems;
    return mockMenuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-slate-900">
            Thuc don
          </h1>
          <p className="mt-2 text-base text-slate-500 leading-relaxed">
            Chon mon ban yeu thich va them vao gio hang.
          </p>
        </motion.div>

        {/* Cart button (mobile + desktop) */}
        <motion.button
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          onClick={openCart}
          className="relative inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] self-start sm:self-auto"
        >
          <ShoppingCart size={20} weight="duotone" className="text-slate-700" />
          <span className="text-sm font-semibold text-slate-700">Gio hang</span>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute -top-2 -right-2 w-5.5 h-5.5 bg-amber-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center min-w-[22px] min-h-[22px]"
            >
              {count}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Category filter pills */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2 mb-10 overflow-x-auto pb-1 scrollbar-none"
      >
        <FunnelSimple size={18} weight="duotone" className="text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              activeCategory === cat
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item, i) => (
          <MenuItemCard key={item.id} item={item} index={i} />
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-20">
          <p className="text-sm text-slate-400">Khong co mon an nao trong danh muc nay.</p>
        </div>
      )}
    </div>
  );
}
