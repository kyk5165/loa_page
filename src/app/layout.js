import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "로아 히든 업적 체크리스트",
  description: "닉네임으로 접속해 업적을 관리하고 진행률을 확인하세요.",
  openGraph: {
    title: "로아 히든 업적 체크리스트",
    description: "닉네임으로 접속해 나의 업적 달성률을 확인하고, 체크하며 성장해 보세요!",
    url: "https://loa-hidden-check.vercel.app",
    siteName: "Checklist App",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "로아 히든 업적 체크리스트",
    description: "닉네임으로 접속해 업적을 관리하고 진행률을 확인하세요.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
