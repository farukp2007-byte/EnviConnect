import React from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, User, Building2, Eye, Award, Sparkles, Check } from "lucide-react";

export default function RoleBanner() {
  const { user, quickSwitchRole } = useAuth();

  const roles = [
    { key: "citizen", label: "Citizen", icon: User, desc: "Report & Track Fixes" },
    { key: "mct", label: "MCT Officer", icon: Building2, desc: "Garbage & Noise Queue" },
    { key: "appcb", label: "APPCB Officer", icon: Shield, desc: "Air & River Effluents" },
    { key: "ngo", label: "NGO Analyst", icon: Eye, desc: "GIS Analytics Read-Only" },
    { key: "admin", label: "Admin", icon: Award, desc: "Routing Rules & Zones" },
  ];

  return (
    <div className="bg-[#08231E]/95 border-b border-[#06D6A0]/20 py-2.5 px-4 backdrop-blur-md sticky top-0 z-50 text-xs shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06D6A0] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06D6A0]"></span>
          </span>
          <span className="text-[#A2C5BD] font-medium hidden sm:inline">Active Demo Persona:</span>
          <span className="font-semibold text-[#E6FBF6] bg-[#0C4137] px-2.5 py-1 rounded-full border border-[#06D6A0]/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#06D6A0]" />
            {user?.full_name || "Guest Citizen"}
            <span className="text-[#06D6A0] uppercase font-bold text-[10px] tracking-wider ml-1">
              ({user?.role || "citizen"})
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[#659389] mr-1 hidden md:inline">1-Click Switch:</span>
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive =
              (r.key === "citizen" && user?.email === "citizen@envi.gov") ||
              (r.key === "mct" && user?.email === "mct.officer@tirupati.gov") ||
              (r.key === "appcb" && user?.email === "appcb.officer@appcb.gov") ||
              (r.key === "ngo" && user?.email === "ngo@greenaction.org") ||
              (r.key === "admin" && user?.email === "admin@envi.gov");

            return (
              <button
                key={r.key}
                onClick={() => quickSwitchRole(r.key)}
                className={`px-3 py-1 rounded-xl flex items-center gap-1.5 transition-all duration-200 border whitespace-nowrap ${
                  isActive
                    ? "bg-[#06D6A0] text-[#04120F] font-bold border-[#06D6A0] shadow-sm shadow-[#06D6A0]/40"
                    : "bg-[#0C4137]/80 hover:bg-[#0C4137] text-[#E6FBF6] border-[#06D6A0]/20 hover:border-[#06D6A0]/50"
                }`}
                title={r.desc}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#04120F]" : "text-[#06D6A0]"}`} />
                <span>{r.label}</span>
                {isActive && <Check className="w-3 h-3 text-[#04120F] stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
