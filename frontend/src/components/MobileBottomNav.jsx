import React from "react";
import { Home, MapPin, PlusCircle, FileText, BarChart3, ShieldAlert, Coins } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function MobileBottomNav({ currentTab, setTab }) {
  const { role } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#08231E]/95 backdrop-blur-xl border-t border-[#06D6A0]/20 px-3 py-2 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          onClick={() => setTab("home")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentTab === "home" ? "text-[#06D6A0] font-bold" : "text-[#A2C5BD] hover:text-[#E6FBF6]"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        {/* GIS Map */}
        <button
          onClick={() => setTab("map")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentTab === "map" ? "text-[#06D6A0] font-bold" : "text-[#A2C5BD] hover:text-[#E6FBF6]"
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>Map</span>
        </button>

        {/* Center Floating Action Button: Report Violation */}
        <button
          onClick={() => setTab("report")}
          className="flex flex-col items-center -mt-6 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-[#06D6A0] to-[#0C4137] text-[#04120F] flex items-center justify-center shadow-lg shadow-[#06D6A0]/40 border-2 border-[#FFFFFF] group-hover:scale-105 transition-transform p-3">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-[#06D6A0] mt-1">Report</span>
        </button>

        {/* EcoRewards */}
        <button
          onClick={() => setTab("rewards")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            currentTab === "rewards" ? "text-[#06D6A0] font-bold" : "text-[#A2C5BD] hover:text-[#E6FBF6]"
          }`}
        >
          <Coins className="w-5 h-5" />
          <span>Rewards</span>
        </button>

        {/* Role contextual: Queue for Authority, My Reports for Citizen */}
        {role === "authority" ? (
          <button
            onClick={() => setTab("authority")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              currentTab === "authority" ? "text-[#06D6A0] font-bold" : "text-[#A2C5BD] hover:text-[#E6FBF6]"
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Queue</span>
          </button>
        ) : (
          <button
            onClick={() => setTab("my-reports")}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              currentTab === "my-reports" ? "text-[#06D6A0] font-bold" : "text-[#A2C5BD] hover:text-[#E6FBF6]"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Reports</span>
          </button>
        )}
      </div>
    </div>
  );
}
