import { Input } from "@/components/ui/input";



interface HeroProps {

  search: string;

  setSearch: React.Dispatch<React.SetStateAction<string>>;

}



export default function Hero({ search, setSearch }: HeroProps) {

  return (

    <section className="relative w-full overflow-hidden min-h-[480px] max-h-[520px] flex items-center">

     

      {/* Full width background illustration */}

      <img

        src="/hero-illustration.png"

        alt=""

        className="absolute inset-0 w-full h-full object-cover object-center"

      />



      {/* Gradient overlay — strong on left for text readability, fades right */}

      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/5" />



      {/* Text Content — sits above everything */}

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 w-full">

        <div className="max-w-xl">

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

            className="max-w-md mt-6 bg-white/80 backdrop-blur-sm"

            placeholder="Search books, calculators..."

            value={search}

            onChange={(e) => setSearch(e.target.value)}

          />

        </div>

      </div>



    </section>

  );

}

