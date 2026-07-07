"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  Store,
  HandCoins,
  Heart,
  Plus,
  LogOut,
  User,
} from "lucide-react";

type User = {
  id: number;
  username: string;
  email: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    loading && setLoading(false);
  }, [loading]);

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  const navItems = [
    {
      href: "/",
      label: "Browse",
      icon: ShoppingBag,
    },
    {
      href: "/?type=sell",
      label: "Buy",
      icon: Store,
    },
    {
      href: "/?type=rent",
      label: "Rent",
      icon: HandCoins,
    },
    {
      href: "/?type=borrow",
      label: "Borrow",
      icon: HandCoins,
    },
  ];

  return (
    // Integrated #8895B3 as a soft subtle border line and configured background blur
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#8895B3]/20">
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Logo Gradient using Soft Periwinkle (#8E94F2) to Wisteria Blue (#9FA0FF) */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8E94F2] to-[#9FA0FF] flex items-center justify-center shadow-md shadow-[#8E94F2]/20 transition-transform group-hover:scale-105 duration-200">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="font-bold text-xl text-gray-900 tracking-tight">
              CommonRoom
            </h1>
          </div>
        </Link>

        {/* Navigation */}
        {/* Using a very soft Mauve tinted background (#BBADFF/10) for the pill container */}
        <nav className="hidden lg:flex bg-[#BBADFF]/10 rounded-full p-1 gap-1 border border-[#BBADFF]/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition duration-200
                ${
                  active
                    ? "bg-white shadow-sm text-[#8E94F2]"
                    : "text-gray-600 hover:text-[#8E94F2] hover:bg-white/50"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <>
              {/* Favorites button featuring subtle hover text matching #8E94F2 */}
              <Link
                href="/favorites"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#8E94F2]/40 hover:text-[#8E94F2] hover:bg-[#8E94F2]/5 transition duration-200"
              >
                <Heart size={18} />
              </Link>

              {/* Main Call To Action matching the prominent Wisteria Blue (#9FA0FF) */}
              <Link
                href="/create"
                className="flex items-center gap-2 bg-[#9FA0FF] hover:bg-[#8E94F2] text-white px-5 py-2.5 rounded-full font-medium shadow-sm transition duration-200"
              >
                <Plus size={18} />
                Post
              </Link>

              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                {/* User Avatar utilizing deep Mauve pastel hue (#DAB6FC) */}
                <div className="w-10 h-10 rounded-full bg-[#DAB6FC]/20 flex items-center justify-center">
                  <User
                    size={18}
                    className="text-[#BBADFF]"
                  />
                </div>

                <div className="hidden xl:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {user.username}
                  </p>
                  <p className="text-xs text-[#8895B3]">
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-red-500 transition duration-200 p-1"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-black font-medium transition duration-200 text-sm"
              >
                Login
              </Link>

              <Link
                href="/auth/signup"
                className="bg-[#9FA0FF] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#8E94F2] shadow-sm transition duration-200 text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}