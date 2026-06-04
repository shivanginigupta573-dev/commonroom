"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { listings as mockListings } from "@/data/mockListings";

// Match whatever shape your mockListings objects have
type Listing = {
  id: number;
  title: string;
  price: number;
  image: string;
  seller: string;
  program: string;
  year: string;
  campus: string;
  category: string;
};

export default function ListingPage() {
  const params = useParams();
  const id = Number(params.id);

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedListings: Listing[] = JSON.parse(
      localStorage.getItem("listings") || "[]"
    );

    // Check mock listings first, then localStorage
    const allListings = [
      ...mockListings,
      ...savedListings.filter(
        (saved) => !mockListings.some((mock) => mock.id === saved.id)
      ),
    ];

    const found = allListings.find((item) => item.id === id);
    setListing(found || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-10">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-5xl mx-auto p-10">
        <h1 className="text-2xl font-bold text-red-500">Listing Not Found</h1>
        <p className="text-gray-500 mt-2">
          This listing may have been removed or the ID is invalid.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <img
        src={listing.image}
        alt={listing.title}
        className="w-full h-96 object-cover rounded-xl"
      />

      <h1 className="text-4xl font-bold mt-6">{listing.title}</h1>

      <p className="text-2xl font-bold text-indigo-600 mt-2">
        ₹{listing.price}
      </p>

      <div className="mt-6">
        <p className="font-medium">{listing.seller}</p>
        <p className="text-gray-500">
          {listing.program} • {listing.year}
        </p>
        <p className="text-gray-500">{listing.campus}</p>
      </div>

      <button className="mt-8 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
        Contact Seller
      </button>
    </div>
  );
}