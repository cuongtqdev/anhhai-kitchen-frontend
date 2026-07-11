import { redirect } from "next/navigation";

export default function AdminPage() {
  // Tạm thời chuyển hướng tất cả người dùng vào màn hình bếp (KDS)
  // Sau này có thể phân giải role từ token để chuyển hướng vào /quan-tri/bep hoặc /quan-tri/thu-ngan
  redirect("/quan-tri/bep");
}
