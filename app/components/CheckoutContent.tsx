"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash,
  MapPin,
  Phone,
  Storefront,
  Package,
  Motorcycle,
  NotePencil,
  CircleNotch,
  CheckCircle,
  Warning,
  ShoppingCart,
} from "@phosphor-icons/react";
import { useCartStore } from "../lib/cart-store";
import { DiningMode } from "../lib/types";

const diningModes = [
  {
    value: DiningMode.DineIn,
    label: "An tai quan",
    description: "Ngoi tai quan thuong thuc",
    icon: Storefront,
  },
  {
    value: DiningMode.TakeAway,
    label: "Mang di",
    description: "Goi mang ve, khong can cho",
    icon: Package,
  },
  {
    value: DiningMode.Delivery,
    label: "Giao hang",
    description: "Giao tan noi trong khu vuc",
    icon: Motorcycle,
  },
];

export function CheckoutContent() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { items, updateQuantity, removeItem, totalPrice, clearCart } =
    useCartStore();

  const [diningMode, setDiningMode] = useState<DiningMode>(DiningMode.DineIn);
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = totalPrice();
  const isEmpty = items.length === 0;

  const canSubmit =
    !isEmpty &&
    !isSubmitting &&
    customerPhone.trim().length >= 9 &&
    (diningMode !== DiningMode.DineIn || tableNumber.trim().length > 0) &&
    (diningMode !== DiningMode.Delivery || deliveryAddress.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Replace with actual API call when backend is connected
      // const payload = {
      //   items: items.map((i) => ({ menuItemId: i.menuItem.id, quantity: i.quantity })),
      //   diningMode,
      //   tableNumber: diningMode === DiningMode.DineIn ? tableNumber.trim() : null,
      //   deliveryAddress: diningMode === DiningMode.Delivery ? deliveryAddress.trim() : null,
      //   customerPhone: customerPhone.trim(),
      //   note: note.trim() || null,
      // };
      // const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      // const data = await res.json();

      // Mock: simulate API delay and generate a fake tracking token
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const mockToken = crypto.randomUUID();

      // Save tracking token and order summary to localStorage
      const orderSummary = {
        trackingToken: mockToken,
        items: items.map((i) => ({
          name: i.menuItem.name,
          quantity: i.quantity,
          unitPrice: i.menuItem.price,
          subtotal: i.menuItem.price * i.quantity,
        })),
        totalAmount: price,
        diningMode,
        tableNumber: diningMode === DiningMode.DineIn ? tableNumber.trim() : null,
        deliveryAddress: diningMode === DiningMode.Delivery ? deliveryAddress.trim() : null,
        customerPhone: customerPhone.trim(),
        note: note.trim() || null,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("anhhai_tracking_token", mockToken);
      localStorage.setItem("anhhai_last_order", JSON.stringify(orderSummary));

      clearCart();
      router.push("/theo-doi-don");
    } catch {
      setError("Co loi xay ra. Vui long thu lai.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <motion.div
        initial={reduce ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href="/thuc-don"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-300 mb-8"
        >
          <ArrowLeft size={16} weight="bold" />
          Quay lai thuc don
        </Link>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-slate-900">
          Xac nhan don hang
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Kiem tra gio hang va dien thong tin de dat mon.
        </p>
      </motion.div>

      {isEmpty ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 text-center py-20 bg-white rounded-2xl border border-slate-100"
        >
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={28} weight="duotone" className="text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-500">Gio hang trong</p>
          <p className="text-xs text-slate-400 mt-1">
            Hay them mon an tu thuc don truoc.
          </p>
          <Link
            href="/thuc-don"
            className="inline-flex items-center gap-2 mt-6 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors active:scale-[0.97]"
          >
            Xem thuc don
          </Link>
        </motion.div>
      ) : (
        <div className="mt-10 space-y-8">
          {/* Section 1: Cart items */}
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Mon da chon ({items.length})
              </h2>
            </div>
            <ul className="divide-y divide-slate-50">
              {items.map((item) => (
                <li
                  key={item.menuItem.id}
                  className="flex items-center gap-4 px-6 py-4"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                    {item.menuItem.imageUrl ? (
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <ShoppingCart size={18} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {item.menuItem.name}
                    </p>
                    <p className="text-sm text-amber-600 font-semibold mt-0.5">
                      {item.menuItem.price.toLocaleString("vi-VN")}d
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.menuItem.id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors active:scale-[0.94]"
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
                      className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors active:scale-[0.94]"
                    >
                      <Plus size={12} weight="bold" />
                    </button>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {(item.menuItem.price * item.quantity).toLocaleString("vi-VN")}d
                    </span>
                    <button
                      onClick={() => removeItem(item.menuItem.id)}
                      className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash size={14} weight="bold" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Section 2: Dining mode */}
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl border border-slate-100 p-6"
          >
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Hinh thuc nhan mon
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {diningModes.map((mode) => {
                const isActive = diningMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    onClick={() => setDiningMode(mode.value)}
                    className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-left ${
                      isActive
                        ? "border-amber-500 bg-amber-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <mode.icon
                      size={24}
                      weight="duotone"
                      className={isActive ? "text-amber-600" : "text-slate-400"}
                    />
                    <span
                      className={`mt-2.5 text-sm font-bold ${
                        isActive ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {mode.label}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      {mode.description}
                    </span>
                    {isActive && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle
                          size={20}
                          weight="fill"
                          className="text-amber-500"
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {diningMode === DiningMode.DineIn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="mt-4"
              >
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  So ban
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="VD: 5, A2, B3..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300"
                />
              </motion.div>
            )}

            {diningMode === DiningMode.Delivery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="mt-4"
              >
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <MapPin
                    size={14}
                    weight="bold"
                    className="inline mr-1.5 text-amber-500"
                  />
                  Dia chi giao hang
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Nhap dia chi giao hang day du..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300"
                />
              </motion.div>
            )}
          </motion.section>

          {/* Section 3: Contact info */}
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-slate-900">
              Thong tin lien he
            </h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <Phone
                  size={14}
                  weight="bold"
                  className="inline mr-1.5 text-amber-500"
                />
                So dien thoai
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0901 234 567"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <NotePencil
                  size={14}
                  weight="bold"
                  className="inline mr-1.5 text-amber-500"
                />
                Ghi chu (tuy chon)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Khong hanh, it ot, giao gio trua..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-300 resize-none"
              />
            </div>
          </motion.section>

          {/* Section 4: Summary + Submit */}
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl border border-slate-100 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Tam tinh</span>
              <span className="text-sm text-slate-700 tabular-nums">
                {price.toLocaleString("vi-VN")}d
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Phi giao hang</span>
              <span className="text-sm text-slate-700">
                {diningMode === DiningMode.Delivery ? "Lien he" : "Mien phi"}
              </span>
            </div>
            <div className="border-t border-slate-100 my-4" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">Tong cong</span>
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {price.toLocaleString("vi-VN")}d
              </span>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
                <Warning size={16} weight="bold" />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full mt-6 py-3.5 rounded-full text-base font-bold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-center gap-2 ${
                canSubmit
                  ? "bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.98] shadow-sm"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <CircleNotch size={18} weight="bold" className="animate-spin" />
                  Dang xu ly...
                </>
              ) : (
                "Xac nhan dat mon"
              )}
            </button>

            {!canSubmit && !isSubmitting && !isEmpty && (
              <p className="text-xs text-slate-400 text-center mt-3">
                Vui long nhap so dien thoai
                {diningMode === DiningMode.DineIn && " va so ban"}
                {diningMode === DiningMode.Delivery && " va dia chi giao hang"}
                .
              </p>
            )}
          </motion.section>
        </div>
      )}
    </div>
  );
}
