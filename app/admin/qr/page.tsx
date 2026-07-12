"use client";

import { useEffect, useState } from "react";
import { Storefront, Package } from "@phosphor-icons/react";
import Link from "next/link";

export default function QrGeneratorPage() {
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // Automatically get the current domain (e.g. localhost:3000 or your real domain)
    setBaseUrl(window.location.origin);
  }, []);

  if (!baseUrl) return <div className="p-10 text-center">Đang tải...</div>;

  const tables = Array.from({ length: 16 }, (_, i) => i + 1);

  // Using a free, reliable QR Code Generator API
  const getQrUrl = (url: string) => 
    `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}&margin=10`;

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Non-printable header */}
      <div className="max-w-5xl mx-auto p-8 print:hidden">
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Mã QR</h1>
            <p className="text-slate-500 mt-1">Trang này dùng để in ấn các mã QR cho quán. Bấm Ctrl + P (hoặc Cmd + P) để in.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
              Trở về Trang chủ
            </Link>
            <button 
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
            >
              In Tất Cả Mã QR
            </button>
          </div>
        </div>
      </div>

      {/* Printable Area */}
      <div className="max-w-5xl mx-auto p-8 print:p-0">
        
        {/* QR Takeaway */}
        <div className="mb-12 page-break-after">
          <h2 className="text-xl font-bold text-slate-900 mb-6 print:hidden">Mã QR Mua Mang Đi (Đặt tại quầy)</h2>
          <div className="inline-block p-6 bg-white border-2 border-slate-200 rounded-3xl text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} weight="duotone" className="text-amber-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-1">MUA MANG ĐI</h3>
            <p className="text-sm text-slate-500 mb-6">Quét mã để đặt món nhanh</p>
            <img 
              src={getQrUrl(`${baseUrl}/thuc-don?type=takeaway`)} 
              alt="QR Mang Đi" 
              className="w-64 h-64 mx-auto rounded-xl border border-slate-100 p-2" 
            />
            <p className="text-xs text-slate-400 mt-4 font-mono">{baseUrl}/thuc-don?type=takeaway</p>
          </div>
        </div>

        {/* QR Dine-in */}
        <h2 className="text-xl font-bold text-slate-900 mb-6 print:hidden">Mã QR Tại Bàn (Bàn 1 - 16)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 print:grid-cols-4 print:gap-4">
          {tables.map(table => (
            <div key={table} className="p-6 bg-white border-2 border-slate-200 rounded-3xl text-center break-inside-avoid">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Storefront size={24} weight="duotone" className="text-amber-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">BÀN SỐ {table}</h3>
              <p className="text-xs text-slate-500 mb-4">Quét mã để gọi món</p>
              <img 
                src={getQrUrl(`${baseUrl}/thuc-don?type=dine_in&table=${table}`)} 
                alt={`QR Bàn ${table}`} 
                className="w-48 h-48 mx-auto rounded-xl border border-slate-100 p-2" 
              />
              <p className="text-[10px] text-slate-400 mt-3 font-mono truncate px-2">
                ...?type=dine_in&table={table}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
