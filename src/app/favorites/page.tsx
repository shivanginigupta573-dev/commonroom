"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import api, { getImageUrl } from "@/lib/api";

type Listing = {
  id: number;
  title: string;
  price: string;
  image: string | null;
  seller: string;
  program: string;
  year: string;
  campus: string;
  category: string;
  listing_type: string;
  status: string;
};

type FavoriteItem = {
  id: number;
  listing: Listing;
  created_at: string;
};

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    const token = localStorage.getItem("access_token");
    if (!token) {
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
  }, [page]);

  return (
    <main>
      <Navbar />
      <section className="max-w-7xl mx-auto px-8 py-10">
        <h2 className="text-2xl font-bold mb-6">Saved Items</h2>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading saved items...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              You haven't saved any items yet.
            </p>
            <p className="text-gray-400 mt-2">
              Browse the{" "}
              <a href="/" className="text-indigo-600 hover:underline">
                marketplace
              </a>{" "}
              and click the heart icon to save items.
            </p>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <ListingCard
                key={item.id}
                id={item.listing.id}
                title={item.listing.title}
                price={Number(item.listing.price)}
                campus={item.listing.campus}
                seller={item.listing.seller}
                program={item.listing.program}
                year={item.listing.year}
                image={getImageUrl(item.listing.image)}
                isFavorited={true}
              />
            ))}
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