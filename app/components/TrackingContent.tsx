"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ClockCountdown,
  CookingPot,
  CheckCircle,
  Package,
  XCircle,
  Phone,
  MapPin,
  Storefront,
  Motorcycle,
  ArrowLeft,
  Receipt,
} from "@phosphor-icons/react";
import { OrderStatus, DiningMode } from "../lib/types";

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface LocalOrder {
  trackingToken: string;
  items: OrderItem[];
  totalAmount: number;
  diningMode: DiningMode;
  tableNumber: string | null;
  deliveryAddress: string | null;
  customerPhone: string | null;
  note: string | null;
  createdAt: string;
}

const statusSteps = [
  {
    status: OrderStatus.Pending,
    label: "Cho xu ly",
    description: "Don hang da duoc tiep nhan",
    icon: ClockCountdown,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    status: OrderStatus.Preparing,
    label: "Dang chuan bi",
    description: "Bep dang lam mon cho ban",
    icon: CookingPot,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    status: OrderStatus.Ready,
    label: "San sang",
    description: "Mon an da san sang",
    icon: Package,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    status: OrderStatus.Completed,
    label: "Hoan thanh",
    description: "Don hang da hoan thanh",
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
];

const diningModeLabels = {
  [DiningMode.DineIn]: { label: "An tai quan", icon: Storefront },
  [DiningMode.TakeAway]: { label: "Mang di", icon: Package },
  [DiningMode.Delivery]: { label: "Giao hang", icon: Motorcycle },
};

export function TrackingContent() {
  const reduce = useReducedMotion();
  const [order, setOrder] = useState<LocalOrder | null>(null);
  const [noOrder, setNoOrder] = useState(false);

  // Mock: simulate a current status (in real app, this would come from API polling)
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(OrderStatus.Pending);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("anhhai_last_order");
    if (stored) {
      try {
        setOrder(JSON.parse(stored));
      } catch {
        setNoOrder(true);
      }
    } else {
      setNoOrder(true);
    }
  }, []);

  // Mock: auto-advance status for demo purposes
  useEffect(() => {
    if (!order || isCancelled) return;

    const timers = [
      setTimeout(() => setCurrentStatus(OrderStatus.Preparing), 5000),
      setTimeout(() => setCurrentStatus(OrderStatus.Ready), 12000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [order, isCancelled]);

  const currentStepIndex = statusSteps.findIndex((s) => s.status === currentStatus);
  const activeStep = statusSteps[currentStepIndex] ?? statusSteps[0];
  const diningInfo = order ? diningModeLabels[order.diningMode] : null;

  if (noOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center py-24 bg-white rounded-2xl border border-slate-100"
        >
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Receipt size={28} weight="duotone" className="text-slate-300" />
          </div>
          <p className="text-base font-bold text-slate-900">Khong tim thay don hang</p>
          <p className="text-sm text-slate-500 mt-1 max-w-[30ch] mx-auto">
            Ban chua co don hang nao. Hay dat mon truoc nhe!
          </p>
          <Link
            href="/thuc-don"
            className="inline-flex items-center gap-2 mt-6 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors active:scale-[0.97]"
          >
            Xem thuc don
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <motion.div
        initial={reduce ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-300 mb-8"
        >
          <ArrowLeft size={16} weight="bold" />
          Trang chu
        </Link>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-slate-900">
          Theo doi don hang
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Ma don: <span className="font-mono text-xs text-slate-400">{order.trackingToken.slice(0, 8).toUpperCase()}</span>
        </p>
      </motion.div>

      <div className="mt-10 space-y-6">
        {/* Status stepper card */}
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl border border-slate-100 p-6"
        >
          {isCancelled ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <XCircle size={28} weight="fill" className="text-red-500" />
              </div>
              <p className="text-base font-bold text-slate-900">Don hang da bi huy</p>
              <p className="text-sm text-slate-500 mt-1">
                Lien he quan de biet them chi tiet.
              </p>
            </div>
          ) : (
            <>
              {/* Current status highlight */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`w-14 h-14 rounded-2xl ${activeStep.bgColor} flex items-center justify-center shrink-0`}
                >
                  <activeStep.icon size={28} weight="duotone" className={activeStep.color} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{activeStep.label}</p>
                  <p className="text-sm text-slate-500">{activeStep.description}</p>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-0">
                {statusSteps.map((step, i) => {
                  const isPast = i < currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  const isFuture = i > currentStepIndex;

                  return (
                    <div key={step.status} className="flex items-center flex-1 last:flex-none">
                      {/* Dot */}
                      <motion.div
                        initial={reduce ? false : { scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: i * 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${
                          isPast
                            ? "bg-emerald-500"
                            : isCurrent
                              ? `${activeStep.bgColor} ring-2 ${activeStep.borderColor}`
                              : "bg-slate-100"
                        }`}
                      >
                        {isPast ? (
                          <CheckCircle size={20} weight="bold" className="text-white" />
                        ) : (
                          <step.icon
                            size={18}
                            weight="duotone"
                            className={
                              isCurrent ? activeStep.color : "text-slate-400"
                            }
                          />
                        )}
                        {isCurrent && !reduce && (
                          <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-amber-400" />
                        )}
                      </motion.div>

                      {/* Connector line */}
                      {i < statusSteps.length - 1 && (
                        <div className="flex-1 h-1 mx-1.5 rounded-full overflow-hidden bg-slate-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: isPast ? "100%" : isCurrent ? "50%" : "0%",
                            }}
                            transition={{
                              duration: 0.6,
                              delay: i * 0.15,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="h-full bg-emerald-400 rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step labels (below dots) */}
              <div className="flex mt-3">
                {statusSteps.map((step, i) => {
                  const isCurrent = i === currentStepIndex;
                  const isPast = i < currentStepIndex;
                  return (
                    <div key={step.status} className={`flex-1 ${i === statusSteps.length - 1 ? "flex-none" : ""}`}>
                      <p
                        className={`text-[11px] font-medium leading-tight ${
                          isCurrent
                            ? "text-slate-900"
                            : isPast
                              ? "text-emerald-600"
                              : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.section>

        {/* Order details */}
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Chi tiet don hang</h2>
          </div>
          <ul className="divide-y divide-slate-50">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                    {item.quantity}
                  </span>
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-700 tabular-nums shrink-0 ml-3">
                  {item.subtotal.toLocaleString("vi-VN")}d
                </span>
              </li>
            ))}
          </ul>
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Tong cong</span>
            <span className="text-lg font-extrabold text-slate-900 tabular-nums">
              {order.totalAmount.toLocaleString("vi-VN")}d
            </span>
          </div>
        </motion.section>

        {/* Order info */}
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3"
        >
          <h2 className="text-base font-bold text-slate-900 mb-1">Thong tin</h2>

          {diningInfo && (
            <div className="flex items-center gap-2.5">
              <diningInfo.icon size={16} weight="duotone" className="text-amber-500 shrink-0" />
              <span className="text-sm text-slate-700">{diningInfo.label}</span>
              {order.tableNumber && (
                <span className="text-sm text-slate-500">
                  (Ban {order.tableNumber})
                </span>
              )}
            </div>
          )}

          {order.deliveryAddress && (
            <div className="flex items-start gap-2.5">
              <MapPin size={16} weight="duotone" className="text-amber-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">{order.deliveryAddress}</span>
            </div>
          )}

          {order.customerPhone && (
            <div className="flex items-center gap-2.5">
              <Phone size={16} weight="duotone" className="text-amber-500 shrink-0" />
              <span className="text-sm text-slate-700">{order.customerPhone}</span>
            </div>
          )}

          {order.note && (
            <div className="flex items-start gap-2.5">
              <Receipt size={16} weight="duotone" className="text-amber-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-500 italic">{order.note}</span>
            </div>
          )}

          <p className="text-xs text-slate-400 pt-1">
            Dat luc:{" "}
            {new Date(order.createdAt).toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </motion.section>

        {/* Actions */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/thuc-don"
            className="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
          >
            Dat them mon khac
          </Link>
          <Link
            href="/"
            className="flex-1 text-center bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-sm font-semibold py-3 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
          >
            Ve trang chu
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
