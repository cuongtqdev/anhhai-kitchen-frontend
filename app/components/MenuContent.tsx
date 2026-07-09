"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShoppingCart, FunnelSimple } from "@phosphor-icons/react";
import { useCartStore } from "../lib/cart-store";
import type { MenuItem } from "../lib/types";
import { MenuItemCard } from "./MenuItemCard";
import { AddToCartModal } from "./AddToCartModal";

interface MenuContentProps {
  initialItems: MenuItem[];
}

export function MenuContent({ initialItems }: MenuContentProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Tat ca");
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const { openCart, totalItems } = useCartStore();
  const count = totalItems();
  const reduce = useReducedMotion();

  // Extract unique categories
  const categories = useMemo(() => {
    // Only display categories for MainDish (1) to keep the filter UI clean, or all available categories?
    // Usually menu has MainDish categories like "Mon chinh". The sides don't need to be in the filter.
    // Let's just collect all categories present in the items (which are all MainDish if we filter them).
    const mainDishes = initialItems.filter(i => i.menuItemCategory === 1);
    const cats = Array.from(new Set(mainDishes.map((item) => item.category)));
    return ["Tat ca", ...cats];
  }, [initialItems]);

  // Filter items by category (only show MainDish on the menu page, sides are added via detail page)
  const filteredItems = useMemo(() => {
    const mainDishes = initialItems.filter(i => i.menuItemCategory === 1);
    if (activeCategory === "Tat ca") return mainDishes;
    return mainDishes.filter((item) => item.category === activeCategory);
  }, [activeCategory, initialItems]);

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

      {/* Items list (Mobile) */}
      <div className="flex flex-col gap-4 sm:hidden">
        {filteredItems.map((item, i) => (
          <MenuItemCard 
            key={`mobile-${item.id}`} 
            item={item} 
            index={i}
            isMobile={true} 
            onAddClick={() => setSelectedItemForModal(item)}
          />
        ))}
      </div>

      {/* Items grid (Desktop/Tablet) */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {filteredItems.map((item, i) => (
          <MenuItemCard 
            key={`desktop-${item.id}`} 
            item={item} 
            index={i} 
            isMobile={false}
            onAddClick={() => setSelectedItemForModal(item)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="text-center py-20">
          <p className="text-sm text-slate-400">Khong co mon an nao trong danh muc nay.</p>
        </div>
      )}

      {/* Add To Cart Modal */}
      <AddToCartModal 
        isOpen={!!selectedItemForModal} 
        onClose={() => setSelectedItemForModal(null)} 
        item={selectedItemForModal} 
        allMenuItems={initialItems} 
      />
    </div>
  );
}

