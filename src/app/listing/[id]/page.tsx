"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { getImageUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { 
  ArrowLeft, 
  MessageSquare, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Sparkles, 
  Layers, 
  Trash2, 
  AlertTriangle,
  Heart
} from "lucide-react";

type Listing = {
  id: number;
  title: string;
  price: string;
  image: string | null;
  seller: string;
  user: number;
  program: string;
  year: string;
  campus: string;
  category: string;
  listing_type: string;
  condition: string;
  description: string;
  is_negotiable: boolean;
  status: string;
};

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Favoriting states matched exactly to ListingCard behaviors
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    // Synchronize login state on client mount
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  useEffect(() => {
    if (!id) return;

    // 1. Fetch listing data
    api.get(`/listings/${id}/`)
      .then((response) => {
        setListing(response.data);
        
        try {
          const storedUser = JSON.parse(localStorage.getItem("user") || "null");
          setIsOwner(storedUser?.id === response.data.user);
        } catch (e) {
          console.error("Error parsing user context:", e);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error retrieving listing:", err);
        setError("Listing not found.");
        setLoading(false);
      });

    // 2. Fetch user favorites list to initialize the heart color correctly
    api.get(`/users/me/favorites/`)
      .then((res) => {
        const items = res.data.results || [];
        const found = items.some((fav: any) => fav.listing.id === Number(id));
        setIsFavorited(found);
      })
      .catch((err) => console.error("Error matching favorite list details:", err));

  }, [id]);

  // Exact endpoint and toggle logic copied directly from your working ListingCard component
  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      alert("Please log in to save items!");
      return;
    }
    
    if (favoriting) return;
    setFavoriting(true);
    
    try {
      const response = await api.post(`/listings/${id}/favorite/`);
      setIsFavorited(response.data.favorited);
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      alert("Could not update saved status. Please try again.");
    } finally {
      setFavoriting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}/`);
      router.push("/");
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Failed to delete listing. Please try again.");
      setDeleting(false);
    }
  };

  const handleContactSeller = async () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    if (!listing || isOwner || contacting) return;
    setContacting(true);
    try {
      // Idempotent: returns existing convo ID if one already exists
      const res = await api.post("/chat/conversations/start/", {
        listing_id: listing.id,
        other_user_id: listing.user,
      });
      router.push(`/messages?conversation_id=${res.data.id}`);
    } catch (err) {
      console.error("Could not start conversation", err);
      alert("Could not open chat. Please try again.");
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6 md:p-10 animate-pulse">
          <div className="w-32 h-4 bg-slate-100 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 bg-slate-50 rounded-2xl h-[450px] md:h-[520px]"></div>
            <div className="lg:col-span-5 space-y-6">
              <div className="flex gap-2">
                <div className="w-16 h-6 bg-slate-100 rounded"></div>
                <div className="w-20 h-6 bg-slate-100 rounded"></div>
              </div>
              <div className="w-3/4 h-10 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <div className="max-w-md mx-auto my-20 p-8 border border-slate-200 rounded-2xl text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Listing Not Found</h1>
          <button 
            onClick={() => router.push("/")}
            className="mt-6 w-full py-3 bg-slate-900 text-white font-medium rounded-xl text-sm"
          >
            Back to Home Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-16">
      <Navbar />
      
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        
        <button 
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* IMAGE BLOCK */}
          <div className="lg:col-span-7 w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-6 flex items-center justify-center min-h-[380px] md:min-h-[500px] max-h-[550px] relative">
            
            {!isOwner && isLoggedIn && (
              <button
                onClick={handleToggleFavorite}
                disabled={favoriting}
                className="absolute top-4 right-4 z-20 p-2.5 bg-white rounded-full border border-slate-200/80 shadow-xs hover:scale-105 active:scale-95 transition text-slate-700"
              >
                <Heart 
                  size={18} 
                  className={isFavorited ? "text-rose-500 fill-rose-500" : "text-slate-400 hover:text-rose-500 transition-colors"} 
                />
              </button>
            )}

            <img
              src={getImageUrl(listing.image)}
              alt={listing.title}
              className="w-full h-full max-h-[460px] object-contain rounded-xl mix-blend-multiply relative z-10"
            />
          </div>

          {/* INFORMATION DETAIL BLOCK */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-slate-900 text-white rounded">
                  {listing.listing_type}
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-slate-100 text-slate-700 rounded flex items-center gap-1.5 border border-slate-200">
                  <Layers size={12} />
                  {listing.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                {listing.title}
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-3xl font-black text-[#6366F1]">
                  {listing.price === "0.00" ? "Free" : `₹${Number(listing.price).toLocaleString("en-IN")}`}
                </span>
                {listing.is_negotiable && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded tracking-wide uppercase">
                    Negotiable
                  </span>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 space-y-2">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                {listing.description || "The seller has not provided a description for this item."}
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase tracking-wider">
                  {listing.seller.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{listing.seller}</h4>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">Verified Student</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs font-medium">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <GraduationCap size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Program</p>
                    <p className="mt-1 font-semibold text-slate-800 truncate max-w-[130px]">{listing.program}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Academic Year</p>
                    <p className="mt-1 font-semibold text-slate-800">{listing.year} Year</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-600">
                  <MapPin size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Location</p>
                    <p className="mt-1 font-semibold text-slate-800 truncate max-w-[130px]">{listing.campus}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-600">
                  <Sparkles size={16} className="text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Condition</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded capitalize">
                      {listing.condition.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* LOWER ACTIONS FOOTER BAR */}
            <div className="flex gap-3 pt-1">
              {!isOwner && (
                <button
                  onClick={handleContactSeller}
                  disabled={contacting}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-slate-900 text-white py-3.5 rounded-xl font-bold transition text-sm shadow-xs disabled:opacity-60"
                >
                  <MessageSquare size={16} strokeWidth={2.5} />
                  {contacting ? "Opening chat…" : "Contact Seller"}
                </button>
              )}
              
              {!isOwner && (
                <button
                  onClick={handleToggleFavorite}
                  disabled={favoriting}
                  className={`px-4 rounded-xl border transition flex items-center justify-center ${
                    isFavorited 
                      ? "bg-rose-50 text-rose-600 border-rose-200" 
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                  title={isFavorited ? "Remove from Saved" : "Save Item"}
                >
                  <Heart size={16} fill={isFavorited ? "currentColor" : "none"} />
                </button>
              )}
              
              {isOwner && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-slate-50 text-rose-600 font-semibold px-4 rounded-xl hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* MODAL CONFIG */}
      {isOwner && showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Delete this listing?</h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to remove <span className="font-semibold text-slate-700">"{listing.title}"</span>? This action is permanent.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 disabled:opacity-50 transition text-xs"
              >
                {deleting ? "Deleting..." : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}