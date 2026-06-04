"use client";

import { useState } from "react";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import ListingCard from "@/components/ListingCard";

import { listings } from "@/data/mockListings";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const filteredListings = listings.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main>
      <Navbar />

      <Hero
        search={search}
        setSearch={setSearch}
      />

      <section className="max-w-7xl mx-auto px-8 py-10">

        {/* Category Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            "All",
            "Books",
            "Hostel Essentials",
            "Cycles",
            "Study Material",
          ].map((category) => (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(category)
              }
              className={`px-4 py-2 rounded-full border transition ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-6">
          Trending Listings
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => (
            <ListingCard
              key={item.id}
              id={item.id}
              title={item.title}
              price={item.price}
              campus={item.campus}
              seller={item.seller}
              program={item.program}
              year={item.year}
              image={item.image}
            />
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No listings found.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}