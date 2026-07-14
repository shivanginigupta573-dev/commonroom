// src/components/ListingCard.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { MapPin, GraduationCap, Heart } from "lucide-react";

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
  // Included listing_type if your backend passes it, defaults to sell style
  listing_type?: "sell" | "rent" | "borrow" | "free"; 
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
  listing_type = "sell",
}: ListingCardProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault(); 
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

  // Dynamic status tags pulled right from the logo elements
  const badgeStyles = {
    sell: { bg: "bg-brand-coral/10", text: "text-brand-coral", label: "Selling" },
    rent: { bg: "bg-brand-orange/10", text: "text-brand-orange", label: "For Rent" },
    borrow: { bg: "bg-brand-purple/10", text: "text-brand-purple", label: "Borrowing" },
    free: { bg: "bg-brand-blue/10", text: "text-brand-blue", label: "Freebie" },
  };

  const currentBadge = badgeStyles[listing_type] || badgeStyles.sell;

  return (
    <Link href={`/listing/${id}`} className="group block h-full">
      <div className="flex flex-col h-full bg-white rounded-3xl border-2 border-gray-100 shadow-xs hover:shadow-md hover:border-brand-purple/20 transition-all duration-300 overflow-hidden relative">
        
        {/* Transparent Badge Overlay */}
        <div className={`absolute top-3 left-3 z-10 rounded-xl ${currentBadge.bg} ${currentBadge.text} px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider shadow-xs`}>
          {currentBadge.label}
        </div>

        {/* Brand-Accented Heart Button */}
        {isLoggedIn && (
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs hover:bg-white rounded-xl shadow-xs border border-gray-100 transition-all z-10 active:scale-90 disabled:opacity-50"
            aria-label="Toggle favorite"
          >
            <Heart 
              size={16}
              className={`transition-colors ${
                isFavorited 
                  ? "fill-brand-coral text-brand-coral" 
                  : "text-gray-400 hover:text-brand-coral"
              }`}
            />
          </button>
        )}

        {/* Card Artwork Window */}
        <div className="w-full aspect-[4/3] bg-gray-50 overflow-hidden">
          <img
            src={image || "/placeholder-gear.png"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        {/* Card Content Information */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-3 mb-1">
            <h3 className="font-bold text-gray-900 text-base line-clamp-1 leading-snug group-hover:text-brand-purple transition-colors">
              {title}
            </h3>
            <p className="font-black text-gray-900 text-base leading-snug shrink-0">
              {price === 0 ? "Free" : `₹${price}`}
            </p>
          </div>

          {/* Location Line */}
          <div className="flex items-center gap-1 text-gray-400 mt-1 mb-4">
            <MapPin size={13} className="text-brand-orange" />
            <p className="text-xs font-semibold tracking-wide uppercase truncate">
              {campus}
            </p>
          </div>

          {/* Bottom Metabar Row */}
          <div className="mt-auto pt-3.5 border-t border-gray-50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-lg bg-brand-teal/10 text-brand-teal flex-shrink-0 flex items-center justify-center font-bold text-xs uppercase">
                {seller.charAt(0)}
              </div>
              <span className="text-xs text-gray-600 truncate font-semibold">{seller}</span>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 whitespace-nowrap">
              <GraduationCap size={13} className="text-brand-purple" />
              <span>{program} '{year.slice(-2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}