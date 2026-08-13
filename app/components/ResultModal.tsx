"use client";

import { useState } from "react";
import { Download, Share2, X, Check, Copy, Sparkles, RefreshCw } from "lucide-react";

interface ResultModalProps {
  imageUrl: string;
  filename: string;
  name: string;
  onClose: () => void;
  onReset: () => void;
}

export function ResultModal({
  imageUrl,
  filename,
  name,
  onClose,
  onReset,
}: ResultModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Just framed my HH Goa 2026 hacker identity 🌴⚡\n\nBuilder: ${name || "Builder"}\n\nBuilt for Goa.\nBuilt to ship.\n\n#FrameInGoa #HHGoa`;

  function handleDownload() {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = filename;
    a.click();
  }

  function handleShareX() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleCopyText() {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-goa-dark border-2 border-gold/40 rounded-3xl p-6 sm:p-8 card-ornate shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center hover:bg-gold/20 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-mono-code">
            <Sparkles size={14} className="animate-spin-slow" />
            <span>HH GOA 2026 IDENTITY CRAFTED</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-cream">
            YOUR GOA ID IS <span className="text-gold-gradient">READY</span>
          </h2>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
          
          {/* Left: Generated Frame Image */}
          <div className="md:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[360px] aspect-[4/5] rounded-2xl overflow-hidden border-2 border-gold shadow-2xl">
              <img
                src={imageUrl}
                alt="Generated HH Goa Frame"
                className="w-full h-full object-contain bg-black"
              />
            </div>
          </div>

          {/* Right: Actions & Share Box */}
          <div className="md:col-span-6 space-y-6">
            
            {/* Primary Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="btn-gold-shimmer w-full py-4 rounded-2xl font-display font-black text-base flex items-center justify-center gap-3 shadow-xl"
              >
                <Download size={20} />
                <span>DOWNLOAD PNG</span>
              </button>

              <button
                onClick={handleShareX}
                className="w-full py-3.5 rounded-2xl bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-display font-bold text-base flex items-center justify-center gap-3 transition-colors shadow-lg"
              >
                <Share2 size={18} />
                <span>SHARE TO X</span>
              </button>
            </div>

            {/* Social Share Copy Box */}
            <div className="p-4 rounded-xl bg-black/50 border border-gold/25 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-code text-gold">
                <span>SUGGESTED X TWEET</span>
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1 hover:text-cream transition-colors"
                >
                  {copied ? <Check size={14} className="text-lime-accent" /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <p className="text-xs text-cream-muted font-sans whitespace-pre-line leading-relaxed">
                {shareText}
              </p>
            </div>

            {/* Reset / Create Another */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onReset}
                className="btn-ornate-secondary flex-1 py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                <span>Create Another</span>
              </button>

              <button
                onClick={onClose}
                className="btn-ornate-secondary flex-1 py-3 rounded-xl font-display font-bold text-sm text-cream-muted hover:text-cream flex items-center justify-center"
              >
                <span>Back to Editor</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
