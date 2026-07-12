"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShoppingCart, FunnelSimple, MagnifyingGlass, CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { useCartStore } from "../lib/cart-store";
import type { MenuItem } from "../lib/types";
import { MenuItemCard } from "./MenuItemCard";
import { AddToCartModal } from "./AddToCartModal";

interface MenuContentProps {
  initialItems: MenuItem[];
}

export function MenuContent({ initialItems }: MenuContentProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Tat ca");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const ITEMS_PER_PAGE = 12;
  const { openCart, totalItems } = useCartStore();
  const count = totalItems();
  const reduce = useReducedMotion();

  // Extract unique categories
  const categories = useMemo(() => {
    // Include Main Dish (1) and Optional Side (2)
    const orderableItems = initialItems.filter(i => i.menuItemCategory === 1 || i.menuItemCategory === 2);
    const cats = Array.from(new Set(orderableItems.map((item) => item.category)));
    return ["Tat ca", ...cats];
  }, [initialItems]);

  // Filter items by category and search
  const filteredItems = useMemo(() => {
    const orderableItems = initialItems.filter(i => i.menuItemCategory === 1 || i.menuItemCategory === 2);
    let items = orderableItems;
    
    if (activeCategory !== "Tat ca") {
      items = items.filter((item) => item.category === activeCategory);
    }
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(q));
    }
    
    return items;
  }, [activeCategory, searchQuery, initialItems]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

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

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        {/* Category filter pills */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-2 pb-1 flex-1"
        >
          <FunnelSimple size={18} weight="duotone" className="text-slate-400 shrink-0 mr-1 hidden sm:block" />
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

        {/* Search Bar */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full md:w-64 shrink-0"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlass size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm tên món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500 block pl-10 pr-10 py-2.5 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </motion.div>
      </div>

      {/* Items list (Mobile) */}
      <div className="flex flex-col gap-4 sm:hidden">
        {paginatedItems.map((item, i) => (
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
        {paginatedItems.map((item, i) => (
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
          <p className="text-sm text-slate-400">Không có món ăn nào phù hợp với tìm kiếm.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:opacity-50 transition-colors hover:bg-slate-50"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          
          <div className="flex items-center gap-1 mx-2 overflow-x-auto scrollbar-none">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    currentPage === page 
                      ? "bg-slate-900 text-white" 
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:opacity-50 transition-colors hover:bg-slate-50"
          >
            <CaretRight size={16} weight="bold" />
          </button>
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

