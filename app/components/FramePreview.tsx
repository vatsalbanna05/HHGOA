"use client";

import { FRAME_THEMES, FrameThemeId } from "../../lib/builderClasses";
import { PhotoAdjustments } from "../../lib/canvas";
import { Sparkles, Terminal } from "lucide-react";

interface FramePreviewProps {
  photo: string | null;
  name: string;
  stack: string;
  teamName: string;
  themeId: FrameThemeId;
  adjustments: PhotoAdjustments;
}

export function FramePreview({
  photo,
  name,
  stack,
  teamName,
  themeId,
  adjustments,
}: FramePreviewProps) {
  const theme = FRAME_THEMES[themeId] || FRAME_THEMES.GOA_CLASSIC;

  // Compute CSS scale & pan position for live photo element
  const scale = adjustments.zoom ?? 1.0;
  const offX = adjustments.offsetX ?? 0;
  const offY = adjustments.offsetY ?? 0;

  return (
    <div className="w-full max-w-[500px] mx-auto select-none">
      
      {/* Frame Preview Card Container */}
      <div
        className="w-full aspect-[4/5] rounded-[32px] p-7 flex flex-col justify-between relative overflow-hidden shadow-2xl border-4 transition-all duration-300 card-ornate frame-glow"
        style={{
          background: `linear-gradient(145deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 50%, ${theme.bgGradient[2]} 100%)`,
          borderColor: theme.primaryGold,
        }}
      >
        
        {/* Subtle Sunburst Gradient in Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${theme.primaryGold} 0%, transparent 65%)`,
          }}
        />

        {/* Ornate Gold Outer Corners */}
        <div className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: theme.primaryGold }} />
        <div className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: theme.primaryGold }} />
        <div className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: theme.primaryGold }} />
        <div className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: theme.primaryGold }} />

        {/* 1. Header Bar */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/15">
          <div className="flex items-center gap-2 font-display">
            <span className="text-white font-extrabold text-lg">HH</span>
            <span className="font-black text-xl tracking-wide" style={{ color: theme.primaryGold }}>
              GOA 2026
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono-code text-xs px-2.5 py-1 rounded-md bg-black/40 border border-white/20" style={{ color: theme.accentColor }}>
            <Terminal size={12} />
            <span>&gt;_ HACKER HOUSE</span>
          </div>
        </div>

        {/* 2. Main Photo Container */}
        <div
          className="relative z-10 my-3 w-full h-[58%] rounded-2xl overflow-hidden border-2 shadow-xl flex items-center justify-center"
          style={{
            borderColor: theme.primaryGold,
            backgroundColor: theme.cardBg,
          }}
        >
          {photo ? (
            <div className="w-full h-full overflow-hidden relative">
              <img
                src={photo}
                alt="Builder photo"
                className="w-full h-full object-cover transition-transform duration-100 ease-out"
                style={{
                  transform: `scale(${scale}) translate(${offX / scale}%, ${offY / scale}%)`,
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center p-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center border border-dashed"
                style={{ borderColor: theme.primaryGold, color: theme.primaryGold }}
              >
                <Sparkles size={24} />
              </div>
              <span className="font-display font-bold text-sm tracking-wider text-cream/70">
                UPLOAD YOUR PHOTO
              </span>
              <span className="text-[11px] font-mono-code text-cream-muted">
                AUTOMATIC COVER FIT
              </span>
            </div>
          )}

          {/* Inner Photo Corner Filigree */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l pointer-events-none" style={{ borderColor: theme.primaryGold }} />
          <div className="absolute top-2 right-2 w-4 h-4 border-t border-r pointer-events-none" style={{ borderColor: theme.primaryGold }} />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l pointer-events-none" style={{ borderColor: theme.primaryGold }} />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r pointer-events-none" style={{ borderColor: theme.primaryGold }} />
        </div>

        {/* 3. Identity Details */}
        <div className="relative z-10 space-y-1.5 font-display text-left">
          
          {/* Name */}
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-cream uppercase line-clamp-1">
            {name.trim() ? name : "YOUR NAME"}
          </h2>

          {/* Stack */}
          <p className="text-xs font-mono-code font-bold uppercase tracking-wider" style={{ color: theme.accentColor }}>
            // {stack || "FULL STACK"}
          </p>

          {/* Optional Team */}
          {teamName.trim() && (
            <div className="pt-0.5">
              <span className="text-[11px] font-mono-code text-cream-muted">
                CREW: <strong className="text-cream">{teamName.toUpperCase()}</strong>
              </span>
            </div>
          )}

        </div>

        {/* 4. Footer Bar */}
        <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-[10px] font-mono-code text-cream-muted">
          <span>GOA, INDIA 🌴  BUILD · SHIP</span>
          <strong className="font-display font-black text-xs" style={{ color: theme.primaryGold }}>
            #FrameInGoa
          </strong>
        </div>

      </div>
    </div>
  );
}
