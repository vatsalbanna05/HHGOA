"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-goa-darkest/90 backdrop-blur-xl border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-saffron flex items-center justify-center text-goa-darkest font-display font-black text-xl shadow-lg shadow-gold/20 group-hover:scale-105 transition-transform">
            ✦
          </div>
          <div>
            <div className="font-display font-extrabold text-xl tracking-tight text-cream flex items-center gap-2">
              FrameInGoa <span className="text-xs px-2 py-0.5 rounded-full bg-gold/15 border border-gold/40 text-gold font-mono-code">HH GOA '26</span>
            </div>
            <p className="text-[11px] text-cream-muted font-mono-code hidden sm:block">HACKER HOUSE DIGITAL IDENTITY</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-cream-muted">
          <a href="#how-it-works" className="hover:text-gold transition-colors">How It Works</a>
          <a href="#themes" className="hover:text-gold transition-colors">Themes</a>
          <a href="#team" className="hover:text-gold transition-colors">Team Mode</a>
          <Link href="/generator" className="hover:text-gold transition-colors flex items-center gap-1.5 text-gold">
            <Sparkles size={14} className="animate-pulse" /> Studio
          </Link>
        </nav>

        {/* CTA Button */}
        <Link
          href="/generator"
          className="btn-gold-shimmer px-5 py-2.5 rounded-xl font-display text-sm flex items-center gap-2"
        >
          <span>Create My Frame</span>
          <ArrowRight size={16} />
        </Link>

      </div>
    </header>
  );
}
