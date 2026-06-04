interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (
    category: string
  ) => void;
}

const categories = [
  "All",
  "Books",
  "Electronics",
  "Cycles",
];

export default function CategoryFilter({
  selectedCategory,
  setSelectedCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-3 flex-wrap mb-8">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() =>
            setSelectedCategory(category)
          }
          className={`px-4 py-2 rounded-full border transition
          ${
            selectedCategory === category
              ? "bg-indigo-600 text-white"
              : "bg-white"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}