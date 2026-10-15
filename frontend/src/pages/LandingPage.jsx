import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  ShieldAlert,
  MapPin,
  Camera,
  Bot,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Users,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
  Coins,
  Award
} from "lucide-react";
import { getCategoryFallback } from "../components/BeforeAfterSlider";

export default function LandingPage({ setTab, onSelectReport }) {
  const [kpis, setKpis] = useState(null);
  const [resolvedShowcase, setResolvedShowcase] = useState([]);

  useEffect(() => {
    api.getAnalyticsKPIs()
      .then((data) => setKpis(data))
      .catch((e) => console.error(e));

    api.getReports({ status: "closed" })
      .then((data) => {
        const valid = (data || []).filter(inc => inc.primary_image_url);
        // Deduplicate titles to ensure diverse category showcase (e.g. dumping, water, air, trees)
        const seenTitles = new Set();
        const diverse = [];
        for (const inc of valid) {
          if (!seenTitles.has(inc.title)) {
            seenTitles.add(inc.title);
            diverse.push(inc);
          }
        }
        setResolvedShowcase(diverse.slice(0, 3));
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section with Glowing Mesh Gradient */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden text-center">
        {/* Soft glowing mesh background in greens */}
        <div className="mesh-glow w-[550px] h-[550px] bg-[#06D6A0]/20 top-[-80px] left-1/2 -translate-x-1/2"></div>
        <div className="mesh-glow w-[380px] h-[380px] bg-[#0C4137]/60 top-[120px] left-1/3"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0C4137] border border-[#06D6A0]/40 text-[#06D6A0] text-xs font-semibold shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Enabled • GIS-Based • Multi-Agency Response Platform</span>
          </div>

          <h1 className="font-serif-brand font-bold text-4xl sm:text-6xl lg:text-7xl text-[#E6FBF6] tracking-tight leading-[1.1]">
            Citizens Report. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06D6A0] via-[#2EE5B6] to-[#E6FBF6]">
              Authorities Respond.
            </span> <br />
            Earth Restores.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#A2C5BD] leading-relaxed">
            Report environmental violations with photo, video, and GPS evidence. Powered by scikit-learn NLP auto-tagging, 100m spatial duplicate merging, and automated routing to the Municipal Corporation, Pollution Control Board, and Forest Department.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setTab("report")}
              className="envi-btn-primary text-base py-3.5 px-8 text-[#04120F] font-bold rounded-2xl shadow-xl shadow-[#06D6A0]/30 hover:scale-105"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>Report Violation with GPS Evidence</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => setTab("map")}
              className="envi-btn-secondary text-base py-3.5 px-7 rounded-2xl font-semibold"
            >
              <MapPin className="w-5 h-5 text-[#06D6A0]" />
              <span>Explore GIS Heatmap</span>
            </button>

            <button
              onClick={() => setTab("authority")}
              className="px-6 py-3.5 rounded-2xl bg-[#082C25] hover:bg-[#0C4137] text-[#E6FBF6] border border-[#06D6A0]/20 font-semibold text-sm transition-all"
            >
              <span>Authority Dashboard →</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live KPI Metric Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="envi-card p-6 rounded-3xl relative overflow-hidden">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#06D6A0] font-serif-brand">
              {kpis ? kpis.total_incidents : "30"}
            </div>
            <div className="text-xs text-[#A2C5BD] font-semibold uppercase tracking-wider mt-1">
              Active Regional Incidents
            </div>
            <p className="text-[11px] text-[#659389] mt-2">
              Seeded across 5 Tirupati municipal wards
            </p>
          </div>

          <div className="envi-card p-6 rounded-3xl relative overflow-hidden">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#06D6A0] font-serif-brand">
              {kpis ? `${kpis.proof_percentage}%` : "80%"}
            </div>
            <div className="text-xs text-[#A2C5BD] font-semibold uppercase tracking-wider mt-1">
              Resolved With Proof
            </div>
            <p className="text-[11px] text-[#659389] mt-2">
              Before & After photo verification
            </p>
          </div>

          <div className="envi-card p-6 rounded-3xl relative overflow-hidden">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#06D6A0] font-serif-brand">
              {kpis ? `${kpis.avg_resolution_hours}h` : "28.5h"}
            </div>
            <div className="text-xs text-[#A2C5BD] font-semibold uppercase tracking-wider mt-1">
              Avg. Resolution Time
            </div>
            <p className="text-[11px] text-[#659389] mt-2">
              From report to field remediation
            </p>
          </div>

          <div className="envi-card p-6 rounded-3xl relative overflow-hidden">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#06D6A0] font-serif-brand">
              {kpis ? kpis.duplicate_merges_count : "16"}
            </div>
            <div className="text-xs text-[#A2C5BD] font-semibold uppercase tracking-wider mt-1">
              Duplicate Tickets Merged
            </div>
            <p className="text-[11px] text-[#659389] mt-2">
              Haversine &lt;100m auto-merge USP
            </p>
          </div>
        </div>
      </section>

      {/* 4 Core Architectural USPs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#06D6A0] uppercase tracking-wider">
            Engineered For Impact
          </span>
          <h2 className="font-serif-brand font-bold text-3xl sm:text-4xl text-[#E6FBF6]">
            Four Core Innovations
          </h2>
          <p className="text-xs sm:text-sm text-[#A2C5BD]">
            Every feature works seamlessly end-to-end across citizen and administrative workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* USP 1 */}
          <div className="envi-card p-6 rounded-3xl space-y-4 relative group">
            <div className="w-12 h-12 rounded-2xl bg-[#082C25] border border-[#06D6A0]/40 flex items-center justify-center text-[#06D6A0] group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
              1. NLP Auto-Classification
            </h3>
            <p className="text-xs text-[#A2C5BD] leading-relaxed">
              Scikit-learn TF-IDF + Logistic Regression analyses complaint descriptions in real-time to suggest category and severity (Low, Medium, High, Critical) with confidence scores.
            </p>
            <div className="text-[11px] text-[#06D6A0] font-medium flex items-center gap-1">
              <span>Try typing in Report form</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* USP 2 */}
          <div className="envi-card p-6 rounded-3xl space-y-4 relative group border-[#06D6A0]/30 shadow-lg shadow-[#06D6A0]/10">
            <div className="w-12 h-12 rounded-2xl bg-[#082C25] border border-[#06D6A0]/40 flex items-center justify-center text-[#06D6A0] group-hover:scale-110 transition-transform">
              <Copy className="w-6 h-6" />
            </div>
            <div className="inline-block bg-[#06D6A0]/20 text-[#06D6A0] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#06D6A0]/30">
              KEY USP
            </div>
            <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
              2. 100m Duplicate Merge
            </h3>
            <p className="text-xs text-[#A2C5BD] leading-relaxed">
              When citizens report near an existing open violation (&lt;100m Haversine distance), new evidence is automatically linked to the active ticket, incrementing the reporter count instead of duplicating paperwork.
            </p>
          </div>

          {/* USP 3 */}
          <div className="envi-card p-6 rounded-3xl space-y-4 relative group">
            <div className="w-12 h-12 rounded-2xl bg-[#082C25] border border-[#06D6A0]/40 flex items-center justify-center text-[#06D6A0] group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
              3. Automated Authority Routing
            </h3>
            <p className="text-xs text-[#A2C5BD] leading-relaxed">
              Rule engine evaluates violation category and geospatial ward to assign the ticket directly to MCT (Sanitation), APPCB (Pollution), Forest Dept, or TUDA with instant dashboard notification.
            </p>
          </div>

          {/* USP 4 */}
          <div className="envi-card p-6 rounded-3xl space-y-4 relative group border-[#06D6A0]/30">
            <div className="w-12 h-12 rounded-2xl bg-[#082C25] border border-[#06D6A0]/40 flex items-center justify-center text-[#06D6A0] group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="inline-block bg-[#06D6A0]/20 text-[#06D6A0] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#06D6A0]/30">
              KEY USP
            </div>
            <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
              4. Citizen Proof & Escalation
            </h3>
            <p className="text-xs text-[#A2C5BD] leading-relaxed">
              When an authority marks a report resolved, citizens verify: "Was this actually fixed?" If Yes, closed with proof. If No, instantly reopened and escalated to CRITICAL with senior officer alerts.
            </p>
          </div>
        </div>
      </section>

      {/* NEW: Green Civic Score & Government Volunteer Privileges Feature Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0C4137] via-[#09352C] to-[#08231E] border-2 border-[#06D6A0]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-xs font-bold text-[#D4AF37]">
              <Coins className="w-3.5 h-3.5" />
              <span>Civic Gamification & State Recognition</span>
            </div>
            <h3 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#E6FBF6]">
              Earn Green Civic Credit Scores & Government Privileges
            </h3>
            <p className="text-xs sm:text-sm text-[#A2C5BD] leading-relaxed">
              Every complaint filed with GPS evidence, resolution verified, and cleanup audited earns you <strong className="text-[#06D6A0]">EcoCredits</strong> and a formal <strong className="text-[#06D6A0]">Green Civic Credit Score (300–900)</strong>. Earn downloadable government certificates, qualify for <strong className="text-[#D4AF37]">5% Municipal Property Tax Rebates</strong>, and enroll in official AP Forest & APPCB volunteering drives.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={() => setTab("rewards")}
              className="px-6 py-3 rounded-2xl bg-[#06D6A0] hover:bg-[#05B789] text-[#04120F] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#06D6A0]/25"
            >
              <Award className="w-4 h-4" />
              <span>Explore EcoRewards & Certificate</span>
            </button>
            <button
              onClick={() => setTab("report")}
              className="px-6 py-2.5 rounded-2xl bg-[#082C25] hover:bg-[#0C4137] border border-[#06D6A0]/40 text-xs font-semibold text-[#E6FBF6] flex items-center justify-center gap-2"
            >
              <span>Report to Earn +50 Coins</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#06D6A0]" />
            </button>
          </div>
        </div>
      </section>

      {/* Showcase of Verified Before & After Proof Cases */}
      {resolvedShowcase.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#06D6A0] uppercase tracking-wider">
                Public Transparency
              </span>
              <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-[#E6FBF6]">
                Verified Resolutions with Before & After Proof
              </h2>
            </div>
            <button
              onClick={() => setTab("map")}
              className="text-xs font-semibold text-[#06D6A0] hover:underline flex items-center gap-1"
            >
              <span>View All on Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resolvedShowcase.map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectReport(inc.id)}
                className="envi-card rounded-3xl overflow-hidden cursor-pointer group flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-black">
                  <div className="grid grid-cols-2 h-full">
                    <div className="relative h-full">
                      <img
                        src={api.assetUrl(inc.primary_image_url || getCategoryFallback(inc.category, "before"))}
                        alt="Before"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = api.assetUrl(getCategoryFallback(inc.category, "before"));
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 left-2 bg-[#EF4444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        BEFORE
                      </span>
                    </div>
                    <div className="relative h-full border-l border-white/20">
                      <img
                        src={api.assetUrl(inc.after_image_url || getCategoryFallback(inc.category, "after"))}
                        alt="After Proof"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = api.assetUrl(getCategoryFallback(inc.category, "after"));
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 right-2 bg-[#06D6A0] text-[#04120F] text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                        AFTER PROOF
                      </span>
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 bg-[#04120F]/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-[#06D6A0] border border-[#06D6A0]/30">
                    {inc.incident_number}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-[#E6FBF6] line-clamp-1 group-hover:text-[#06D6A0] transition-colors">
                      {inc.title}
                    </h4>
                    <p className="text-xs text-[#A2C5BD] line-clamp-2 mt-1">
                      {inc.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#06D6A0]/10 flex items-center justify-between text-[11px] text-[#659389]">
                    <span>{inc.authority_name}</span>
                    <span className="text-[#06D6A0] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Regional Municipal Info Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="envi-card p-8 rounded-3xl bg-gradient-to-r from-[#0C4137] to-[#08231E] border border-[#06D6A0]/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="font-serif-brand font-bold text-2xl text-[#E6FBF6]">
              Serving Greater Tirupati & Seshachalam Eco-Zone
            </h3>
            <p className="text-xs text-[#A2C5BD] leading-relaxed">
              Covering 50 Corporation Wards, Renigunta industrial parks, Swarnamukhi river drainage basin, and Alipiri pilgrimage gateway.
            </p>
          </div>
          <button
            onClick={() => setTab("report")}
            className="envi-btn-primary py-3 px-6 text-sm whitespace-nowrap"
          >
            <span>File a Geo-Tagged Complaint</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
