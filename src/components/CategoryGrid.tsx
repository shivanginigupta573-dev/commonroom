// src/components/CategoryGrid.tsx

import { Card, CardContent } from "@/components/ui/card";

const categories = [
  "All",
  "Books",
  "Hostel Essentials",
  "Cycles",
  "Study Material",
];

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-10">
      <h2 className="text-2xl font-bold mb-6">
        Browse Categories
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Card
            key={category}
            className="cursor-pointer hover:shadow-lg transition"
          >
            <CardContent className="flex items-center justify-center h-24 text-center font-medium">
              {category}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}