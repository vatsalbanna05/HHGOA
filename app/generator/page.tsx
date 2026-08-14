"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  ImagePlus,
  RefreshCw,
  Share2,
  Sparkles,
  ArrowLeft,
  ZoomIn,
  Move,
  RotateCcw,
  CheckCircle2,
  Layers,
} from "lucide-react";
import {
  FRAME_THEMES,
  FrameThemeId,
} from "../../lib/builderClasses";
import {
  createFrame,
  PhotoAdjustments,
} from "../../lib/canvas";
import { FramePreview } from "../components/FramePreview";
import { ResultModal } from "../components/ResultModal";

const STACKS = [
  "AI / ML",
  "Full Stack",
  "Frontend",
  "Backend",
  "Web3 / Crypto",
  "Systems / Rust",
  "Cloud & DevOps",
  "Product & Design",
  "Mobile Engineering",
  "Security / Hacker",
  "Other"
];

export default function GeneratorPage() {
  // Main Individual Frame State
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [stack, setStack] = useState("AI / ML");
  const [teamName, setTeamName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<FrameThemeId>("GOA_CLASSIC");

  // Photo Adjustments (Zoom & Reposition)
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>({
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
  });

  // Generator UX & Modal State
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Photo upload handler
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      setAdjustments({ zoom: 1.0, offsetX: 0, offsetY: 0 }); // Reset adjustments on new photo
    };
    reader.readAsDataURL(file);
  }

  // Generate Individual Frame
  async function handleGenerateFrame() {
    if (!photo) {
      setStatusMessage("Please upload your photo first.");
      return;
    }
    if (!name.trim()) {
      setStatusMessage("Please enter your name.");
      return;
    }

    setIsGenerating(true);
    setStatusMessage("Crafting your Goa identity...");

    try {
      // Small artificial delay for visual polish state
      await new Promise((resolve) => setTimeout(resolve, 600));

      const dataUrl = await createFrame({
        photo,
        name: name.trim(),
        stack,
        teamName: teamName.trim(),
        themeId: selectedTheme,
        adjustments,
      });

      const safeName = name.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      setResultFilename(`${safeName}-HH-Goa-2026.png`);
      setResultImage(dataUrl);
      setStatusMessage("");
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to generate frame. Please try another photo.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Share directly to X
  function handleShareX() {
    const text = `Just framed my HH Goa 2026 hacker identity 🌴⚡\n\nBuilder: ${name || "Builder"}\nStack: ${stack}\n\nBuilt for Goa. Built to ship.\n#FrameInGoa #HHGoa`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-goa-pattern flex flex-col justify-between">

      {/* Studio Top Navigation */}
      <header className="sticky top-0 z-40 bg-goa-darkest/90 backdrop-blur-xl border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-cream font-display font-bold hover:text-gold transition-colors">
            <ArrowLeft size={18} />
            <span>FrameInGoa</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-mono-code">
              HH GOA 2026 STUDIO
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden sticky top-16 z-30 bg-goa-dark/95 border-b border-gold/20 p-2 flex gap-2 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 py-2 rounded-xl text-xs font-display font-bold flex items-center justify-center gap-2 ${activeTab === "edit" ? "bg-gold text-goa-darkest shadow-md" : "text-cream-muted"
            }`}
        >
          <Layers size={14} />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2 rounded-xl text-xs font-display font-bold flex items-center justify-center gap-2 ${activeTab === "preview" ? "bg-gold text-goa-darkest shadow-md" : "text-cream-muted"
            }`}
        >
          <Sparkles size={14} />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Studio Grid Main Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Control Panel Studio */}
          <section className={`lg:col-span-6 space-y-8 ${activeTab === "preview" ? "hidden lg:block" : "block"}`}>

            <div className="p-6 sm:p-8 rounded-3xl bg-goa-card/60 border border-gold/20 card-ornate space-y-8 shadow-xl">

              {/* Studio Title */}
              <div className="border-b border-gold/20 pb-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono-code text-gold uppercase tracking-wider">CREATIVE STUDIO</span>
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-cream">
                    CRAFT YOUR IDENTITY
                  </h1>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <Sparkles size={20} />
                </div>
              </div>

              {/* SECTION 1: PHOTO UPLOAD & ADJUSTMENTS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-display font-bold text-cream flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center">1</span>
                    YOUR PHOTO
                  </label>
                  {photo && (
                    <button
                      onClick={() => setPhoto(null)}
                      className="text-xs font-mono-code text-saffron hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Drop Zone Box */}
                <label className="relative flex flex-col items-center justify-center min-h-[180px] p-6 rounded-2xl border-2 border-dashed border-gold/40 bg-black/30 hover:bg-black/50 hover:border-gold transition-all cursor-pointer overflow-hidden group">
                  {photo ? (
                    <div className="w-full h-44 rounded-xl overflow-hidden relative">
                      <img src={photo} alt="Upload preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-cream text-xs font-display font-bold">
                        Click to change photo
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center">
                        <ImagePlus size={24} />
                      </div>
                      <span className="font-display font-bold text-sm text-cream">
                        Drop your photo here
                      </span>
                      <span className="text-xs font-mono-code text-cream-muted">
                        or choose from your device (JPG, PNG, WEBP)
                      </span>
                      <span className="mt-1 text-[11px] text-gold/80 font-mono-code">
                        ✓ Automatic cover crop
                      </span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>

                {/* Optional Photo Adjustments (Zoom & Reposition) */}
                {photo && (
                  <div className="p-4 rounded-xl bg-black/40 border border-gold/20 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-gold font-mono-code">
                      <span className="flex items-center gap-1.5 font-bold">
                        <ZoomIn size={14} /> PHOTO ADJUSTMENTS
                      </span>
                      <button
                        onClick={() => setAdjustments({ zoom: 1.0, offsetX: 0, offsetY: 0 })}
                        className="flex items-center gap-1 text-cream-muted hover:text-cream"
                      >
                        <RotateCcw size={12} /> Reset
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-cream-muted text-[11px] block mb-1">Zoom: {adjustments.zoom.toFixed(1)}x</span>
                        <input
                          type="range"
                          min="0.8"
                          max="2.0"
                          step="0.05"
                          value={adjustments.zoom}
                          onChange={(e) => setAdjustments((prev) => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                          className="w-full accent-gold cursor-pointer"
                        />
                      </div>

                      <div>
                        <span className="text-cream-muted text-[11px] block mb-1">Pan Horizontal ({adjustments.offsetX}%)</span>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          step="1"
                          value={adjustments.offsetX}
                          onChange={(e) => setAdjustments((prev) => ({ ...prev, offsetX: parseInt(e.target.value) }))}
                          className="w-full accent-gold cursor-pointer"
                        />
                      </div>

                      <div>
                        <span className="text-cream-muted text-[11px] block mb-1">Pan Vertical ({adjustments.offsetY}%)</span>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          step="1"
                          value={adjustments.offsetY}
                          onChange={(e) => setAdjustments((prev) => ({ ...prev, offsetY: parseInt(e.target.value) }))}
                          className="w-full accent-gold cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: IDENTITY FIELDS */}
              <div className="space-y-4">
                <label className="text-sm font-display font-bold text-cream flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center">2</span>
                  YOUR IDENTITY
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono-code text-cream-muted">YOUR NAME *</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vatsal Solanki"
                      maxLength={24}
                      className="w-full px-4 py-3 rounded-xl bg-goa-darkest border border-gold/30 text-cream placeholder:text-cream-muted/50 focus:border-gold outline-none font-display font-semibold text-sm"
                    />
                  </div>

                  {/* Stack Select */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono-code text-cream-muted">TECH STACK</span>
                    <select
                      value={stack}
                      onChange={(e) => setStack(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-goa-darkest border border-gold/30 text-cream focus:border-gold outline-none font-sans font-semibold text-sm cursor-pointer"
                    >
                      {STACKS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Team Name Optional */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono-code text-cream-muted">CREW / TEAM NAME (OPTIONAL)</span>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Goa Coders Collective"
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl bg-goa-darkest border border-gold/30 text-cream placeholder:text-cream-muted/50 focus:border-gold outline-none font-sans text-sm"
                  />
                </div>
              </div>

              {/* SECTION 3: FRAME THEMES */}
              <div className="space-y-3">
                <label className="text-sm font-display font-bold text-cream flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs flex items-center justify-center">3</span>
                  FRAME THEME
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(FRAME_THEMES) as FrameThemeId[]).map((themeKey) => {
                    const t = FRAME_THEMES[themeKey];
                    const isSelected = selectedTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => setSelectedTheme(themeKey)}
                        className={`p-3 rounded-xl border text-left transition-all ${isSelected
                            ? "border-gold bg-gold/15 shadow-md shadow-gold/20"
                            : "border-gold/20 bg-black/30 hover:border-gold/50"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-display font-bold text-xs text-cream">
                            {t.name}
                          </span>
                          {isSelected && <CheckCircle2 size={14} className="text-gold" />}
                        </div>
                        <span className="text-[10px] text-cream-muted line-clamp-1">
                          {t.tagline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 5: GENERATE BUTTON */}
              <div className="pt-4 border-t border-gold/20 space-y-3">
                <button
                  onClick={handleGenerateFrame}
                  disabled={isGenerating}
                  className="btn-gold-shimmer w-full py-4 rounded-2xl font-display font-black text-lg flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Crafting your Goa identity...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      <span>GENERATE MY FRAME</span>
                    </>
                  )}
                </button>

                {statusMessage && (
                  <p className="text-xs font-mono-code text-gold text-center animate-fade-in">
                    {statusMessage}
                  </p>
                )}
              </div>

            </div>

          </section>

          {/* RIGHT: Large Sticky Live Frame Preview */}
          <section className={`lg:col-span-6 sticky top-24 ${activeTab === "edit" ? "hidden lg:block" : "block"}`}>

            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono-code">
                <Sparkles size={14} className="animate-pulse" />
                <span>LIVE PREVIEW STUDIO</span>
              </div>

              {/* Live Preview Component */}
              <FramePreview
                photo={photo}
                name={name}
                stack={stack}
                teamName={teamName}
                themeId={selectedTheme}
                adjustments={adjustments}
              />

              <p className="text-xs font-mono-code text-cream-muted">
                ★ Exported PNG image will be rendered in crisp high-resolution 1200x1500 canvas.
              </p>
            </div>

          </section>

        </div>
      </main>

      {/* Result Export Modal */}
      {resultImage && (
        <ResultModal
          imageUrl={resultImage}
          filename={resultFilename}
          name={name}
          onClose={() => setResultImage(null)}
          onReset={() => {
            setResultImage(null);
            setPhoto(null);
            setName("");
            setTeamName("");
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-gold/20 py-8 px-4 text-center text-xs font-mono-code text-cream-muted">
        HH GOA 2026 DIGITAL IDENTITY PLATFORM · BUILT WITH NEXT.JS & CANVAS API
      </footer>

    </div>
  );
}