import Link from "next/link";
import { MapPin, Phone, Clock } from "@phosphor-icons/react/dist/ssr";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                AH
              </div>
              <span className="font-bold text-slate-900 tracking-tight">
                Com Ga Anh Hai Lua
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[36ch]">
              Huong vi com ga truyen thong, phuc vu bang ca tam long.
            </p>
          </div>

          {/* Lien ket nhanh */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Lien ket</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/thuc-don"
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-300"
                >
                  Thuc don
                </Link>
              </li>
              <li>
                <Link
                  href="/dat-mon"
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-300"
                >
                  Dat mon
                </Link>
              </li>
              <li>
                <Link
                  href="/theo-doi-don"
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-300"
                >
                  Theo doi don hang
                </Link>
              </li>
            </ul>
          </div>

          {/* Lien he */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Lien he</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} weight="duotone" className="text-amber-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-500">
                  834 Trần Hưng Đạo, Điện Ngọc, Điện Bàn, Quảng Nam
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} weight="duotone" className="text-amber-500 shrink-0" />
                <span className="text-sm text-slate-500">0935999135</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={16} weight="duotone" className="text-amber-500 shrink-0" />
                <span className="text-sm text-slate-500">
                  10:00 - 20:00 (Hang ngay)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            2026 Com Ga Anh Hai Lua. Tat ca quyen duoc bao luu.
          </p>
        </div>
      </div>
    </footer>
  );
}
