import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CommonRoom — NIT Durgapur Campus Marketplace",
  description: "Buy, sell, rent and borrow items with fellow NIT Durgapur students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fafafa] text-gray-900 relative selection:bg-indigo-100 selection:text-indigo-900">
        
        {/* Subtle Ambient Background Glows */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-[-1]">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-50/60 blur-[100px] opacity-70" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-50/50 blur-[120px] opacity-60" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-purple-50/40 blur-[100px] opacity-50" />
        </div>

        {/* flex-1 fills all remaining vertical space, pushing the footer down */}
        <main className="flex-1 relative z-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}