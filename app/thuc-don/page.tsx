import type { Metadata } from "next";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { MenuContent } from "../components/MenuContent";
import { CartDrawer } from "../components/CartDrawer";
import { mockMenuItems } from "../lib/mock-data";
import type { MenuItem } from "../lib/types";

export const metadata: Metadata = {
  title: "Thuc don | Com Ga Anh Hai Lua",
  description:
    "Xem thuc don com ga Anh Hai Lua. Com ga xoi mo, com ga luoc, com ga quay va nhieu mon hap dan khac. Dat mon truc tuyen ngay.",
};

export default async function ThucDonPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5130";
  let items: MenuItem[] | null = null;
  let fetchError = false;

  try {
    const res = await fetch(`${apiUrl}/api/menu`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      items = data.value !== undefined ? data.value : data;
    } else {
      fetchError = true;
    }
  } catch (error) {
    console.error("Failed to fetch menu items", error);
    fetchError = true;
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-[100dvh]">
        {fetchError || !items ? (
          <div className="max-w-7xl mx-auto px-4 py-32 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Không thể tải thực đơn</h1>
            <p className="mt-4 text-slate-600">Máy chủ hiện không phản hồi hoặc đang bảo trì. Vui lòng thử lại sau.</p>
          </div>
        ) : (
          <MenuContent initialItems={items} />
        )}
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
