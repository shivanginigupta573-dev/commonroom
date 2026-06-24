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
    <Link href={`/listing/${id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition relative group">
        
        {/* Heart Button */}
        {isLoggedIn && (
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-sm transition-all z-10"
            aria-label="Toggle favorite"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={isFavorited ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-6 h-6 transition-colors ${
                isFavorited ? "text-red-500" : "text-gray-500 hover:text-red-400"
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

        <img
          src={image}
          alt={title}
          className="h-48 w-full object-cover"
        />

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>

          <p className="text-xl font-bold text-indigo-600 mt-2">
            ₹{price}
          </p>

          <p className="text-sm text-gray-500 mt-2 line-clamp-1">
            {campus}
          </p>

          <p className="text-sm mt-1 line-clamp-1">
            Seller: {seller}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {program} • {year}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}