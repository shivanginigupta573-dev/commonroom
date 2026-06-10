"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const id = params.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}/`);
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete listing");
      setDeleting(false);
    }
  };

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

      <div className="mt-8 flex gap-3">
        <button className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
          Contact Seller
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-red-100 text-red-600 px-6 py-3 rounded-lg hover:bg-red-200 transition"
        >
          Delete
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h2 className="text-xl font-bold mb-4">Delete Listing?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleting ? "Deleting..." : "Delete Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}