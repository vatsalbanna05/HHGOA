"use client";

import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-goa-pattern flex flex-col justify-between">
      
      <div>
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gold/20 bg-goa-darkest/90 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="space-y-1">
            <div className="font-display font-black text-xl text-cream flex items-center justify-center md:justify-start gap-2">
              <span className="text-gold">✦</span> FrameInGoa — HH Goa 2026
            </div>
            <p className="text-xs font-mono-code text-cream-muted">
              Built for Hacker House Goa 2026 participants & tech community builders.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono-code text-cream-muted">
            <span>GOA × HACKER HOUSE</span>
            <span>INDIAN FOLK ART</span>
            <Link
              href="/generator"
              className="text-gold font-bold hover:underline flex items-center gap-1"
            >
              <span>Launch Studio</span>
              <ArrowRight size={12} />
            </Link>
          </div>

        </div>
      </footer>

    </div>
  );
}