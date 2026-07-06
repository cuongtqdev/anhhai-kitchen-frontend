"use client";

import { motion, AnimatePresence } from "motion/react";
import { useCartStore } from "../lib/cart-store";
import { X, Minus, Plus, Trash, ShoppingCart } from "@phosphor-icons/react";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalItems, totalPrice } =
    useCartStore();

  const count = totalItems();
  const price = totalPrice();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-slate-900/30 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.08)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <ShoppingCart size={22} weight="duotone" className="text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">
                  Gio hang
                  {count > 0 && (
                    <span className="ml-2 text-sm font-semibold text-slate-400">
                      ({count} mon)
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors duration-300"
                aria-label="Dong gio hang"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <ShoppingCart size={28} weight="duotone" className="text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Gio hang trong</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[24ch]">
                    Hay them mon an tu thuc don de bat dau.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.li
                        key={item.menuItem.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                        className="flex items-start gap-4 bg-slate-50/60 rounded-xl p-4"
                      >
                        {/* Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {item.menuItem.imageUrl ? (
                            <img
                              src={item.menuItem.imageUrl}
                              alt={item.menuItem.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ShoppingCart size={20} />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {item.menuItem.name}
                          </p>
                          <p className="text-sm font-semibold text-amber-600 mt-0.5">
                            {item.menuItem.price.toLocaleString("vi-VN")}d
                          </p>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 mt-2.5">
                            <button
                              onClick={() =>
                                updateQuantity(item.menuItem.id, item.quantity - 1)
                              }
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors active:scale-[0.94]"
                              aria-label="Giam so luong"
                            >
                              <Minus size={12} weight="bold" />
                            </button>
                            <span className="text-sm font-bold text-slate-900 w-6 text-center tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.menuItem.id, item.quantity + 1)
                              }
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors active:scale-[0.94]"
                              aria-label="Tang so luong"
                            >
                              <Plus size={12} weight="bold" />
                            </button>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.menuItem.id)}
                          className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shrink-0"
                          aria-label="Xoa mon"
                        >
                          <Trash size={14} weight="bold" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-100 px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Tam tinh</span>
                  <span className="text-lg font-bold text-slate-900 tabular-nums">
                    {price.toLocaleString("vi-VN")}d
                  </span>
                </div>
                <Link
                  href="/dat-mon"
                  onClick={closeCart}
                  className="block w-full bg-slate-900 hover:bg-slate-800 text-white text-center font-semibold py-3.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                >
                  Dat mon ({count} mon)
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
