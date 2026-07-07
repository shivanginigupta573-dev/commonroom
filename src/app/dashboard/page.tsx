"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import api, { getImageUrl } from "@/lib/api";

const listingTypeOptions = ["All", "sell", "rent", "borrow", "free"];

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

type Favorite = {
  listing: Listing;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);

  const [sellerListings, setSellerListings] = useState<Listing[]>([]);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [sellerPage, setSellerPage] = useState(1);
  const [hasMoreSeller, setHasMoreSeller] = useState(false);
  const [listingTypeFilter, setListingTypeFilter] = useState("All");

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [hasMoreFavorites, setHasMoreFavorites] = useState(false);

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
        setSellerError("Unable to load your listings. Please try again later.");
      })
      .finally(() => {
        setSellerLoading(false);
      });
  }, [user, sellerPage, listingTypeFilter]);

  useEffect(() => {
    if (!user) return;

    setFavoritesLoading(true);
    setFavoritesError(null);

    api.get(`/users/me/favorites/?page=${favoritesPage}`)
      .then((response) => {
        const results = response.data.results;
        if (favoritesPage === 1) {
          setFavorites(results);
        } else {
          setFavorites((prev) => [...prev, ...results]);
        }
        setHasMoreFavorites(response.data.next !== null);
      })
      .catch((error) => {
        console.error(error);
        setFavoritesError("Unable to load your saved items. Please try again later.");
      })
      .finally(() => {
        setFavoritesLoading(false);
      });
  }, [user, favoritesPage]);

  const handleListingTypeChange = (type: string) => {
    setListingTypeFilter(type);
    setSellerPage(1);
    setSellerListings([]);
  };

  const handleCreateListing = () => {
    router.push("/create");
  };

  return (
    <main>
      <Navbar />

      <section className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-600 font-semibold">
              Dashboard
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mt-3">
              Welcome back{user ? `, ${user.username}` : ""}
            </h1>
            <p className="mt-3 text-gray-600 max-w-2xl">
              Manage your seller profile, view your active listings, and keep track of items you want to buy.
            </p>
          </div>

          <button
            onClick={handleCreateListing}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
          >
            Post a new listing
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Seller Profile</h2>
                  <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                    Your listings show the items you are selling, renting, borrowing, or giving away.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {listingTypeOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleListingTypeChange(type)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        listingTypeFilter === type
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {type === "All" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                {sellerLoading ? (
                  <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    Loading your listings...
                  </div>
                ) : sellerError ? (
                  <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
                    {sellerError}
                  </div>
                ) : sellerListings.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    You have not added any listings yet.
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
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

              {!sellerLoading && !sellerError && hasMoreSeller && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setSellerPage((page) => page + 1)}
                    className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Load more seller listings
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Buyer Profile</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Items you&apos;ve saved for later appear here so you can revisit them quickly.
                </p>
              </div>

              <div className="mt-8">
                {favoritesLoading ? (
                  <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    Loading saved items...
                  </div>
                ) : favoritesError ? (
                  <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
                    {favoritesError}
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    You haven&apos;t saved any items yet.
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {favorites.map((fav) => (
                      <ListingCard
                        key={fav.listing.id}
                        id={fav.listing.id}
                        title={fav.listing.title}
                        price={Number(fav.listing.price)}
                        campus={fav.listing.campus}
                        seller={fav.listing.seller}
                        program={fav.listing.program}
                        year={fav.listing.year}
                        image={getImageUrl(fav.listing.image)}
                        isFavorited={true}
                      />
                    ))}
                  </div>
                )}
              </div>

              {!favoritesLoading && !favoritesError && hasMoreFavorites && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setFavoritesPage((page) => page + 1)}
                    className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Load more saved items
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
