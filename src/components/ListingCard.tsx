// src/components/ListingCard.tsx

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface ListingCardProps {
  id:number
  title: string;
  price: number;
  campus: string;
  seller: string;
  program: string;
  year: string;
  image: string;
}

export default function ListingCard({
  id,
  title,
  price,
  campus,
  seller,
  program,
  year,
  image,
}: ListingCardProps) {
  return (
    <Link href={`/listing/${id}`}>
    <Card className="overflow-hidden hover:shadow-xl transition">
      <img
        src={image}
        alt={title}
        className="h-48 w-full object-cover"
      />

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">
          {title}
        </h3>

        <p className="text-xl font-bold text-indigo-600 mt-2">
          ₹{price}
        </p>

        <p className="text-sm text-gray-500 mt-2">
          {campus}
        </p>

        <p className="text-sm mt-1">
          Seller: {seller}
        </p>

        <p className="text-xs text-gray-500">
         {program} • {year}
        </p>
      </CardContent>
     </Card>
    </Link>
  );
}