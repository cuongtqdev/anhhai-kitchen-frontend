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
    <>
      {/* MOBILE LAYOUT (Immersive Parallax) */}
      <div className="relative min-h-[100dvh] bg-slate-50 lg:hidden">
      
      {/* Floating Top Header (Transparent, fixed over image) */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
        <Link href="/thuc-don" className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto hover:bg-black/40 transition-colors shadow-sm">
          <ArrowLeft size={20} weight="bold" />
        </Link>
        <button onClick={openCart} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto hover:bg-black/40 transition-colors shadow-sm relative">
          <ShoppingCart size={20} weight="fill" />
        </button>
      </div>

      {/* Fixed Background Image (Parallax/Sticky) */}
      <div className="fixed top-0 left-0 w-full h-[45vh] sm:h-[55vh] z-0 bg-slate-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart size={48} weight="duotone" className="text-slate-300" />
          </div>
        )}
        {/* Gradient overlay to make back button pop */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"></div>
      </div>

      {/* Scrollable Content Overlay */}
      <div className="relative z-10 w-full mt-[40vh] sm:mt-[50vh] bg-white rounded-t-3xl sm:rounded-t-[3rem] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] min-h-[60vh] flex flex-col">
        
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-10 flex-1">
          {/* Handle (Visual cue for dragging/sliding on mobile) */}
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight text-balance">
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
            
            {item.stockCount > 0 && (
              <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-sm font-medium border border-amber-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Chỉ còn lại {item.stockCount} phần
              </div>
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
                <div className="flex flex-col gap-6">
                  {optionalSides.map(side => {
                    const qty = sideQuantities[side.id] || 0;
                    return (
                      <div 
                        key={side.id} 
                        className="group flex gap-4 cursor-pointer"
                        onClick={() => {
                          if (qty === 0) updateSideQuantity(side.id, 1);
                        }}
                      >
                        {/* Image */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl bg-slate-100 overflow-hidden relative">
                          {side.imageUrl ? (
                            <img src={side.imageUrl} alt={side.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart size={24} className="text-slate-300" />
                            </div>
                          )}
                        </div>

                        {/* Info & Controls */}
                        <div className="flex-1 min-w-0 flex flex-col py-1">
                          <p className="text-base sm:text-lg font-medium text-slate-900 line-clamp-2 leading-tight">{side.name}</p>
                          {side.description && (
                            <p className="text-sm text-slate-500 line-clamp-1 mt-1">{side.description}</p>
                          )}
                          
                          <div className="mt-auto flex items-end justify-between">
                            <p className="font-semibold text-slate-900 text-sm sm:text-base">+{side.price.toLocaleString("vi-VN")}đ</p>
                            
                            {qty > 0 ? (
                              <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => updateSideQuantity(side.id, -1)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center bg-white border border-slate-300 text-slate-600 active:scale-95 transition-transform"
                                >
                                  <Minus size={14} weight="bold" />
                                </button>
                                <span className="font-medium text-slate-900 text-sm sm:text-base min-w-[16px] text-center">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateSideQuantity(side.id, 1)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center bg-amber-500 text-white active:scale-95 transition-transform"
                                >
                                  <Plus size={14} weight="bold" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                type="button"
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center bg-amber-500 text-white active:scale-95 transition-transform"
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            )}
                          </div>
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
                <div className="flex flex-col gap-6">
                  {mandatorySides.map(side => {
                    const qty = sideQuantities[side.id] || 0;
                    return (
                      <div 
                        key={side.id} 
                        className="group flex gap-4 cursor-pointer"
                        onClick={() => {
                          if (qty === 0) updateSideQuantity(side.id, 1);
                        }}
                      >
                        {/* Image */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl bg-slate-100 overflow-hidden relative">
                          {side.imageUrl ? (
                            <img src={side.imageUrl} alt={side.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart size={24} className="text-slate-300" />
                            </div>
                          )}
                        </div>

                        {/* Info & Controls */}
                        <div className="flex-1 min-w-0 flex flex-col py-1">
                          <p className="text-base sm:text-lg font-medium text-slate-900 line-clamp-2 leading-tight">{side.name}</p>
                          {side.description && (
                            <p className="text-sm text-slate-500 line-clamp-1 mt-1">{side.description}</p>
                          )}
                          
                          <div className="mt-auto flex items-end justify-between">
                            <p className="font-semibold text-slate-900 text-sm sm:text-base">+{side.price.toLocaleString("vi-VN")}đ</p>
                            
                            {qty > 0 ? (
                              <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => updateSideQuantity(side.id, -1)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center bg-white border border-slate-300 text-slate-600 active:scale-95 transition-transform"
                                >
                                  <Minus size={14} weight="bold" />
                                </button>
                                <span className="font-medium text-slate-900 text-sm sm:text-base min-w-[16px] text-center">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateSideQuantity(side.id, 1)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center bg-amber-500 text-white active:scale-95 transition-transform"
                                >
                                  <Plus size={14} weight="bold" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                type="button"
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center bg-amber-500 text-white active:scale-95 transition-transform"
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            )}
                          </div>
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

          {/* Bottom Action Bar Spacer */}
          <div className="h-[100px] w-full mt-8"></div>
        </div>
        
        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 sm:p-6 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto w-full flex gap-3 sm:gap-4">
            {/* Quantity */}
            <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all active:scale-95"
              >
                <Minus size={16} weight="bold" />
              </button>
              <span className="w-10 text-center font-bold text-slate-900 tabular-nums">
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
              disabled={!item.isAvailable || item.stockCount === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-4 rounded-xl font-bold text-base sm:text-lg transition-all active:scale-[0.98] ${
                (item.isAvailable && item.stockCount !== 0)
                  ? "bg-slate-900 hover:bg-slate-800 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={20} weight="fill" />
              <span className="truncate">{(item.isAvailable && item.stockCount !== 0) ? `Thêm ${totalPrice.toLocaleString("vi-VN")}đ` : "Tạm hết món"}</span>
            </button>
          </div>
        </div>

      </div>
      </div>

      {/* DESKTOP LAYOUT (Split Grid) */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 py-12">
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
                        <div key={`desktop-opt-${side.id}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
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
                        <div key={`desktop-man-${side.id}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
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
                <label htmlFor="note-desktop" className="block text-sm font-semibold uppercase tracking-wider text-slate-900">
                  Ghi chú thêm
                </label>
                <textarea
                  id="note-desktop"
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
                disabled={!item.isAvailable || item.stockCount === 0}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${
                  (item.isAvailable && item.stockCount !== 0)
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_20px_rgba(245,158,11,0.25)]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <ShoppingCart size={20} weight="fill" />
                {(item.isAvailable && item.stockCount !== 0) ? `Thêm ${totalPrice.toLocaleString("vi-VN")}đ` : "Tạm hết món"}
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </>
  );
}
