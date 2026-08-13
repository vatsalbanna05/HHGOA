"use client";

import Link from "next/link";
import { Camera, Sparkles, Palette, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { FRAME_THEMES } from "../../lib/builderClasses";

export function FeaturesSection() {
  const themesList = Object.values(FRAME_THEMES);

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-gold/15 relative">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono-code uppercase">
            <span>GOA FESTIVAL CREATIVE STUDIO</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-cream">
            CRAFTED FOR <span className="text-gold-gradient">BUILDERS</span> & <span className="text-saffron-gradient">CREWS</span>
          </h2>
          <p className="text-cream-muted text-base sm:text-lg">
            Create an authentic, high-resolution festival frame with Goan botanical filigree, custom builder class badges, and X-ready layout.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <StepCard
            step="01"
            icon={<Camera className="text-gold" size={24} />}
            title="Upload Any Photo"
            description="Smart cover-style cropping fits any photo automatically. Optional zoom and reposition controls."
          />

          <StepCard
            step="02"
            icon={<Sparkles className="text-saffron" size={24} />}
            title="Generate Class"
            description="Enter your name & tech stack to generate your unique Builder Class badge (e.g. Code Alchemist)."
          />

          <StepCard
            step="03"
            icon={<Palette className="text-magenta" size={24} />}
            title="Pick Theme"
            description="Choose from 5 Goan festival themes (Goa Classic, Hacker House, Sunset Hacker, Tropical Code, Night Shift)."
          />

          <StepCard
            step="04"
            icon={<Users className="text-gold" size={24} />}
            title="Team & Export"
            description="Download high-resolution 1200x1500 PNG or generate a combined crew frame with your teammates!"
          />

        </div>

        {/* 5 Themes Showcase Section */}
        <div id="themes" className="pt-12 border-t border-gold/10 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono-code text-gold uppercase tracking-wider">VISUAL IDENTITY SYSTEM</span>
              <h3 className="text-2xl sm:text-4xl font-display font-black text-cream mt-1">
                5 ORIGINAL GOAN THEMES
              </h3>
            </div>
            <p className="text-cream-muted text-sm max-w-md">
              Each theme preserves the HH Goa identity while altering decorative compositions, background gradients, and ornamental motifs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {themesList.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl border border-gold/20 bg-goa-card/60 hover:bg-goa-card/90 transition-all hover:-translate-y-1 group"
              >
                <div
                  className="h-28 rounded-xl mb-4 p-3 flex flex-col justify-between border border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${t.bgGradient[0]}, ${t.bgGradient[1]})`,
                  }}
                >
                  <span className="text-[10px] font-mono-code text-gold font-bold uppercase tracking-wider">
                    {t.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: t.primaryGold }} />
                    <span className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: t.accentColor }} />
                  </div>
                </div>

                <h4 className="font-display font-bold text-cream text-base group-hover:text-gold transition-colors">
                  {t.name}
                </h4>
                <p className="text-xs text-cream-muted mt-1 leading-relaxed">
                  {t.tagline}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* High Resolution PNG Export Banner */}
        <div id="export" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#072418] via-[#0D3B27] to-[#14122E] border-2 border-gold/40 relative overflow-hidden card-ornate">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-mono-code">
                <Sparkles size={14} />
                <span>CRISP HIGH RESOLUTION</span>
              </div>

              <h3 className="text-3xl sm:text-5xl font-display font-black text-cream leading-tight">
                YOUR HACKER IDENTITY <br />
                DESERVES <span className="text-gold-gradient">PREMIUM CANVAS QUALITY</span>.
              </h3>

              <p className="text-cream-muted text-base max-w-2xl">
                Generate high-resolution 1200x1500 PNG images powered by HTML Canvas API with auto cover photo fitting, Goan filigree corners, and vibrant theme styling.
              </p>

              <div className="flex flex-wrap gap-4 text-xs font-mono-code text-cream-muted">
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-gold" /> Automatic Photo Fit</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-saffron" /> 5 Goa Themes</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-magenta" /> 1200x1500 PNG Download</div>
              </div>

              <div className="pt-2">
                <Link
                  href="/generator"
                  className="btn-gold-shimmer inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-display font-bold text-base shadow-lg"
                >
                  <span>Generate Your Frame</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-[280px] p-4 rounded-2xl bg-black/40 border border-gold/30 backdrop-blur-md space-y-3 font-mono-code text-xs text-center">
                <div className="text-gold font-bold border-b border-gold/20 pb-2">
                  HH GOA '26 CANVAS SPEC
                </div>
                <div className="space-y-2 text-[11px] text-cream-muted">
                  <div className="p-2 rounded bg-goa-card border border-gold/20">Resolution: 1200 x 1500 px</div>
                  <div className="p-2 rounded bg-goa-card border border-gold/20">Format: Lossless PNG</div>
                  <div className="p-2 rounded bg-goa-card border border-gold/20">Privacy: 100% Local Browser</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, icon, title, description }: { step: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-goa-card/50 border border-gold/20 hover:border-gold/50 transition-all card-ornate space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-display font-black text-2xl text-gold/30">{step}</span>
      </div>
      <h3 className="font-display font-bold text-xl text-cream">{title}</h3>
      <p className="text-cream-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}
