import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  AlertTriangle,
  MapPin,
  FileText,
  BarChart3,
  ShieldAlert,
  Bell,
  PlusCircle,
  Menu,
  X,
  LogOut,
  Sliders,
  Sparkles,
  Smartphone,
  Coins,
  Award
} from "lucide-react";

export default function Navbar({ currentTab, setTab, onOpenAuth, onOpenNotifications, onOpenMobileAccess, unreadCount }) {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "report", label: "Report Violation", icon: PlusCircle, highlight: true },
    { id: "map", label: "GIS Heatmap", icon: MapPin },
    { id: "my-reports", label: "My Reports", icon: FileText, roles: ["citizen", "guest"] },
    { id: "rewards", label: "EcoRewards", icon: Coins },
    { id: "authority", label: "Authority Queue", icon: ShieldAlert, roles: ["authority", "admin"] },
    { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["authority", "ngo", "admin"] },
    { id: "admin", label: "Admin Rules", icon: Sliders, roles: ["admin"] },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role) || role === "admin"
  );

  return (
    <header className="bg-[#0C4137]/80 backdrop-blur-xl border-b border-[#06D6A0]/15 sticky top-10 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Monestra Brand Mark */}
          <div
            onClick={() => setTab("home")}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#082C25] border-2 border-[#06D6A0] flex items-center justify-center shadow-lg shadow-[#06D6A0]/20 group-hover:scale-105 transition-transform duration-200">
              {/* Geometric crossing diagonal lines emblem */}
              <svg className="w-6 h-6 text-[#06D6A0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
                <circle cx="12" cy="12" r="3" fill="#06D6A0" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-brand font-bold text-2xl tracking-tight text-[#E6FBF6]">
                  ENVI CONNECT
                </span>
                <span className="text-[10px] font-bold text-[#06D6A0] bg-[#06D6A0]/15 px-1.5 py-0.5 rounded border border-[#06D6A0]/30 tracking-wider">
                  GIS + AI
                </span>
              </div>
              <p className="text-[11px] text-[#A2C5BD] tracking-wider uppercase font-medium">
                Tirupati Regional Environment Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              if (item.highlight) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className="ml-2 px-4 py-2.5 rounded-2xl bg-gradient-to-b from-[#06D6A0] to-[#0C4137] text-[#04120F] font-bold text-sm flex items-center gap-2 shadow-md shadow-[#06D6A0]/25 hover:shadow-lg hover:shadow-[#06D6A0]/40 transition-all border border-[#06D6A0]"
                  >
                    <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>Report Incident</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`px-3.5 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? "bg-[#06D6A0]/15 text-[#06D6A0] border border-[#06D6A0]/40 font-semibold"
                      : "text-[#E6FBF6]/90 hover:text-[#06D6A0] hover:bg-[#082C25]/60"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-[#06D6A0]" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Notification Center & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Access QR launcher */}
            <button
              onClick={onOpenMobileAccess}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#082C25] border border-[#06D6A0]/30 hover:border-[#06D6A0] text-xs font-semibold text-[#06D6A0] transition-all hover:bg-[#06D6A0]/10 shadow-sm"
              title="Scan QR to open on Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Mobile App</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-2xl bg-[#082C25] border border-[#06D6A0]/20 hover:border-[#06D6A0]/60 text-[#E6FBF6] hover:text-[#06D6A0] transition-colors"
              title="Notification Center"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#0C4137] shadow">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* EcoCredits & Civic Score Quick Pill */}
            <button
              onClick={() => setTab("rewards")}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition-all shadow-sm ${
                currentTab === "rewards"
                  ? "bg-[#06D6A0] text-[#04120F] border-[#06D6A0]"
                  : "bg-[#082C25] border-[#06D6A0]/40 text-[#06D6A0] hover:border-[#06D6A0] hover:bg-[#06D6A0]/10"
              }`}
              title="Green Civic Score: 785 • EcoCoins: 380"
            >
              <Coins className={`w-3.5 h-3.5 ${currentTab === "rewards" ? "text-[#04120F]" : "text-[#D4AF37]"}`} />
              <span className="text-xs font-mono font-bold">380</span>
              <span className={`text-[10px] pl-1.5 ml-0.5 border-l font-semibold ${
                currentTab === "rewards" ? "border-[#04120F]/30 text-[#04120F]" : "border-[#06D6A0]/30 text-[#D4AF37]"
              }`}>
                ⭐ 785
              </span>
            </button>

            {/* User profile / Logout */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-[#06D6A0]/20">
                <div className="text-right">
                  <div className="text-xs font-semibold text-[#E6FBF6] max-w-[130px] truncate">
                    {user.full_name}
                  </div>
                  <div className="text-[10px] text-[#06D6A0] capitalize">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-[#082C25] hover:bg-[#EF4444]/20 border border-[#06D6A0]/20 hover:border-[#EF4444]/50 text-[#A2C5BD] hover:text-[#EF4444] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-2xl bg-[#082C25] border border-[#06D6A0]/40 text-[#E6FBF6] hover:bg-[#06D6A0] hover:text-[#04120F] font-semibold text-xs transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-2xl bg-[#082C25] border border-[#06D6A0]/20 text-[#E6FBF6]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#06D6A0]/15 space-y-1.5 animate-fadeIn">
            {/* Quick Mobile Access button in drawer */}
            <button
              onClick={() => {
                onOpenMobileAccess();
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 rounded-xl text-left text-sm font-semibold flex items-center gap-3 text-[#06D6A0] bg-[#082C25] border border-[#06D6A0]/30"
            >
              <Smartphone className="w-4 h-4" />
              <span>Connect Phone (QR & Wi-Fi URL)</span>
            </button>

            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-medium flex items-center gap-3 ${
                    currentTab === item.id
                      ? "bg-[#06D6A0] text-[#04120F] font-bold"
                      : "text-[#E6FBF6] hover:bg-[#082C25]"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
