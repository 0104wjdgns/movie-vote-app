import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "타우마제인 리더스클럽 영화 선정",
  description: "공동선을 주제로 한 영화 추천 및 투표",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${caveat.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
