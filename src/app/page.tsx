"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
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

export default function Home() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      setAllListings([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    setAllListings([]);
  };

  useEffect(() => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    const queryParams = new URLSearchParams({
      page: page.toString(),
    });

    if (debouncedSearch) {
      queryParams.append("search", debouncedSearch);
    }
    
    if (selectedCategory !== "All") {
      queryParams.append("category", selectedCategory);
    }

    api.get(`/listings/?${queryParams.toString()}`)
      .then((response) => {
        // DRF PageNumberPagination returns { count, next, previous, results }
        const results = response.data.results;
        
        if (page === 1) {
          setAllListings(results);
        } else {
          setAllListings((prev) => [...prev, ...results]);
        }
        
        setHasMore(response.data.next !== null);
        setLoading(false);
        setLoadingMore(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load listings. Is the backend running?");
        setLoading(false);
        setLoadingMore(false);
      });
  }, [page, debouncedSearch, selectedCategory]);

  return (
    <main>
      <Navbar />
      <Hero search={search} setSearch={setSearch} />

      <section className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex gap-2.5 mb-10 flex-wrap">
          {["All", "Books", "Hostel Essentials", "Cycles", "Study Material"].map(
            (category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            )
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedCategory === "All" ? "Recent Additions" : `${selectedCategory}`}
          </h2>
          {!loading && (
            <span className="text-sm text-gray-500 font-medium tracking-wide">
              {allListings.length} {allListings.length === 1 ? 'ITEM' : 'ITEMS'}
            </span>
          )}
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Fetching listings...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allListings.map((item) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={Number(item.price)}
                campus={item.campus}
                seller={item.seller}
                program={item.program}
                year={item.year}
                image={getImageUrl(item.image)}
                isFavorited={(item as any).is_favorited}
              />
            ))}
          </div>
        )}

        {!loading && !error && allListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No listings found.</p>
          </div>
        )}

        {!loading && hasMore && (
          <div className="text-center mt-12 mb-8">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  Loading...
                </span>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}