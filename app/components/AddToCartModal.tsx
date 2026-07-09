"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, ShoppingCart } from "@phosphor-icons/react";
import { useCartStore } from "../lib/cart-store";
import type { MenuItem } from "../lib/types";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  allMenuItems: MenuItem[];
}

export function AddToCartModal({ isOpen, onClose, item, allMenuItems }: AddToCartModalProps) {
  const { addItem, openCart } = useCartStore();
  
  const [quantity, setQuantity] = useState(1);
  const [sideQuantities, setSideQuantities] = useState<Record<number, number>>({});
  const [note, setNote] = useState("");

  // Reset state when a new item is opened
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSideQuantities({});
      setNote("");
    }
  }, [isOpen, item]);

  if (!item) return null;

  const optionalSides = allMenuItems.filter(m => m.menuItemCategory === 2 && m.id !== item.id && m.isAvailable);
  const mandatorySides = allMenuItems.filter(m => m.menuItemCategory === 3 && m.id !== item.id && m.isAvailable);

  const updateSideQuantity = (sideId: number, delta: number) => {
    setSideQuantities(prev => {
      const current = prev[sideId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [sideId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [sideId]: next };
    });
  };

  const totalPrice = 
    item.price * quantity + 
    [...optionalSides, ...mandatorySides].reduce((sum, side) => sum + side.price * (sideQuantities[side.id] || 0), 0);

  const handleAddToCart = () => {
    const selectedSides = [...optionalSides, ...mandatorySides]
      .filter(side => sideQuantities[side.id] > 0)
      .map(side => ({
        menuItem: side,
        quantity: sideQuantities[side.id]
      }));

    addItem(
      item,
      selectedSides,
      note.trim() || undefined,
      quantity
    );
    
    onClose();
    openCart();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl sm:rounded-3xl sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-xl max-h-[90vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0 relative">
              <h2 className="text-lg font-bold text-slate-900 mx-auto">Thêm món mới</h2>
              <button 
                onClick={onClose}
                className="absolute right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
              {/* Main Item Summary */}
              <div className="flex gap-4">
                <div className="w-24 h-24 shrink-0 rounded-xl bg-slate-100 overflow-hidden relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart size={24} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-slate-500 line-clamp-1 mt-1">{item.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <p className="font-bold text-slate-900">{item.price.toLocaleString("vi-VN")}đ</p>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 h-7 rounded flex items-center justify-center border border-slate-300 text-slate-600 active:scale-95 transition-transform"
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <span className="font-medium text-slate-900 min-w-[16px] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-7 h-7 rounded flex items-center justify-center bg-amber-500 text-white active:scale-95 transition-transform"
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-2 w-[calc(100%+2rem)] -ml-4 sm:w-[calc(100%+3rem)] sm:-ml-6 bg-slate-50"></div>

              {/* Optional Sides */}
              {optionalSides.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-slate-100 px-3 py-1.5 -mx-3 rounded-md">
                    <h4 className="text-sm font-semibold text-slate-600">Món ăn phụ (Tuỳ chọn)</h4>
                  </div>
                  <div className="flex flex-col gap-5">
                    {optionalSides.map(side => {
                      const qty = sideQuantities[side.id] || 0;
                      return (
                        <div key={side.id} className="flex gap-4 items-center">
                           <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-medium text-slate-900">{side.name}</p>
                              <p className="text-sm font-semibold text-slate-500">+{side.price.toLocaleString("vi-VN")}đ</p>
                           </div>
                           {qty > 0 ? (
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => updateSideQuantity(side.id, -1)}
                                  className="w-7 h-7 rounded flex items-center justify-center border border-slate-300 text-slate-600 active:scale-95 transition-transform"
                                >
                                  <Minus size={14} weight="bold" />
                                </button>
                                <span className="font-medium text-slate-900 min-w-[16px] text-center">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateSideQuantity(side.id, 1)}
                                  className="w-7 h-7 rounded flex items-center justify-center bg-amber-500 text-white active:scale-95 transition-transform"
                                >
                                  <Plus size={14} weight="bold" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                type="button"
                                onClick={() => updateSideQuantity(side.id, 1)}
                                className="w-7 h-7 rounded flex items-center justify-center border border-slate-300 text-slate-600 hover:border-amber-500 hover:text-amber-500 active:scale-95 transition-all"
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mandatory Sides */}
              {mandatorySides.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-slate-100 px-3 py-1.5 -mx-3 rounded-md">
                    <h4 className="text-sm font-semibold text-slate-600">Món đi kèm</h4>
                  </div>
                  <div className="flex flex-col gap-5">
                    {mandatorySides.map(side => {
                      const qty = sideQuantities[side.id] || 0;
                      return (
                        <div key={side.id} className="flex gap-4 items-center">
                           <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-medium text-slate-900">{side.name}</p>
                              <p className="text-sm font-semibold text-slate-500">+{side.price.toLocaleString("vi-VN")}đ</p>
                           </div>
                           {qty > 0 ? (
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => updateSideQuantity(side.id, -1)}
                                  className="w-7 h-7 rounded flex items-center justify-center border border-slate-300 text-slate-600 active:scale-95 transition-transform"
                                >
                                  <Minus size={14} weight="bold" />
                                </button>
                                <span className="font-medium text-slate-900 min-w-[16px] text-center">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateSideQuantity(side.id, 1)}
                                  className="w-7 h-7 rounded flex items-center justify-center bg-amber-500 text-white active:scale-95 transition-transform"
                                >
                                  <Plus size={14} weight="bold" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                type="button"
                                onClick={() => updateSideQuantity(side.id, 1)}
                                className="w-7 h-7 rounded flex items-center justify-center border border-slate-300 text-slate-600 hover:border-amber-500 hover:text-amber-500 active:scale-95 transition-all"
                              >
                                <Plus size={14} weight="bold" />
                              </button>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Note */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-slate-900">Ghi chú cho quán</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Nhiều nước mắm..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none text-sm"
                />
              </div>

              {/* Spacer for sticky button on mobile */}
              <div className="h-4"></div>
            </div>

            {/* Bottom Action */}
            <div className="p-4 border-t border-slate-100 bg-white sm:rounded-b-3xl pb-safe">
              <button
                onClick={handleAddToCart}
                disabled={!item.isAvailable || item.stockCount === 0}
                className={`w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98] shadow-sm ${
                  (item.isAvailable && item.stockCount !== 0)
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Thêm vào giỏ hàng - {totalPrice.toLocaleString("vi-VN")}đ
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
