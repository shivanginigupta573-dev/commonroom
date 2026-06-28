"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import api, { getImageUrl } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Check if logged in safely (only browser)
    const isLoggedIn = typeof window !== "undefined" ? !!localStorage.getItem("access_token") : false;
    
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    api.get(`/users/me/favorites/?page=${page}`)
      .then((response) => {
        // DRF PageNumberPagination returns { count, next, previous, results }
        // Each result is a Favorite object containing { id, listing, created_at }
        const results = response.data.results;
        
        if (page === 1) {
          setFavorites(results);
        } else {
          setFavorites((prev) => [...prev, ...results]);
        }
        
        setHasMore(response.data.next !== null);
        setLoading(false);
        setLoadingMore(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load saved items.");
        setLoading(false);
        setLoadingMore(false);
      });
  }, [page, router]);

  return (
    <main>
      <Navbar />

      <section className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="none" className="w-8 h-8 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <h2 className="text-3xl font-bold">Saved Items</h2>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading your saved items...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <ListingCard
                key={fav.listing.id}
                id={fav.listing.id}
                title={fav.listing.title}
                price={Number(fav.listing.price)}
                campus={fav.listing.campus}
                seller={fav.listing.seller}
                program={fav.listing.program}
                year={fav.listing.year}
                image={getImageUrl(fav.listing.image)}
                isFavorited={true} // It's in the favorites list, so it's favorited!
              />
            ))}
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-300 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700">No saved items yet</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">Click the heart icon on any listing to save it for later. Your saved items will appear here.</p>
          </div>
        )}

        {!loading && hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loadingMore}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
