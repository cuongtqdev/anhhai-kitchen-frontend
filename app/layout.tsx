import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Com Ga Anh Hai Lua | Quan com ga ngon nhat thanh pho",
  description:
    "Thuong thuc com ga Anh Hai Lua - huong vi truyen thong, chat luong hien dai. Dat mon truc tuyen, giao hang tan noi.",
};

import { QRContextTracker } from "./components/QRContextTracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${jakarta.variable} antialiased`}>
      <body>
        <QRContextTracker />
        {children}
      </body>
    </html>
  );
}
