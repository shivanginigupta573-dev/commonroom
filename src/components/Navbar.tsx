"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  Store,
  HandCoins,
  Heart,
  Plus,
  LogOut,
  User,
  LayoutDashboard,
  MessageSquare,
  Settings,
} from "lucide-react";

type User = {
  id: number;
  username: string;
  email: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    if (loading) setLoading(false);
  }, [loading]);

  function logout() {
    localStorage.clear();
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
  }

  const navItems = [
    {
      href: "/",
      label: "Browse",
      icon: ShoppingBag,
      activeColor: "text-brand-purple bg-brand-purple/5",
      hoverColor: "hover:text-brand-purple hover:bg-brand-purple/5",
    },
    {
      href: "/?type=sell",
      label: "Buy",
      icon: Store,
      activeColor: "text-brand-coral bg-brand-coral/5",
      hoverColor: "hover:text-brand-coral hover:bg-brand-coral/5",
    },
    {
      href: "/?type=rent",
      label: "Rent",
      icon: HandCoins,
      activeColor: "text-brand-orange bg-brand-orange/5",
      hoverColor: "hover:text-brand-orange hover:bg-brand-orange/5",
    },
    {
      href: "/?type=borrow",
      label: "Borrow",
      icon: HandCoins,
      activeColor: "text-brand-blue bg-brand-blue/5",
      hoverColor: "hover:text-brand-blue hover:bg-brand-blue/5",
    },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto h-20 px-6 flex items-center justify-between">

        {/* Real Brand Logo Integration */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 transition-transform group-hover:scale-105 duration-200">
            <Image
              src="/logo.png"
              alt="CommonRoom Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900 tracking-tight transition-colors group-hover:text-brand-purple">
              Common<span className="text-brand-teal">Room</span>
            </h1>
          </div>
        </Link>

        {/* Brand-Accented Navigation Pills */}
        <nav className="hidden lg:flex bg-gray-50/80 rounded-2xl p-1.5 gap-1 border border-gray-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150
                ${
                  active
                    ? `shadow-xs bg-white ${item.activeColor}`
                    : `text-gray-500 bg-transparent ${item.hoverColor}`
                }`}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <>
              {/* Saved Vault Shortcut */}
              <Link
                href="/favorites"
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand-coral/40 hover:text-brand-coral hover:bg-brand-coral/5 transition duration-200"
              >
                <Heart size={18} />
              </Link>

              {/* Dynamic Action Trigger Button */}
              <Link
                href="/create"
                className="flex items-center gap-1.5 bg-brand-purple hover:bg-brand-teal text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs transition duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={16} />
                Post Item
              </Link>

              {/* Dropdown User Trigger Block */}
              <div className="relative flex items-center pl-2 border-l border-gray-100" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 text-left focus:outline-none hover:opacity-90 transition duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center relative font-bold text-brand-orange uppercase text-sm">
                    {user.username.charAt(0)}
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>

                  <div className="hidden xl:block">
                    <p className="text-sm font-bold text-gray-900 leading-none">
                      {user.username}
                    </p>
                    <p className="text-xs font-medium text-gray-400 mt-1 max-w-[120px] truncate">
                      {user.email}
                    </p>
                  </div>
                </button>

                {/* Profile Floating Menu Box */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-60 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 text-xs font-bold text-gray-600 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand-teal/10 flex items-center justify-center text-brand-teal font-extrabold text-[10px] uppercase">
                        {user.username.slice(0, 1)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-900 truncate">{user.username}</span>
                        <span className="text-[10px] font-medium text-gray-400 truncate">{user.email}</span>
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link 
                        href="/dashboard" 
                        onClick={() => setDropdownOpen(false)} 
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-purple/5 hover:text-brand-purple rounded-xl transition text-gray-500"
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      
                      <Link 
                        href="/dashboard?tab=seller" 
                        onClick={() => setDropdownOpen(false)} 
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-coral/5 hover:text-brand-coral rounded-xl transition text-gray-500"
                      >
                        <Store size={15} /> My Listings
                      </Link>
                      
                      <Link 
                        href="/dashboard?tab=buyer" 
                        onClick={() => setDropdownOpen(false)} 
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-orange/5 hover:text-brand-orange rounded-xl transition text-gray-500"
                      >
                        <ShoppingBag size={15} /> My Orders
                      </Link>
                      
                      <Link 
                        href="/favorites" 
                        onClick={() => setDropdownOpen(false)} 
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-blue/5 hover:text-brand-blue rounded-xl transition text-gray-500"
                      >
                        <Heart size={15} /> Saved Items
                      </Link>
                      
                      <Link 
                        href="/messages" 
                        onClick={() => setDropdownOpen(false)} 
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-teal/5 hover:text-brand-teal rounded-xl transition text-gray-500"
                      >
                        <MessageSquare size={15} /> Messages
                      </Link>
                    </div>

                    <div className="p-1 border-t border-gray-50 mt-1 space-y-0.5">
                      <Link 
                        href="/settings" 
                        onClick={() => setDropdownOpen(false)} 
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition text-gray-500"
                      >
                        <Settings size={15} /> Settings
                      </Link>
                      
                      <button 
                        onClick={logout} 
                        className="flex items-center gap-3 w-full text-left px-3 py-2.5 hover:bg-rose-50 text-rose-600 rounded-xl transition font-bold"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-gray-500 hover:text-gray-900 font-bold transition duration-200 text-xs uppercase tracking-wider px-2"
              >
                Login
              </Link>

              <Link
                href="/auth/signup"
                className="bg-brand-purple text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-teal shadow-xs transition duration-200"
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