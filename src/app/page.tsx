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
    // Styled background container with your high contrast theme context base text colors
    <div className="min-h-screen bg-slate-50/50 text-[#2E335A]">
      <Navbar />
      
      {/* Passing search state safely into your separate presentation component */}
      <Hero search={search} setSearch={setSearch} />

      <section className="max-w-7xl mx-auto px-8 py-10">
        
        {/* Modern Category Pill Selector featuring custom theme colors */}
        <div className="flex gap-2.5 mb-12 flex-wrap">
          {["All", "Books", "Hostel Essentials", "Cycles", "Study Material"].map(
            (category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-5 py-2 text-sm font-semibold rounded-full border transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-[#6366F1] text-white border-[#6366F1] shadow-md shadow-[#6366F1]/10"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#8E94F2]/40 hover:text-[#6366F1] hover:bg-[#8E94F2]/5"
                }`}
              >
                {category}
              </button>
            )
          )}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-[#2E335A]">
            {selectedCategory === "All" ? "Recent Additions" : `${selectedCategory}`}
          </h2>
          {!loading && (
            <span className="text-xs font-bold uppercase tracking-wider text-[#8895B3] bg-gray-100 px-3 py-1.5 rounded-md">
              {allListings.length} {allListings.length === 1 ? 'Item' : 'Items'}
            </span>
          )}
        </div>

        {/* Loading Spinner tailored with themed brand accent ring color */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-9 h-9 border-4 border-[#8E94F2]/20 border-t-[#6366F1] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#8895B3] font-medium text-sm">Fetching campus items...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12 bg-red-50/50 rounded-2xl border border-red-150 p-6">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* Grid display layout */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

        {/* Empty state markup */}
        {!loading && !error && allListings.length === 0 && (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl p-8">
            <p className="text-gray-400 font-medium">No active listings match your parameters.</p>
          </div>
        )}

        {/* Pagination load action controller using premium branding colors */}
        {!loading && hasMore && (
          <div className="text-center mt-16 mb-8">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loadingMore}
              className="px-8 py-3 rounded-full border border-gray-200 text-sm font-bold text-[#2E335A] bg-white hover:border-[#8E94F2]/40 hover:text-[#6366F1] hover:bg-[#8E94F2]/5 disabled:opacity-50 transition-all duration-200 shadow-sm focus:outline-none"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-[#6366F1] rounded-full animate-spin"></div>
                  Loading Content...
                </span>
              ) : (
                "Load More Items"
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}