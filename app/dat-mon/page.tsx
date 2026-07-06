import type { Metadata } from "next";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { CheckoutContent } from "../components/CheckoutContent";

export const metadata: Metadata = {
  title: "Dat mon | Com Ga Anh Hai Lua",
  description:
    "Xac nhan don hang cua ban tai Com Ga Anh Hai Lua. Chon hinh thuc nhan mon, nhap thong tin va dat mon ngay.",
};

export default function DatMonPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-[100dvh]">
        <CheckoutContent />
      </main>
      <Footer />
    </>
  );
}
