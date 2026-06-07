"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  condition: string;
  description: string;
  is_negotiable: boolean;
  status: string;
};

export default function ListingPage() {
  const params = useParams();
  const id = params.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/listings/${id}/`)
      .then((response) => {
        setListing(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Listing not found.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-10">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-5xl mx-auto p-10">
        <h1 className="text-2xl font-bold text-red-500">Listing Not Found</h1>
        <p className="text-gray-500 mt-2">This listing may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <img
        src={getImageUrl(listing.image)}
        alt={listing.title}
        className="w-full h-96 object-cover rounded-xl"
      />

      <div className="flex items-start justify-between mt-6">
        <h1 className="text-4xl font-bold">{listing.title}</h1>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
          {listing.listing_type}
        </span>
      </div>

      <p className="text-2xl font-bold text-indigo-600 mt-2">
        {listing.price === "0.00" ? "Free" : `₹${Number(listing.price)}`}
      </p>

      {listing.is_negotiable && (
        <p className="text-sm text-green-600 mt-1">Negotiable</p>
      )}

      {listing.description && (
        <p className="text-gray-600 mt-4">{listing.description}</p>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="font-medium text-lg">{listing.seller}</p>
        <p className="text-gray-500">{listing.program} • {listing.year}</p>
        <p className="text-gray-500">{listing.campus}</p>
        <p className="text-gray-400 text-sm mt-1 capitalize">
          Condition: {listing.condition.replace('_', ' ')}
        </p>
      </div>

      <button className="mt-8 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition w-full">
        Contact Seller
      </button>
    </div>
  );
}