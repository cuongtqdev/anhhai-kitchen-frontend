import type { Metadata } from "next";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { MenuContent } from "../components/MenuContent";
import { CartDrawer } from "../components/CartDrawer";

export const metadata: Metadata = {
  title: "Thuc don | Com Ga Anh Hai Lua",
  description:
    "Xem thuc don com ga Anh Hai Lua. Com ga xoi mo, com ga luoc, com ga quay va nhieu mon hap dan khac. Dat mon truc tuyen ngay.",
};

export default function ThucDonPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-[100dvh]">
        <MenuContent />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
