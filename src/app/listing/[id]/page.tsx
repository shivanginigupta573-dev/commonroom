import { listings } from "@/data/mockListings";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = listings.find(
    (item) => item.id === Number(id)
  );

  if (!listing) {
    return <h1>Listing Not Found</h1>;
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <img
        src={listing.image}
        alt={listing.title}
        className="w-full h-96 object-cover rounded-xl"
      />

      <h1 className="text-4xl font-bold mt-6">
        {listing.title}
      </h1>

      <p className="text-2xl font-bold text-indigo-600 mt-2">
        ₹{listing.price}
      </p>

      <div className="mt-6">
        <p className="font-medium">
          {listing.seller}
        </p>

        <p className="text-gray-500">
          {listing.program} • {listing.year}
        </p>

        <p className="text-gray-500">
          {listing.campus}
        </p>
      </div>

      <button className="mt-8 bg-indigo-600 text-white px-6 py-3 rounded-lg">
        Contact Seller
      </button>
    </div>
  );
}