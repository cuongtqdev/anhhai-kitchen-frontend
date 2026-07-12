"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { List, X, CookingPot, ForkKnife, CreditCard } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export function AdminNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { href: "/quan-tri/bep", label: "Màn hình Bếp (KDS)", icon: CookingPot },
    { href: "/quan-tri/menu", label: "Quản lý Thực đơn", icon: ForkKnife },
    { href: "/quan-tri/thu-ngan", label: "Thu ngân", icon: CreditCard },
  ];

  return (
    <div className="relative" ref={navRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/20"
      >
        {isOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 left-0 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top"
          >
            <div className="p-2 space-y-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-sm ${
                      isActive 
                        ? "bg-amber-50 text-amber-700 font-bold" 
                        : "text-slate-600 hover:bg-slate-50 font-medium hover:text-slate-900"
                    }`}
                  >
                    <Icon size={20} weight={isActive ? "fill" : "regular"} className={isActive ? "text-amber-500" : "text-slate-400"} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
