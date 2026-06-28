// src/components/ListingCard.tsx

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import api from "@/lib/api";
import { useEffect } from "react";

interface ListingCardProps {
  id: number;
  title: string;
  price: number;
  campus: string;
  seller: string;
  program: string;
  year: string;
  image: string;
  isFavorited?: boolean;
}

export default function ListingCard({
  id,
  title,
  price,
  campus,
  seller,
  program,
  year,
  image,
  isFavorited: initialIsFavorited = false,
}: ListingCardProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);

  // Check if logged in safely (only browser)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
  setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link click
    if (!isLoggedIn) {
      alert("Please log in to save items!");
      return;
    }
    
    if (loading) return;
    setLoading(true);

    try {
      const response = await api.post(`/listings/${id}/favorite/`);
      setIsFavorited(response.data.favorited);
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href={`/listing/${id}`} className="group block">
      <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden relative">
        
        {/* Heart Button */}
        {isLoggedIn && (
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm border border-gray-100 transition-all z-10 active:scale-95"
            aria-label="Toggle favorite"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={isFavorited ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-5 h-5 transition-colors ${
                isFavorited ? "text-red-500 stroke-red-500" : "text-gray-400 stroke-gray-400 hover:text-red-400 hover:stroke-red-400"
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        )}

        {/* Image Box */}
        <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        </div>

        {/* Content Box */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-base line-clamp-1 leading-tight">
              {title}
            </h3>
            <p className="font-bold text-gray-900 text-base leading-tight">
              ₹{price}
            </p>
          </div>

          <p className="text-sm text-gray-500 line-clamp-1 mb-3">
            {campus}
          </p>

          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] font-medium text-gray-600 uppercase">{seller.charAt(0)}</span>
              </div>
              <span className="text-xs text-gray-600 truncate font-medium">{seller}</span>
            </div>
            
            <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium whitespace-nowrap">
              {program} '{year.slice(-2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}