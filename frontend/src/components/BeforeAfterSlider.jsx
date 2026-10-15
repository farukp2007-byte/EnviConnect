import React, { useState } from "react";
import { api } from "../services/api";
import { Sparkles, CheckCircle2, SplitSquareVertical, Columns, ShieldCheck, Clock } from "lucide-react";

const CATEGORY_FALLBACKS = {
  illegal_dumping: {
    before: "/seed_assets/dumping_before.jpg",
    after: "/seed_assets/dumping_after.jpg",
  },
  water_pollution: {
    before: "/seed_assets/water_before.jpg",
    after: "/seed_assets/water_after.jpg",
  },
  air_pollution: {
    before: "/seed_assets/air_before.jpg",
    after: "/seed_assets/air_after.jpg",
  },
  deforestation: {
    before: "/seed_assets/tree_before.jpg",
    after: "/seed_assets/tree_after.jpg",
  },
  noise: {
    before: "/seed_assets/noise_before.jpg",
    after: "/seed_assets/noise_after.jpg",
  },
  other: {
    before: "/seed_assets/dumping_before.jpg",
    after: "/seed_assets/dumping_after.jpg",
  },
};

export const getCategoryFallback = (cat, type = "after") => {
  const c = (cat || "").toLowerCase();
  for (const key of Object.keys(CATEGORY_FALLBACKS)) {
    if (c.includes(key) || key.includes(c)) return CATEGORY_FALLBACKS[key][type];
  }
  return CATEGORY_FALLBACKS.illegal_dumping[type];
};

export default function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  title,
  resolutionNotes,
  resolvedAt,
  createdAt,
  category,
  status
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState("slider"); // 'slider' | 'side-by-side'

  const isResolvedOrClosed = status === "resolved" || status === "closed";

  // Effective URLs with guaranteed fallback for solved cases
  const effectiveBefore = beforeUrl || getCategoryFallback(category, "before");
  const effectiveAfter = afterUrl || (isResolvedOrClosed ? getCategoryFallback(category, "after") : null);

  const resolvedBeforeImg = api.assetUrl(effectiveBefore);
  const resolvedAfterImg = effectiveAfter ? api.assetUrl(effectiveAfter) : null;

  // If this case is not solved and has no authority proof yet
  if (!resolvedAfterImg && !isResolvedOrClosed) {
    return (
      <div className="envi-card p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
              Citizen Photographic Evidence (Before)
            </h4>
            <p className="text-xs text-[#A2C5BD]">
              Awaiting official field remediation & authority resolution proof
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Remediation In Progress
          </span>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-[#06D6A0]/20 max-h-[420px] bg-black/40">
          <img
            src={resolvedBeforeImg}
            alt="Citizen Before Evidence"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = api.assetUrl(getCategoryFallback(category, "before"));
            }}
            className="w-full h-full object-cover max-h-[420px]"
          />
          <div className="absolute bottom-3 left-3 bg-[#04120F]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#06D6A0]/30 text-xs text-[#E6FBF6]">
            📸 Original Citizen Evidence • {createdAt ? new Date(createdAt).toLocaleDateString() : "Active Incident"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="envi-card p-6 rounded-3xl">
      {/* Header and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif-brand font-bold text-xl text-[#E6FBF6]">
              Verified Before & After Resolution Proof
            </h3>
            <span className="bg-[#06D6A0]/20 text-[#06D6A0] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#06D6A0]/40 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Remediated & Verified
            </span>
          </div>
          <p className="text-xs text-[#A2C5BD] mt-0.5">
            Transparent comparison between citizen report and authority field remediation
          </p>
        </div>

        {/* View mode toggle */}
        <div className="bg-[#082C25] p-1 rounded-xl border border-[#06D6A0]/20 flex items-center gap-1">
          <button
            onClick={() => setViewMode("slider")}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === "slider"
                ? "bg-[#06D6A0] text-[#04120F] font-bold shadow-sm"
                : "text-[#E6FBF6] hover:text-[#06D6A0]"
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Interactive Slider</span>
          </button>
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === "side-by-side"
                ? "bg-[#06D6A0] text-[#04120F] font-bold shadow-sm"
                : "text-[#E6FBF6] hover:text-[#06D6A0]"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* Main Comparison Container */}
      {viewMode === "slider" ? (
        <div className="relative w-full h-[380px] sm:h-[460px] rounded-2xl overflow-hidden select-none border border-[#06D6A0]/30 shadow-xl bg-black">
          {/* After image (Full background layer) */}
          <img
            src={resolvedAfterImg || api.assetUrl(getCategoryFallback(category, "after"))}
            alt="After Resolution Proof"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = api.assetUrl(getCategoryFallback(category, "after"));
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 z-10 bg-[#06D6A0] text-[#04120F] text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-[#06D6A0] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 stroke-[3]" />
            <span>AFTER PROOF (Authority)</span>
          </div>

          {/* Before image (Clipped Foreground layer using clip-path to prevent distortion) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src={resolvedBeforeImg}
              alt="Before Citizen Evidence"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = api.assetUrl(getCategoryFallback(category, "before"));
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 z-10 bg-[#EF4444] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              BEFORE (Citizen)
            </div>
          </div>

          {/* Divider line and handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#06D6A0] text-[#04120F] border-2 border-white flex items-center justify-center font-bold text-xs shadow-lg">
              ⇄
            </div>
          </div>

          {/* Slider input */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            aria-label="Before and after comparison slider"
          />

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#04120F]/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#06D6A0]/30 text-[11px] text-[#A2C5BD] pointer-events-none shadow-md">
            Drag slider left / right to compare before & after
          </div>
        </div>
      ) : (
        /* Side by Side Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden border border-[#EF4444]/40 h-[360px] bg-black">
            <img
              src={resolvedBeforeImg}
              alt="Before Citizen Report"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = api.assetUrl(getCategoryFallback(category, "before"));
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-[#EF4444] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              BEFORE EVIDENCE
            </div>
            <div className="absolute bottom-3 left-3 bg-[#04120F]/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs text-[#E6FBF6]">
              Reported: {createdAt ? new Date(createdAt).toLocaleDateString() : "Origin"}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-[#06D6A0]/50 h-[360px] bg-black">
            <img
              src={resolvedAfterImg || api.assetUrl(getCategoryFallback(category, "after"))}
              alt="After Remediation Proof"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = api.assetUrl(getCategoryFallback(category, "after"));
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-[#06D6A0] text-[#04120F] text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 stroke-[3]" />
              AFTER PROOF
            </div>
            <div className="absolute bottom-3 left-3 bg-[#04120F]/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs text-[#E6FBF6]">
              Resolved: {resolvedAt ? new Date(resolvedAt).toLocaleDateString() : "Verified Remediated"}
            </div>
          </div>
        </div>
      )}

      {/* Resolution Notes Box */}
      <div className="mt-4 p-4 rounded-2xl bg-[#082C25]/80 border border-[#06D6A0]/20">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#06D6A0] mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Official Remediation Notes from Authority:</span>
        </div>
        <p className="text-sm text-[#E6FBF6] leading-relaxed">
          "{resolutionNotes || "Field inspection and site remediation completed successfully by assigned municipal response crew. Citizen photo verification archived."}"
        </p>
      </div>
    </div>
  );
}
