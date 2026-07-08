import type { Metadata } from "next";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { CartDrawer } from "../../components/CartDrawer";
import { MenuItemDetailClient } from "./MenuItemDetailClient";
import type { MenuItem } from "../../lib/types";
import { mockMenuItems } from "../../lib/mock-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return {
    title: `Chi tiet mon an | Com Ga Anh Hai Lua`,
    description: "Xem chi tiet mon an, lua chon mon phu va dat hang.",
  };
}

export default async function MenuItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5248";
  let item: MenuItem | null = null;
  let allMenuItems: MenuItem[] = [];

  try {
    // Try to fetch the entire menu to get side dishes
    const res = await fetch(`${apiUrl}/api/menu`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      allMenuItems = data.value !== undefined ? data.value : data;
    }
  } catch (error) {
    console.error("Failed to fetch menu item", error);
  }

  // Fallback to mock data if the API fails or returns empty
  if (!allMenuItems || allMenuItems.length === 0 || !Array.isArray(allMenuItems)) {
    allMenuItems = mockMenuItems;
  }

  // Find the specific item. Handle string id vs int id correctly, and ensure it's a valid MenuItem
  const parsedId = parseInt(id);
  const found = allMenuItems.find(m => m.id === parsedId || m.id?.toString() === id);
  if (found && found.name) {
    item = found;
  }

  // Find side dishes that have the same category string
  // menuItemCategory === 2 is OptionalSide
  // menuItemCategory === 3 is MandatorySide
  const optionalSides = item 
    ? allMenuItems.filter(m => m.category === item!.category && m.menuItemCategory === 2 && m.id !== item!.id && m.isAvailable)
    : [];
  
  const mandatorySides = item
    ? allMenuItems.filter(m => m.category === item!.category && m.menuItemCategory === 3 && m.id !== item!.id && m.isAvailable)
    : [];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-[100dvh] bg-[#FAFAF9]">
        <MenuItemDetailClient 
          item={item} 
          optionalSides={optionalSides} 
          mandatorySides={mandatorySides} 
        />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
