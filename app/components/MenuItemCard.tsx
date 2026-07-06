"use client";

import { motion, useReducedMotion } from "motion/react";
import { Plus, ShoppingCart, Warning } from "@phosphor-icons/react";
import { useCartStore } from "../lib/cart-store";
import type { MenuItem } from "../lib/types";

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
}

export function MenuItemCard({ item, index }: MenuItemCardProps) {
  const { addItem, openCart } = useCartStore();
  const reduce = useReducedMotion();

  const handleAddToCart = () => {
    addItem(item);
    openCart();
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        delay: (index % 6) * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group"
    >
      <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.07)] transition-shadow duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/2] bg-slate-50">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart size={32} weight="duotone" className="text-slate-200" />
            </div>
          )}

          {/* Out of stock overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <Warning size={12} weight="bold" />
                Het hang
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {item.name}
          </h3>

          {item.description && (
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1">
              {item.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {item.price.toLocaleString("vi-VN")}
              <span className="text-sm font-semibold text-slate-400 ml-0.5">d</span>
            </span>

            {item.isAvailable ? (
              <button
                onClick={handleAddToCart}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.95]"
              >
                <Plus size={14} weight="bold" />
                <span>Them</span>
              </button>
            ) : (
              <span className="text-xs font-medium text-slate-400">Tam het</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
