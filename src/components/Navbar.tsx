"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  username: string;
  email: string;
};

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // WHY: Check if user is logged in on component mount
    // WHAT: Read token and user data from localStorage
    // HOW: Set user state if logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    // WHY: Clear authentication data
    // WHAT: Remove token, refresh token, and user from localStorage
    // HOW: User gets logged out immediately
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b bg-white">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80">
        <div className="w-8 h-8 rounded-lg bg-blue-900" />
        <h1 className="text-xl font-bold text-blue-900">
          CommonRoom
        </h1>
      </Link>

      <div className="hidden md:flex gap-8 text-sm font-medium">
        <a href="#" className="hover:text-indigo-600">Marketplace</a>
        <a href="#" className="hover:text-indigo-600">Borrow</a>
        <a href="#" className="hover:text-indigo-600">Lost & Found</a>
        <a href="#" className="hover:text-indigo-600">Notices</a>
      </div>

      <div className="flex items-center gap-4">
        {!loading && user ? (
          <>
            <Link
              href="/create"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Post Item
            </Link>
            
            <div className="flex items-center gap-3 pl-4 border-l">
              <span className="text-sm text-gray-700">{user.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}