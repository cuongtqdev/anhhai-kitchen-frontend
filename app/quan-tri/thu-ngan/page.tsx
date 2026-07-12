import { CashierDashboard } from "@/app/components/admin/CashierDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thu ngân | Cơm Gà Anh Hai Lúa",
  description: "Trang tính tiền và quản lý thanh toán đơn hàng",
};

export default function CashierPage() {
  return <CashierDashboard />;
}
