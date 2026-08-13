"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Share2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] pt-12 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
      
      {/* Background Floating Ornamental Particles & Glows */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-magenta/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-saffron/10 rounded-full blur-3xl pointer-events-none" />

      {/* Ornate Background Grid */}
      <div className="absolute inset-0 bg-ornate-grid opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column: Hero Copy */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono-code font-bold tracking-widest uppercase shadow-inner">
            <Sparkles size={14} className="text-gold animate-spin-slow" />
            <span>HH GOA 2026 · OFFICIAL IDENTITY BUILDER</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-cream leading-[1.02]">
            FRAME YOUR <br />
            <span className="text-gold-gradient drop-shadow-sm">HACKER GOA</span> <br />
            IDENTITY.
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-cream-muted max-w-2xl font-sans leading-relaxed mx-auto lg:mx-0">
            Turn any photo into your <strong className="text-cream font-semibold">HH Goa 2026</strong> builder identity in seconds. Automatic crop, custom builder class, 5 Goan festival themes & crew frames ready for X.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/generator"
              className="btn-gold-shimmer w-full sm:w-auto px-8 py-4 rounded-2xl font-display font-bold text-lg flex items-center justify-center gap-3 shadow-xl"
            >
              <span>Create My Frame</span>
              <ArrowRight size={20} />
            </Link>

            <a
              href="#themes"
              className="btn-ornate-secondary w-full sm:w-auto px-7 py-4 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2"
            >
              <span>See Themes</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 border-t border-gold/15 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 text-xs font-mono-code text-cream-muted">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-gold" />
              <span>Instant Canvas Export</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-saffron" />
              <span>Auto Cover Crop</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 size={15} className="text-magenta" />
              <span>X / Twitter Ready</span>
            </div>
          </div>

        </div>

        {/* Right Column: Ornate Mockup Frame Visual */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          
          {/* Goan Tropical Botanical SVG Ornaments around Mockup */}
          <svg className="absolute -top-12 -left-12 w-32 h-32 text-gold/30 pointer-events-none animate-float" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 C60 30 70 40 100 50 C70 60 60 70 50 100 C40 70 30 60 0 50 C30 40 40 30 50 0 Z" />
          </svg>

          <svg className="absolute -bottom-10 -right-10 w-36 h-36 text-magenta/25 pointer-events-none animate-pulse-subtle" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="2" />
          </svg>

          {/* Hero ID Card Frame Mockup */}
          <div className="relative w-full max-w-[380px] bg-gradient-to-b from-[#092518] via-[#0D3624] to-[#04150E] p-6 rounded-[28px] border-2 border-gold/50 shadow-2xl shadow-black/80 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 card-ornate frame-glow">
            
            {/* Top Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-gold/25 font-display">
              <div className="flex items-center gap-2">
                <span className="text-cream font-extrabold text-sm tracking-wider">HH</span>
                <span className="text-gold font-black text-lg tracking-wide">GOA 2026</span>
              </div>
              <span className="text-xs font-mono-code text-magenta font-bold px-2 py-0.5 rounded bg-magenta/10 border border-magenta/30">
                &gt;_ BUILDER_ID
              </span>
            </div>

            {/* Photo Mockup Container */}
            <div className="my-5 relative aspect-[4/4.5] rounded-2xl overflow-hidden border-2 border-gold shadow-inner bg-[#051810] group">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                alt="HH Goa Builder Reference"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Ornate Inner Corner Accents */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-gold" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-gold" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-gold" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-gold" />

              {/* Status Pill Overlay */}
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-gold/40 text-[11px] font-mono-code text-gold">
                [VERIFIED_CREATOR]
              </div>
            </div>

            {/* Identity Details */}
            <div className="space-y-2 font-display">
              <h3 className="text-2xl font-black tracking-tight text-cream uppercase">
                VATSAL SOLANKI
              </h3>
              <p className="text-xs font-mono-code font-bold text-saffron uppercase tracking-wider">
                // AI & FULL STACK
              </p>
              
              <div className="pt-2 flex items-center justify-between">
                <span className="inline-block px-3 py-1 rounded-xl bg-gold/15 border border-gold/40 text-gold font-extrabold text-xs tracking-wide">
                  VISIONARY BUILDER
                </span>
                <span className="text-[11px] font-mono-code text-cream-muted">
                  GOA, INDIA 🌴
                </span>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="mt-5 pt-3 border-t border-gold/20 flex items-center justify-between text-[11px] font-mono-code text-cream-muted">
              <span>BUILD · SHIP · SHARE</span>
              <strong className="text-gold font-display font-black text-sm">#FrameInGoa</strong>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
