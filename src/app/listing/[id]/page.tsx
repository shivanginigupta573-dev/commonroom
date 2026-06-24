"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { getImageUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";

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

  useEffect(() => {
    if (!id) return;

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
  }, [id]);

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

  // Modern Skeleton Loader matching the exact 2-column layout structure
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto p-4 md:p-10 animate-pulse">
          <div className="w-32 h-4 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7 w-full bg-gray-100 rounded-2xl h-[350px] md:h-[480px]"></div>
            <div className="lg:col-span-5 space-y-6">
              <div className="flex gap-2"><div className="w-20 h-6 bg-gray-200 rounded-full"></div><div className="w-24 h-6 bg-gray-200 rounded-full"></div></div>
              <div className="w-3/4 h-8 bg-gray-200 rounded"></div>
              <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
              <hr className="border-gray-100" />
              <div className="space-y-2"><div className="w-full h-4 bg-gray-200 rounded"></div><div className="w-5/6 h-4 bg-gray-200 rounded"></div></div>
              <hr className="border-gray-100" />
              <div className="w-full h-32 bg-gray-100 rounded-xl"></div>
              <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto my-20 p-8 bg-white border border-gray-100 rounded-2xl shadow-xs text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Listing Not Found</h1>
          <p className="text-gray-500 mt-2">This item might have been sold or removed by the seller.</p>
          <button 
            onClick={() => router.push("/")}
            className="mt-6 w-full py-3 bg-gray-950 text-white font-semibold rounded-xl hover:bg-gray-800 transition text-sm shadow-xs"
          >
            Back to Home Page
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 md:p-10">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to listings
        </button>

        {/* Master Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Smart Image Showcase Box */}
          <div className="lg:col-span-7 w-full bg-linear-to-b from-gray-50 to-gray-100/60 border border-gray-200/60 rounded-2xl overflow-hidden flex items-center justify-center p-4 min-h-[350px] md:min-h-[480px] max-h-[550px] shadow-xs">
            <img
              src={getImageUrl(listing.image)}
              alt={listing.title}
              className="w-full h-full max-h-[500px] object-contain rounded-xl transition-transform duration-300 hover:scale-[1.01]"
            />
          </div>

          {/* RIGHT COLUMN: Listing Info Hierarchy */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Product Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100">
                  {listing.listing_type}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                  {listing.category}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                {listing.title}
              </h1>

              {/* Price & Negotiation Ribbon */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                  {listing.price === "0.00" ? "Free" : `₹${Number(listing.price).toLocaleString("en-IN")}`}
                </span>
                {listing.is_negotiable && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 uppercase tracking-wide">
                    Negotiable
                  </span>
                )}
              </div>

              <hr className="my-6 border-gray-100" />

              {/* Description Block */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {listing.description || "The seller has not provided a description for this item."}
                </p>
              </div>

              <hr className="my-6 border-gray-100" />

              {/* Micro-Upgraded Seller Details Card */}
              <div className="p-4 bg-white border border-gray-200/80 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  {/* Mock Profile Avatar Bubble */}
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm tracking-wider uppercase">
                    {listing.seller.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base leading-tight">{listing.seller}</p>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-y-2 gap-x-4 border-t border-gray-100 text-sm">
                  <div>
                    <span className="block text-xs text-gray-400 font-medium">Program / Year</span>
                    <span className="font-semibold text-gray-800">{listing.program} ({listing.year} Year)</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-medium">Campus Location</span>
                    <span className="font-semibold text-gray-800">{listing.campus}</span>
                  </div>
                </div>
                
                <div className="pt-2.5 mt-1 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-semibold uppercase tracking-wider">Item Condition</span>
                  <span className="font-bold text-gray-700 capitalize bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                    {listing.condition.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Premium Button Trigger Section */}
            <div className="flex gap-3 pt-2">
              <button className="flex-1 bg-indigo-600 text-white font-bold px-6 py-4 rounded-xl hover:bg-indigo-700 active:scale-[0.99] transition shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Seller
              </button>
              
              {isOwner && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-50 text-red-600 font-semibold px-5 py-4 rounded-xl hover:bg-red-100 active:scale-[0.99] transition border border-red-100 flex items-center justify-center"
                  title="Delete Listing"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Confirmation Modal Layer */}
      {isOwner && showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 transition-all transform scale-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete this listing?</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to remove <span className="font-semibold text-gray-800">"{listing.title}"</span>? This action is permanent.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition text-sm shadow-sm shadow-red-200"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}