"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import api, { getImageUrl } from "@/lib/api";
import { Sparkles, ShoppingBag, PlusCircle, ArrowUpRight, AlertCircle, Home } from "lucide-react";

const listingTypeOptions = [
  { label: "All", color: "hover:text-[#2181B5] checked:bg-[#2181B5]/10", activeBg: "bg-gray-900 text-white" },
  { label: "sell", color: "text-[#E65C65]", activeBg: "bg-[#E65C65] text-white" },
  { label: "rent", color: "text-[#EEA651]", activeBg: "bg-[#EEA651] text-white" },
  { label: "borrow", color: "text-[#623BB6]", activeBg: "bg-[#623BB6] text-white" },
  { label: "free", color: "text-[#2272E3]", activeBg: "bg-[#2272E3] text-white" }
];

type Listing = {
  id: number;
  title: string;
  price: string;
  image: string | null;
  seller: string;
  program: string;
  year: string;
  campus: string;
  is_favorited?: boolean;
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [sellerListings, setSellerListings] = useState<Listing[]>([]);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [sellerPage, setSellerPage] = useState(1);
  const [hasMoreSeller, setHasMoreSeller] = useState(false);
  const [listingTypeFilter, setListingTypeFilter] = useState("All");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    if (!storedUser || !token) {
      router.push("/auth/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Failed to parse stored user", error);
      localStorage.removeItem("user");
      router.push("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "seller" && sellerRef.current) {
      sellerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchParams, sellerLoading]);

  useEffect(() => {
    if (!user) return;

    setSellerLoading(true);
    setSellerError(null);

    const params = new URLSearchParams({
      page: sellerPage.toString(),
    });
    if (listingTypeFilter !== "All") {
      params.append("listing_type", listingTypeFilter);
    }

    api.get(`/users/me/listings/?${params.toString()}`)
      .then((response) => {
        const results = response.data.results;
        if (sellerPage === 1) {
          setSellerListings(results);
        } else {
          setSellerListings((prev) => [...prev, ...results]);
        }
        setHasMoreSeller(response.data.next !== null);
      })
      .catch((error) => {
        console.error(error);
        setSellerError("Grabbed a snag loading your stash. Let's try that again!");
      })
      .finally(() => {
        setSellerLoading(false);
      });
  }, [user, sellerPage, listingTypeFilter]);

  const handleListingTypeChange = (type: string) => {
    setListingTypeFilter(type);
    setSellerPage(1);
    setSellerListings([]);
  };

  return (
    // Note: Using standard styling fallbacks to ensure compatibility with all setups
    <main className="min-h-screen bg-stone-50/40 pb-24 antialiased selection:bg-[#EEA651]/20">
      <Navbar />

      <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-12">
        
        {/* Playful & Engaging CommonRoom Branded Banner */}
        <div className="relative overflow-hidden bg-white border-2 border-gray-100 p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 shadow-sm">
          
          {/* Translucent Brand Circles Background Blurs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#623BB6]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 right-20 w-32 h-32 bg-[#E65C65]/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-[#623BB6]/10 text-[#623BB6] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Home size={12} className="text-[#2181B5]" /> CommonRoom Central
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Hey, {user ? user.username : "Natasha"}! 👋
            </h1>
            <p className="text-sm text-gray-500 max-w-xl font-normal leading-relaxed">
              Your personal corner. Drop some new gear, check what's live, or switch up your active spots.
            </p>
          </div>

          <button
            onClick={() => router.push("/create")}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#623BB6] hover:bg-[#2181B5] px-6 py-4 text-sm font-bold text-white shadow-md transition-all duration-200 self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle size={18} className="transition-transform group-hover:rotate-90 duration-300" />
            Post Something New
          </button>
        </div>

        {/* Full-Width Stash Area */}
        <div ref={sellerRef} className="rounded-3xl border-2 border-gray-100 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2181B5]/10 flex items-center justify-center text-[#2181B5] shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">My Live Hub</h2>
                <p className="text-xs text-gray-400 font-normal mt-0.5">Your currently listed gear, components, and books</p>
              </div>
            </div>
            
            {/* Color-Coded Brand Filter Options */}
            <div className="flex flex-wrap gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 self-start lg:self-auto">
              {listingTypeOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleListingTypeChange(opt.label)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-150 ${
                    listingTypeFilter === opt.label
                      ? opt.activeBg + " shadow-sm scale-[1.02]"
                      : `text-gray-500 bg-white/0 hover:bg-white/80 ${opt.color}`
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items Container Grid */}
          <div className="mt-8">
            {sellerLoading ? (
              <div className="rounded-2xl bg-gray-50/50 p-20 text-center text-xs font-bold text-gray-400/80 animate-pulse tracking-wide">
                Gathering your active board gear...
              </div>
            ) : sellerError ? (
              <div className="rounded-2xl border-2 border-rose-100 bg-rose-50/40 p-6 flex items-center justify-center gap-3">
                <AlertCircle className="w-4 h-4 text-[#E65C65] shrink-0" />
                <span className="text-xs font-bold text-[#E65C65] tracking-wide">{sellerError}</span>
              </div>
            ) : sellerListings.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-100 p-16 text-center text-xs font-medium text-gray-400/80">
                Looks empty under <span className="text-[#623BB6] uppercase font-bold">"{listingTypeFilter}"</span> right now. Let's share something!
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sellerListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    price={Number(listing.price)}
                    campus={listing.campus}
                    seller={listing.seller}
                    program={listing.program}
                    year={listing.year}
                    image={getImageUrl(listing.image)}
                    isFavorited={listing.is_favorited}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Load More Button */}
          {!sellerLoading && !sellerError && hasMoreSeller && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setSellerPage((page) => page + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-xs font-bold text-gray-600 hover:border-[#623BB6]/30 hover:text-[#623BB6] transition duration-200 cursor-pointer"
              >
                Load Next Wave <ArrowUpRight size={14} />
              </button>
            </div>
          )}
        </div>

      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50/40 flex items-center justify-center">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}