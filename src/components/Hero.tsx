"use client";

import { Input } from "@/components/ui/input";
import { Search, BookOpen, Bike, BedDouble, FileText } from "lucide-react";

interface HeroProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

export default function Hero({ search, setSearch }: HeroProps) {
  // Quick navigation tags matching the active UI context
  const tags = [
    { label: "Books", icon: BookOpen },
    { label: "Cycles", icon: Bike },
    { label: "Essentials", icon: BedDouble },
    { label: "Notes", icon: FileText }
  ];

  return (
    <section className="relative w-full overflow-hidden min-h-[500px] max-h-[540px] flex items-center bg-white">
      
      {/* Full width background image asset */}
      <img
        src="/hero-illustration.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center scale-105 select-none pointer-events-none"
      />

      {/* Premium custom color gradient overlay mimicking image 2 */}
      {/* Blends smoothly into the left text layer and gives a soft periwinkle tint on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-white/85 to-[#BBADFF]/10" />

      {/* Text Content Area */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-8 py-20 w-full">
        <div className="max-w-xl space-y-6">
          
          {/* Main heading styled cleanly with the requested high-contrast theme layout */}
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.15] text-[#2E335A]">
            Everything Students <br />Need. In{" "}
            <span className="bg-gradient-to-r from-[#6366F1] to-[#7C3AED] bg-clip-text text-transparent">
              One Place.
            </span>
          </h1>

          <p className="text-gray-500 font-medium text-base md:text-lg max-w-sm leading-relaxed">
            Buy, sell, and discover essentials from students across your campus.
          </p>

          {/* Premium Custom Search Container */}
          <div className="w-full max-w-md pt-2">
            <div className="relative flex items-center group">
              {/* Floating search icon inside the bar */}
              <Search 
                size={18} 
                className="absolute left-4 text-gray-400 group-focus-within:text-[#6366F1] transition-colors z-20" 
              />
              
              <Input
                className="w-full pl-11 pr-12 py-6 bg-white border-gray-200 text-sm font-medium rounded-full shadow-sm placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-[#6366F1]/20 focus-visible:border-[#6366F1] transition-all duration-300"
                placeholder="Search for books, cycles, essentials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Functional Keyboard prompt hint matching reference image */}
              <div className="absolute right-4 hidden sm:flex items-center justify-center bg-slate-100 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-200/60 select-none">
                /
              </div>
            </div>

            {/* Suggested Pill Badges */}
            <div className="flex items-center gap-2 mt-3.5 flex-wrap">
              <span className="text-[10px] font-bold text-[#8895B3] uppercase tracking-wider mr-1">
                Suggested:
              </span>
              {tags.map((tag) => {
                const TagIcon = tag.icon;
                return (
                  <button
                    key={tag.label}
                    onClick={() => setSearch(tag.label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-xs border border-gray-200 hover:border-[#8E94F2]/50 hover:text-[#6366F1] text-gray-500 text-xs font-semibold rounded-full transition-all duration-200 shadow-3xs hover:bg-slate-50"
                  >
                    <TagIcon size={12} className="text-gray-400" />
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}