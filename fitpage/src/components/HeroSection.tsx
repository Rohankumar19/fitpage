
import React from "react";
import { FlipWords } from "@/components/ui/flip-words";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HeroSection() {
  const words = ["amazing", "quality", "trusted", "premium"];
  
  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="container mx-auto px-4 py-20">
        <div className="px-4 py-10 md:px-8 md:py-10 lg:col-span-2">
          <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-left sm:text-4xl lg:text-7xl">
            Find <FlipWords words={words} /> <br />
            <span className="text-yellow-500 underline">products</span> and share your{" "}
            <span className="text-yellow-500 underline">reviews</span>
          </h2>
          <p className="mt-4 max-w-2xl text-center text-sm text-gray-300 sm:text-left md:mt-10 md:text-lg">
            Discover amazing products and share your experiences with our community. 
            Rate products, write reviews, and help others make informed decisions with{" "}
            <span className="text-yellow-400 font-semibold">authentic feedback</span>.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <button className="rounded-lg bg-yellow-400 px-4 py-2 text-base font-bold text-black hover:shadow-lg transition">
              Explore Products
            </button>
            <button className="rounded-lg border border-transparent px-4 py-2 text-base text-white hover:border-yellow-500 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
