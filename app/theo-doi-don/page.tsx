import type { Metadata } from "next";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { TrackingContent } from "../components/TrackingContent";

export const metadata: Metadata = {
  title: "Theo doi don hang | Com Ga Anh Hai Lua",
  description:
    "Theo doi trang thai don hang cua ban tai Com Ga Anh Hai Lua. Xem trang thai chuan bi va giao hang theo thoi gian thuc.",
};

export default function TheoDoiDonPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-[100dvh]">
        <TrackingContent />
      </main>
      <Footer />
    </>
  );
}
