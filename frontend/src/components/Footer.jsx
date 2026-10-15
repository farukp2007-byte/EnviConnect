import React from "react";
import { Shield, MapPin, Heart, ExternalLink } from "lucide-react";

export default function Footer({ setTab }) {
  return (
    <footer className="bg-[#08231E] border-t border-[#06D6A0]/15 pt-12 pb-8 mt-20 text-xs text-[#A2C5BD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#082C25] border border-[#06D6A0] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#06D6A0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                  <circle cx="12" cy="12" r="3" fill="#06D6A0" />
                </svg>
              </div>
              <span className="font-serif-brand font-bold text-xl text-[#E6FBF6]">
                ENVI CONNECT
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#A2C5BD]">
              AI-enabled, GIS-based Environmental Incident Reporting & Multi-Agency Response Platform serving the Tirupati District and sacred Seshachalam biosphere region.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-semibold text-sm text-[#E6FBF6] mb-3">Platform Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setTab("report")} className="hover:text-[#06D6A0] transition-colors">
                  Report Environmental Violation
                </button>
              </li>
              <li>
                <button onClick={() => setTab("map")} className="hover:text-[#06D6A0] transition-colors">
                  GIS Live Heatmap & Zones
                </button>
              </li>
              <li>
                <button onClick={() => setTab("my-reports")} className="hover:text-[#06D6A0] transition-colors">
                  Citizen "My Reports" Tracker
                </button>
              </li>
              <li>
                <button onClick={() => setTab("authority")} className="hover:text-[#06D6A0] transition-colors">
                  Authority Resolution Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setTab("analytics")} className="hover:text-[#06D6A0] transition-colors">
                  Public Transparency Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Jurisdictions & Authorities */}
          <div>
            <h4 className="font-semibold text-sm text-[#E6FBF6] mb-3">Responding Authorities</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0]"></span>
                <span>Municipal Corporation of Tirupati (MCT)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0]"></span>
                <span>AP Pollution Control Board (APPCB)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0]"></span>
                <span>Tirupati Forest Division (Seshachalam Wing)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0]"></span>
                <span>Tirupati Urban Development Authority (TUDA)</span>
              </li>
            </ul>
          </div>

          {/* Core USPs */}
          <div>
            <h4 className="font-semibold text-sm text-[#E6FBF6] mb-3">Platform USPs</h4>
            <div className="space-y-2 text-[11px] bg-[#0C4137]/60 p-3 rounded-2xl border border-[#06D6A0]/20">
              <div className="text-[#06D6A0] font-semibold">⚡ Duplicate Auto-Merge:</div>
              <p className="text-[#A2C5BD]">Reports within 100m are unified to consolidate civic evidence without duplicate work.</p>
              <div className="text-[#06D6A0] font-semibold mt-1">🔄 Citizen Verification:</div>
              <p className="text-[#A2C5BD]">Cases are only closed with citizen proof; negative verification escalates to Critical priority.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#06D6A0]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#659389]">
          <div>
            &copy; {new Date().getFullYear()} ENVI CONNECT Tirupati. Built for public environmental transparency.
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="text-[#06D6A0] font-semibold">FastAPI + React + Scikit-Learn</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
