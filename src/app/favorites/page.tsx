"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import api, { getImageUrl } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Bookmark, ArrowRight } from "lucide-react";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const isLoggedIn = typeof window !== "undefined" ? !!localStorage.getItem("access_token") : false;
    
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    api.get(`/users/me/favorites/?page=${page}`)
      .then((response) => {
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
    <main className="min-h-screen bg-white text-slate-900 pb-16">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        
        {/* Header Section */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 border border-rose-100/60">
            <Heart size={20} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Saved Items</h2>
          </div>
        </div>

        {/* Primary Screen Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-400">Loading your saved items...</p>
          </div>
        )}

        {/* Error Notification Alert */}
        {error && !loading && (
          <div className="max-w-md mx-auto text-center py-12 px-6 border border-slate-200 rounded-2xl">
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button 
              onClick={() => setPage(1)} 
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Clean,  Grid View Showcase */}
        {!loading && !error && favorites.length > 0 && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  isFavorited={true}
                />
              ))}
            </div>

            {/* Pagination Load Button Trigger */}
            {hasMore && (
              <div className="text-center mt-14">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-xs hover:bg-slate-50 disabled:opacity-50 transition shadow-xs"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-slate-500" />
                      Loading items...
                    </span>
                  ) : (
                    "Load More Saved Items"
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Clean Flat Empty Canvas Graphic Block */}
        {!loading && !error && favorites.length === 0 && (
          <div className="text-center py-20 bg-slate-50/60 rounded-2xl border border-slate-200 max-w-xl mx-auto px-6">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-400 mb-4 border border-slate-200/50">
              <Bookmark size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">No saved items yet</h3>
            <p className="text-xs font-medium text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Click the heart icon on any campus marketplace item to save it for quick review later on.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-xl transition"
            >
              Browse Marketplace
              <ArrowRight size={14} />
            </button>
          </div>
        )}
        
      </section>
    </main>
  );
}