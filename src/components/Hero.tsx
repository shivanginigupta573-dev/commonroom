import { Input } from "@/components/ui/input";
interface HeroProps {
  search: string;
  setSearch: React.Dispatch<
    React.SetStateAction<string>
  >;
}
export default function Hero({
  search,
  setSearch,
}: HeroProps) {
  return (
    <section className="max-w-7xl mx-auto px-8 py-20">
      <span className="text-sm bg-yellow-100 px-3 py-1 rounded-full">
        ✨ The Campus Exchange Network
      </span>

      <h1 className="text-6xl font-bold mt-6 text-slate-900">
        Buy. Rent. Borrow.
        <br />
        Share.
        <span className="text-indigo-500"> Repeat.</span>
      </h1>

      <p className="mt-6 text-gray-600 text-lg">
        Everything your campus already owns
      </p>

     <Input
        className="max-w-md"
        placeholder="Search books, calculators..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </section>
  );
}