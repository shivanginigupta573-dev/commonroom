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
        <div className="flex gap-3 mb-8 flex-wrap">
          {["All", "Books", "Hostel Essentials", "Cycles", "Study Material"].map(
            (category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full border transition ${
                  selectedCategory === category
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            )
          )}
        </div>

        <h2 className="text-2xl font-bold mb-6">Listings</h2>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading listings...</p>
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