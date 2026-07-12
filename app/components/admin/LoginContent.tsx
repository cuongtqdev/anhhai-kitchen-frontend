"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Eye, EyeSlash, LockKey, User, CircleNotch } from "@phosphor-icons/react";
import Cookies from "js-cookie";

export function LoginContent() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5130";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Tài khoản hoặc mật khẩu không đúng.");
      }

      const token = data.value?.accessToken || data.accessToken;
      if (!token) {
        throw new Error("Lỗi hệ thống: Không nhận được token.");
      }

      // Lưu token vào cookie
      Cookies.set("anhhai_access_token", token, { expires: 1 }); // 1 day
      
      // Chuyển hướng tới trang quản trị
      router.push("/quan-tri");
      router.refresh(); // Force refresh to re-evaluate server components
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-50 p-4 font-sans selection:bg-amber-100 selection:text-amber-900">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-400/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-3xl p-8 sm:p-10">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white text-xl font-black tracking-tighter mx-auto mb-6 shadow-[0_4px_16px_rgba(245,158,11,0.25)]">
              AH
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-slate-900 mb-2">
              Hệ thống Quản lý
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Đăng nhập bằng tài khoản nội bộ
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[13px] font-bold text-slate-700 ml-1">
                Tài khoản
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                  <User size={18} weight="bold" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-normal"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-bold text-slate-700 ml-1">
                Mật khẩu
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                  <LockKey size={18} weight="bold" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl pl-11 pr-12 py-3.5 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-normal"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeSlash size={18} weight="bold" />
                  ) : (
                    <Eye size={18} weight="bold" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full relative flex items-center justify-center bg-slate-900 text-white font-bold text-sm py-4 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 active:scale-[0.98]"
              >
                {loading ? (
                  <CircleNotch size={20} className="animate-spin" weight="bold" />
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[13px] font-medium text-slate-400">
            &copy; {new Date().getFullYear()} Anh Hai Lúa. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
