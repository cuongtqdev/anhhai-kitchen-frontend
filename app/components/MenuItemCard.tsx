"use client";

import { motion, useReducedMotion } from "motion/react";
import { Plus, ShoppingCart, Warning } from "@phosphor-icons/react";
import Link from "next/link";
import { useCartStore } from "../lib/cart-store";
import type { MenuItem } from "../lib/types";

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  onAddClick?: () => void;
  isMobile?: boolean;
}

export function MenuItemCard({ item, index, onAddClick, isMobile }: MenuItemCardProps) {
  const { addItem, openCart } = useCartStore();
  const reduce = useReducedMotion();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddClick) {
      onAddClick();
    } else {
      addItem(item);
      openCart();
    }
  };

  const containerVariants = {
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: {
      duration: 0.6,
      delay: (index % 6) * 0.06,
      ease: [0.16, 1, 0.3, 1] as any,
    }
  };

  if (isMobile) {
    return (
      <motion.div {...containerVariants} className="group">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-amber-200 transition-colors duration-300 overflow-hidden flex items-stretch p-3 sm:p-4 gap-3 sm:gap-5">
          {/* Image */}
          <Link href={`/thuc-don/${item.id}`} className="relative overflow-hidden w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-xl bg-slate-50 block">
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
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
                <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full">
                  <Warning size={12} weight="bold" />
                  Hết
                </span>
              </div>
            )}
          </Link>

          {/* Content */}
          <div className="flex flex-col flex-1 min-w-0 py-1">
            <Link href={`/thuc-don/${item.id}`} className="block w-fit hover:opacity-80 transition-opacity">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                {item.name}
              </h3>
            </Link>

            {item.description && (
              <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-1 sm:line-clamp-2">
                {item.description}
              </p>
            )}

            <div className="mt-auto flex items-end justify-between pt-2">
              <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                {item.price.toLocaleString("vi-VN")}
                <span className="text-xs sm:text-sm font-semibold text-slate-400 ml-0.5">đ</span>
              </span>

              {item.isAvailable ? (
                <button
                  onClick={handleAddToCart}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.95] shadow-sm"
                >
                  <Plus size={16} weight="bold" />
                </button>
              ) : (
                <span className="text-xs font-medium text-slate-400">Tạm hết</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...containerVariants} className="group h-full">
      <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.07)] transition-shadow duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden h-full flex flex-col">
        {/* Image */}
        <Link href={`/thuc-don/${item.id}`} className="relative overflow-hidden aspect-[3/2] bg-slate-50 block">
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
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <Warning size={12} weight="bold" />
                Hết
              </span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <Link href={`/thuc-don/${item.id}`} className="block w-fit hover:opacity-80 transition-opacity">
            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
              {item.name}
            </h3>
          </Link>

          {item.description && (
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1">
              {item.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {item.price.toLocaleString("vi-VN")}
              <span className="text-sm font-semibold text-slate-400 ml-0.5">đ</span>
            </span>

            {item.isAvailable ? (
              <button
                onClick={handleAddToCart}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.95]"
              >
                <Plus size={14} weight="bold" />
                <span>Thêm</span>
              </button>
            ) : (
              <span className="text-xs font-medium text-slate-400">Tạm hết</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
