import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "大学评价共创",
  description: "基于社区贡献的大学与专业就读体验评价",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
