"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Plus, Minus, ShoppingCart, ArrowLeft, Check } from "@phosphor-icons/react";
import Link from "next/link";
import { useCartStore } from "../../lib/cart-store";
import type { MenuItem } from "../../lib/types";

interface Props {
  item: MenuItem | null;
  optionalSides: MenuItem[];
  mandatorySides: MenuItem[];
}

export function MenuItemDetailClient({ item, optionalSides, mandatorySides }: Props) {
  const reduce = useReducedMotion();
  const { addItem, openCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [sideQuantities, setSideQuantities] = useState<Record<number, number>>({});
  const [note, setNote] = useState("");

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center flex flex-col items-center">
        <h1 className="text-3xl font-bold text-slate-900">Không tìm thấy món ăn</h1>
        <p className="mt-4 text-slate-600">Món ăn này có thể đã bị xoá hoặc không tồn tại.</p>
        <Link href="/thuc-don" className="mt-8 inline-flex items-center gap-2 text-amber-500 font-semibold hover:text-amber-600 bg-amber-50 px-6 py-3 rounded-full transition-colors">
          <ArrowLeft size={20} />
          Quay lại thực đơn
        </Link>
      </div>
    );
  }

  const updateSideQuantity = (sideId: number, delta: number) => {
    setSideQuantities(prev => {
      const current = prev[sideId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[sideId];
        return copy;
      }
      return { ...prev, [sideId]: next };
    });
  };

  const handleAddToCart = () => {
    const sides = [...optionalSides, ...mandatorySides];
    const selectedCartSideDishes = [];
    
    for (const side of sides) {
      const sideQty = sideQuantities[side.id] || 0;
      if (sideQty > 0) {
        selectedCartSideDishes.push({
          menuItem: side,
          quantity: sideQty
        });
      }
    }

    addItem(item, selectedCartSideDishes, note.trim() || undefined, quantity);
    
    openCart();
  };

  const totalPrice = 
    item.price * quantity + 
    [...optionalSides, ...mandatorySides].reduce((sum, side) => sum + side.price * (sideQuantities[side.id] || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/thuc-don" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft size={16} />
        Thực đơn
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Left: Image */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-square md:aspect-[4/3] lg:aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-sm"
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart size={48} weight="duotone" className="text-slate-300" />
            </div>
          )}
        </motion.div>

        {/* Right: Content & Form */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance">
              {item.name}
            </h1>
            <p className="mt-4 text-2xl font-bold text-amber-500 tabular-nums">
              {item.price.toLocaleString("vi-VN")}
              <span className="text-lg ml-1">đ</span>
            </p>
            {item.description && (
              <p className="mt-6 text-slate-600 leading-relaxed text-lg">
                {item.description}
              </p>
            )}
          </div>

          <hr className="my-8 border-slate-200" />

          {/* Options */}
          <div className="flex flex-col gap-8 flex-1">
            {/* Optional Sides */}
            {optionalSides.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                  Món ăn phụ (Tuỳ chọn)
                </h3>
                <div className="flex flex-col gap-3">
                  {optionalSides.map(side => {
                    const qty = sideQuantities[side.id] || 0;
                    return (
                      <div key={side.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                        <div>
                          <p className="font-medium text-slate-900">{side.name}</p>
                          <p className="text-sm text-slate-500">+{side.price.toLocaleString("vi-VN")}đ</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateSideQuantity(side.id, -1)}
                            disabled={qty === 0}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${qty > 0 ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-100 text-slate-400"}`}
                          >
                            <Minus size={14} weight="bold" />
                          </button>
                          <span className="w-4 text-center font-semibold text-slate-900">{qty}</span>
                          <button
                            type="button"
                            onClick={() => updateSideQuantity(side.id, 1)}
                            className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center hover:bg-amber-200 transition-colors"
                          >
                            <Plus size={14} weight="bold" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mandatory Sides */}
            {mandatorySides.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
                  Món đi kèm
                </h3>
                <div className="flex flex-col gap-3">
                  {mandatorySides.map(side => {
                    const qty = sideQuantities[side.id] || 0;
                    return (
                      <div key={side.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                        <div>
                          <p className="font-medium text-slate-900">{side.name}</p>
                          <p className="text-sm text-slate-500">+{side.price.toLocaleString("vi-VN")}đ</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateSideQuantity(side.id, -1)}
                            disabled={qty === 0}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${qty > 0 ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-100 text-slate-400"}`}
                          >
                            <Minus size={14} weight="bold" />
                          </button>
                          <span className="w-4 text-center font-semibold text-slate-900">{qty}</span>
                          <button
                            type="button"
                            onClick={() => updateSideQuantity(side.id, 1)}
                            className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center hover:bg-amber-200 transition-colors"
                          >
                            <Plus size={14} weight="bold" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Note */}
            <div className="space-y-4">
              <label htmlFor="note" className="block text-sm font-semibold uppercase tracking-wider text-slate-900">
                Ghi chú thêm
              </label>
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Nhiều nước mắm..."
                className="w-full p-4 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-shadow resize-none"
              />
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-12 sticky bottom-6 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white flex flex-col sm:flex-row gap-4">
            {/* Quantity */}
            <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all active:scale-95"
              >
                <Minus size={16} weight="bold" />
              </button>
              <span className="w-12 text-center font-bold text-slate-900 tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all active:scale-95"
              >
                <Plus size={16} weight="bold" />
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${
                item.isAvailable
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_20px_rgba(245,158,11,0.25)]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={20} weight="fill" />
              {item.isAvailable ? `Thêm ${totalPrice.toLocaleString("vi-VN")}đ` : "Tạm hết món"}
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
