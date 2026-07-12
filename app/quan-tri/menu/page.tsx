import { MenuDashboard } from "@/app/components/admin/MenuDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Thực đơn | Cơm Gà Anh Hai Lúa",
  description: "Trang quản lý tình trạng món ăn và thực đơn",
};

export default function MenuPage() {
  return <MenuDashboard />;
}
