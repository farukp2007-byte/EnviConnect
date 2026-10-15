import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import EcoCertificateModal from "../components/EcoCertificateModal";
import {
  Award,
  Coins,
  ShieldCheck,
  Calendar,
  MapPin,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BadgePercent,
  Bus,
  Zap,
  Trees,
  Ticket,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Clock,
  ChevronRight,
  Info
} from "lucide-react";

export default function EcoRewardsPage({ setTab }) {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [volunteerDrives, setVolunteerDrives] = useState([]);
  const [perks, setPerks] = useState([]);
  const [certificateData, setCertificateData] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Success / ticket modal state
  const [ticketModal, setTicketModal] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState("overview"); // overview, volunteer, perks, transactions

  const fetchAllEcoData = async () => {
    try {
      setLoading(true);
      const [profData, drivesData, perksData, certRes] = await Promise.all([
        api.getEcoProfile(),
        api.getVolunteerDrives(),
        api.getGreenPerks(),
        api.getEcoCertificate()
      ]);
      setProfile(profData);
      setVolunteerDrives(drivesData);
      setPerks(perksData);
      setCertificateData(certRes);
    } catch (err) {
      console.error("Error loading eco rewards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEcoData();
  }, [user]);

  const handleEnrollDrive = async (drive) => {
    try {
      setActionLoading(true);
      const res = await api.enrollVolunteerDrive(drive.id);
      setTicketModal({
        type: "volunteer",
        title: drive.title,
        department: drive.department,
        code: res.verification_code,
        message: res.message,
        location: res.location,
        dateTime: res.date_time
      });
      // Refresh profile & drives
      await fetchAllEcoData();
    } catch (err) {
      alert(`Enrollment failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRedeemPerk = async (perk) => {
    if (!profile || profile.eco_credits < perk.cost_coins) {
      alert(`You need ${perk.cost_coins} EcoCoins to redeem this perk. You currently have ${profile?.eco_credits || 0}.`);
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.redeemGreenPerk(perk.id);
      setTicketModal({
        type: "perk",
        title: perk.title,
        issuer: perk.issuer,
        code: res.coupon_code,
        message: res.message,
        validity: res.validity
      });
      // Refresh data
      await fetchAllEcoData();
    } catch (err) {
      alert(`Redemption failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getPerkIcon = (iconName) => {
    switch (iconName) {
      case "ReceiptPercent":
        return <BadgePercent className="w-5 h-5 text-[#06D6A0]" />;
      case "Bus":
        return <Bus className="w-5 h-5 text-[#06D6A0]" />;
      case "Zap":
        return <Zap className="w-5 h-5 text-[#06D6A0]" />;
      case "Trees":
        return <Trees className="w-5 h-5 text-[#06D6A0]" />;
      case "Ticket":
        return <Ticket className="w-5 h-5 text-[#06D6A0]" />;
      default:
        return <Award className="w-5 h-5 text-[#06D6A0]" />;
    }
  };

  if (loading && !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#06D6A0] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-[#A2C5BD]">Loading Green Civic Score & EcoRewards Engine...</p>
      </div>
    );
  }

  const score = profile?.green_score || 785;
  const ecoCoins = profile?.eco_credits || 380;
  const tier = profile?.tier || "Prakrithi Mitra";

  // Score meter stroke offset calculations (range 300 to 900)
  const normalizedScore = Math.max(0, Math.min(600, score - 300));
  const strokeDashoffset = 565 - (normalizedScore / 600) * 565;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#06D6A0]/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C4137] border border-[#06D6A0]/40 text-xs font-semibold text-[#06D6A0] mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>Civic Environmental Gamification & Green Score</span>
          </div>
          <h1 className="font-serif-brand font-bold text-3xl sm:text-4xl text-[#E6FBF6]">
            EcoCredits & Civic Green Score
          </h1>
          <p className="text-xs sm:text-sm text-[#A2C5BD] max-w-2xl pt-1">
            Earn verified government credit scores for active civic reporting, ground verification audits, and state-sponsored volunteering drives in Tirupati & Seshachalam eco-zone.
          </p>
        </div>

        {/* Quick Certificate View Trigger */}
        <button
          onClick={() => setCertModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37]/20 via-[#0C4137] to-[#082C25] border-2 border-[#D4AF37]/60 text-[#E6FBF6] hover:border-[#D4AF37] font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-[#D4AF37]/10 hover:scale-102 transition-all self-start md:self-auto"
        >
          <Award className="w-5 h-5 text-[#D4AF37]" />
          <div className="text-left">
            <div className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">Government Credential</div>
            <span>View Official Certificate</span>
          </div>
          <ExternalLink className="w-4 h-4 text-[#D4AF37] ml-1" />
        </button>
      </div>

      {/* Top Hero: Score Gauge & Wallet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Animated Green Civic Score Card (7 cols) */}
        <div className="lg:col-span-7 envi-card p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            
            {/* Circular Gauge */}
            <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                {/* Background Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="transparent"
                  stroke="#08231E"
                  strokeWidth="14"
                />
                {/* Colored Progress Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="transparent"
                  stroke="url(#scoreGradient)"
                  strokeWidth="14"
                  strokeDasharray="534"
                  strokeDashoffset={534 - (normalizedScore / 600) * 534}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06D6A0" />
                    <stop offset="100%" stopColor="#D4AF37" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-[#A2C5BD] tracking-wider">Civic Score</span>
                <span className="font-mono text-3xl font-extrabold text-[#06D6A0] tracking-tight">{score}</span>
                <span className="text-[10px] text-[#D4AF37] font-semibold">/ 900 Max</span>
              </div>
            </div>

            {/* Score Information & Tier Status */}
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs font-bold text-[#D4AF37]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tier: {tier}</span>
              </div>

              <h3 className="font-serif-brand font-bold text-2xl text-[#E6FBF6]">
                Excellent Environmental Vigilance
              </h3>

              <p className="text-xs text-[#A2C5BD] leading-relaxed">
                Your civic credibility index is in the <span className="text-[#06D6A0] font-semibold">Top 4%</span> of Tirupati residents. Reports from your account receive priority validation by Municipal & APPCB officers.
              </p>

              {/* Progress to next tier */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#A2C5BD]">Next: <strong className="text-[#E6FBF6]">{profile?.next_tier}</strong></span>
                  <span className="text-[#06D6A0] font-semibold">{profile?.points_needed} pts needed</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#08231E] border border-[#06D6A0]/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#06D6A0] to-[#D4AF37] rounded-full transition-all duration-700"
                    style={{ width: `${profile?.progress_percent || 65}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-6 mt-6 border-t border-[#06D6A0]/15 text-center">
            <div className="p-2.5 rounded-2xl bg-[#08231E]/70 border border-[#06D6A0]/15">
              <div className="text-base font-bold font-mono text-[#06D6A0]">
                {profile?.stats?.verified_reports_count || 17}
              </div>
              <div className="text-[10px] text-[#A2C5BD]">Verified Reports</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#08231E]/70 border border-[#06D6A0]/15">
              <div className="text-base font-bold font-mono text-[#06D6A0]">
                {profile?.stats?.feedbacks_count || 8}
              </div>
              <div className="text-[10px] text-[#A2C5BD]">Audits Verified</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#08231E]/70 border border-[#06D6A0]/15">
              <div className="text-base font-bold font-mono text-[#D4AF37]">
                {profile?.stats?.volunteer_drives_count || 1}
              </div>
              <div className="text-[10px] text-[#A2C5BD]">Govt Drives</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#08231E]/70 border border-[#06D6A0]/15">
              <div className="text-base font-bold font-mono text-[#06D6A0]">
                {profile?.stats?.civic_accuracy_rating || 98.4}%
              </div>
              <div className="text-[10px] text-[#A2C5BD]">Accuracy Trust</div>
            </div>
          </div>
        </div>

        {/* Right: EcoCoins Wallet & Quick Redeem Perks (5 cols) */}
        <div className="lg:col-span-5 envi-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#082C25] border border-[#06D6A0] flex items-center justify-center text-[#06D6A0]">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">Civic Green Wallet</h3>
                  <p className="text-[11px] text-[#A2C5BD]">Redeemable for government benefits</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-[#A2C5BD]">Balance</div>
                <div className="font-mono text-2xl font-extrabold text-[#06D6A0] flex items-center gap-1 justify-end">
                  <span>🪙 {ecoCoins}</span>
                </div>
              </div>
            </div>

            {/* How to Earn Coins Card */}
            <div className="p-4 rounded-2xl bg-[#08231E] border border-[#06D6A0]/20 space-y-2">
              <div className="text-xs font-bold text-[#06D6A0] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>How to Earn More EcoCoins:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A2C5BD]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#06D6A0] font-bold">+50</span>
                  <span>Report violation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#06D6A0] font-bold">+20</span>
                  <span>EXIF GPS photo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#06D6A0] font-bold">+30</span>
                  <span>Verify fix audit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#D4AF37] font-bold">+150</span>
                  <span>Govt Volunteer drive</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Active Voucher / Pass Highlight */}
          {profile?.redeemed_perks && profile.redeemed_perks.length > 0 ? (
            <div className="p-3.5 rounded-2xl bg-[#0C4137] border border-[#06D6A0]/30 space-y-2">
              <div className="text-[11px] text-[#A2C5BD] uppercase font-semibold flex items-center justify-between">
                <span>Active Municipal Voucher:</span>
                <span className="text-[#06D6A0] font-mono text-xs">{profile.redeemed_perks[0].coupon_code}</span>
              </div>
              <div className="text-xs font-bold text-[#E6FBF6]">
                {profile.redeemed_perks[0].title}
              </div>
              <div className="text-[10px] text-[#A2C5BD] flex items-center justify-between">
                <span>Issuer: {profile.redeemed_perks[0].issuer}</span>
                <button
                  onClick={() => copyToClipboard(profile.redeemed_perks[0].coupon_code)}
                  className="text-[#06D6A0] hover:underline flex items-center gap-1"
                >
                  {copiedCode === profile.redeemed_perks[0].coupon_code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Code</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-[#A2C5BD]">No active vouchers redeemed yet.</p>
            </div>
          )}

          {/* Bottom Button */}
          <button
            onClick={() => setActiveTab("perks")}
            className="w-full py-2.5 rounded-2xl bg-[#06D6A0] hover:bg-[#05B789] text-[#04120F] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#06D6A0]/20"
          >
            <span>Browse Government Perks & Rebates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#06D6A0]/20 pb-2 overflow-x-auto">
        {[
          { id: "overview", label: "Overview & Ledgers" },
          { id: "volunteer", label: `Govt Volunteer Drives (${volunteerDrives.length})` },
          { id: "perks", label: `Government Perks (${perks.length})` },
          { id: "vouchers", label: "My Passes & Vouchers" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === t.id
                ? "bg-[#06D6A0] text-[#04120F] shadow-sm"
                : "text-[#A2C5BD] hover:text-[#E6FBF6] hover:bg-[#082C25]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Transaction History */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Recent EcoCoin Activity Ledger (7 cols) */}
          <div className="lg:col-span-7 envi-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6] flex items-center gap-2">
                <span>Recent Green Credit Ledger</span>
              </h3>
              <span className="text-xs text-[#A2C5BD]">Last {profile?.recent_transactions?.length || 0} activities</span>
            </div>

            <div className="space-y-2.5">
              {profile?.recent_transactions?.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-[#08231E] border border-[#06D6A0]/15 flex items-center justify-between gap-3 hover:border-[#06D6A0]/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#E6FBF6] flex items-center gap-2">
                      <span>{t.title}</span>
                      {t.reference_id && (
                        <span className="text-[10px] font-mono text-[#659389] bg-[#0C4137] px-1.5 py-0.5 rounded border border-[#06D6A0]/20">
                          {t.reference_id}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A2C5BD] line-clamp-1">{t.description}</p>
                    <div className="text-[10px] text-[#659389]">{t.created_at}</div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className={`font-mono font-bold text-sm ${t.amount >= 0 ? "text-[#06D6A0]" : "text-[#EF4444]"}`}>
                      {t.amount >= 0 ? `+${t.amount}` : t.amount} Coins
                    </div>
                    {t.score_change > 0 && (
                      <div className="text-[10px] font-semibold text-[#D4AF37]">
                        +{t.score_change} Score
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Certificate Privileges & Government Endorsements (5 cols) */}
          <div className="lg:col-span-5 envi-card p-6 rounded-3xl space-y-5">
            <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4AF37]" />
              <span>Certificate Privileges</span>
            </h3>

            <p className="text-xs text-[#A2C5BD] leading-relaxed">
              Your verified government certificate is authorized under Andhra Pradesh Municipal and Pollution Control Board regulations:
            </p>

            <div className="space-y-3 text-xs text-[#E6FBF6]">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#08231E] border border-[#06D6A0]/20">
                <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-[#06D6A0]">Priority Municipal Dispatch:</strong>
                  <p className="text-[11px] text-[#A2C5BD]">Reports submitted by Grade-A Prakrithi Mitra citizens skip preliminary phone screening and route directly to field squads.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#08231E] border border-[#06D6A0]/20">
                <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-[#06D6A0]">Official AP Forest Volunteering Badge:</strong>
                  <p className="text-[11px] text-[#A2C5BD]">Permits entry into Seshachalam eco-surveillance buffer zones during scheduled afforestation drives.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#08231E] border border-[#06D6A0]/20">
                <CheckCircle2 className="w-4 h-4 text-[#06D6A0] mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-[#06D6A0]">Tax Rebate Qualification:</strong>
                  <p className="text-[11px] text-[#A2C5BD]">Scores above 650 qualify for 5% annual municipal residential property tax discount voucher.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCertModalOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-[#082C25] hover:bg-[#0C4137] border border-[#D4AF37]/50 text-xs font-bold text-[#D4AF37] flex items-center justify-center gap-2 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Download Official Printable Certificate</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Government Volunteer Programs */}
      {activeTab === "volunteer" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif-brand font-bold text-xl text-[#E6FBF6]">
                Upcoming Government Environmental Drives
              </h3>
              <p className="text-xs text-[#A2C5BD]">
                Join authorized conservation efforts organized by AP Forest Dept, Tirupati Municipal Corporation, and APPCB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {volunteerDrives.map((drive) => (
              <div
                key={drive.id}
                className="envi-card p-6 rounded-3xl space-y-4 flex flex-col justify-between border hover:border-[#06D6A0]/60 transition-all"
              >
                <div className="space-y-3">
                  {/* Department & Reward Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-[#06D6A0] bg-[#06D6A0]/15 px-2.5 py-1 rounded-full border border-[#06D6A0]/30 uppercase tracking-wide">
                      {drive.department}
                    </span>
                    <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-1 rounded-full border border-[#D4AF37]/40 flex items-center gap-1 font-mono">
                      <span>+{drive.points_reward} Coins</span>
                      <span>(+{drive.score_boost} Score)</span>
                    </span>
                  </div>

                  <h4 className="font-serif-brand font-bold text-lg text-[#E6FBF6] leading-snug">
                    {drive.title}
                  </h4>

                  <p className="text-xs text-[#A2C5BD] leading-relaxed">
                    {drive.description}
                  </p>

                  {/* Program Metadata */}
                  <div className="space-y-2 pt-2 border-t border-[#06D6A0]/15 text-xs text-[#E6FBF6]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#06D6A0] flex-shrink-0" />
                      <span>{drive.date_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#06D6A0] flex-shrink-0" />
                      <span className="line-clamp-1">{drive.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#06D6A0] flex-shrink-0" />
                      <span>
                        <strong>{drive.enrolled_count}</strong> of {drive.max_volunteers} volunteers enrolled ({drive.spots_left} spots left)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#D4AF37]">
                      <Award className="w-4 h-4 flex-shrink-0" />
                      <span>Perks: {drive.perks}</span>
                    </div>
                  </div>
                </div>

                {/* Enrollment Button */}
                <div className="pt-4 border-t border-[#06D6A0]/15">
                  {drive.is_enrolled ? (
                    <div className="py-2.5 px-4 rounded-2xl bg-[#0C4137] border border-[#06D6A0] text-xs font-bold text-[#06D6A0] flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registered for Drive (Pass Verified)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnrollDrive(drive)}
                      disabled={actionLoading || drive.spots_left <= 0}
                      className="w-full py-2.5 rounded-2xl bg-[#06D6A0] hover:bg-[#05B789] text-[#04120F] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#06D6A0]/20 disabled:opacity-50"
                    >
                      <Users className="w-4 h-4" />
                      <span>{drive.spots_left <= 0 ? "Drive Full" : "Enroll & Earn +150 Coins"}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Government Perks & Green Marketplace */}
      {activeTab === "perks" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-serif-brand font-bold text-xl text-[#E6FBF6]">
              Government Green Perks Marketplace
            </h3>
            <p className="text-xs text-[#A2C5BD]">
              Redeem your accumulated EcoCoins for authorized property tax rebates, electric transit passes, priority grievance dispatch, and sacred nursery plants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((perk) => {
              const canAfford = ecoCoins >= perk.cost_coins;
              const hasScore = score >= perk.min_score;

              return (
                <div
                  key={perk.id}
                  className="envi-card p-6 rounded-3xl space-y-4 flex flex-col justify-between border hover:border-[#06D6A0]/60 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#082C25] border border-[#06D6A0] flex items-center justify-center">
                        {getPerkIcon(perk.icon)}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-[#06D6A0]">
                          🪙 {perk.cost_coins} Coins
                        </div>
                        <div className="text-[10px] text-[#A2C5BD]">Min Score: {perk.min_score}</div>
                      </div>
                    </div>

                    <h4 className="font-serif-brand font-bold text-base text-[#E6FBF6] leading-snug">
                      {perk.title}
                    </h4>

                    <p className="text-xs text-[#A2C5BD] leading-relaxed">
                      {perk.description}
                    </p>

                    <div className="pt-2 border-t border-[#06D6A0]/15 space-y-1 text-[11px] text-[#A2C5BD]">
                      <div>Issuer: <strong className="text-[#E6FBF6]">{perk.issuer}</strong></div>
                      <div>Validity: <strong className="text-[#E6FBF6]">{perk.validity}</strong></div>
                    </div>
                  </div>

                  {/* Redeem Action Button */}
                  <div className="pt-4 border-t border-[#06D6A0]/15">
                    <button
                      onClick={() => handleRedeemPerk(perk)}
                      disabled={actionLoading || !canAfford || !hasScore}
                      className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        canAfford && hasScore
                          ? "bg-[#06D6A0] hover:bg-[#05B789] text-[#04120F] shadow-md shadow-[#06D6A0]/20"
                          : "bg-[#08231E] border border-[#06D6A0]/20 text-[#659389] cursor-not-allowed"
                      }`}
                    >
                      <BadgePercent className="w-4 h-4" />
                      <span>
                        {!hasScore
                          ? `Requires ${perk.min_score} Score`
                          : !canAfford
                          ? `Need ${perk.cost_coins - ecoCoins} more Coins`
                          : "Redeem Official Coupon"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: My Active Passes & Vouchers */}
      {activeTab === "vouchers" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-serif-brand font-bold text-xl text-[#E6FBF6]">
              Your Active Government Passes & Coupons
            </h3>
            <p className="text-xs text-[#A2C5BD]">
              Present these verified pass codes at government offices or volunteer rally checkposts in Tirupati.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Volunteer Gate Passes */}
            {profile?.enrolled_drives?.map((enr) => (
              <div
                key={enr.enrollment_id}
                className="envi-card p-6 rounded-3xl space-y-4 border-2 border-[#06D6A0]/40 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#06D6A0] bg-[#06D6A0]/15 px-2.5 py-1 rounded-full border border-[#06D6A0]/30 uppercase">
                    Official Volunteer Gate Pass
                  </span>
                  <span className="text-xs font-bold text-[#D4AF37]">Active</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">{enr.title}</h4>
                  <p className="text-xs text-[#A2C5BD]">{enr.department}</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#08231E] border border-[#06D6A0]/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#A2C5BD] uppercase font-mono">Gate Verification Code</div>
                    <div className="text-base font-mono font-bold text-[#06D6A0]">{enr.verification_code}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(enr.verification_code)}
                    className="p-2 rounded-xl bg-[#0C4137] hover:bg-[#06D6A0] hover:text-[#04120F] transition-colors"
                  >
                    {copiedCode === enr.verification_code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-xs text-[#A2C5BD] space-y-1">
                  <div>📅 Time: <strong className="text-[#E6FBF6]">{enr.date_time}</strong></div>
                  <div>📍 Location: <strong className="text-[#E6FBF6]">{enr.location}</strong></div>
                </div>
              </div>
            ))}

            {/* Redeemed Municipal Perks */}
            {profile?.redeemed_perks?.map((perk) => (
              <div
                key={perk.redemption_id}
                className="envi-card p-6 rounded-3xl space-y-4 border-2 border-[#D4AF37]/40 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-1 rounded-full border border-[#D4AF37]/30 uppercase">
                    {perk.category} Voucher
                  </span>
                  <span className="text-xs font-bold text-[#06D6A0]">Verified</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">{perk.title}</h4>
                  <p className="text-xs text-[#A2C5BD]">Issued by: {perk.issuer}</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#08231E] border border-[#D4AF37]/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#A2C5BD] uppercase font-mono">Municipal Coupon Code</div>
                    <div className="text-base font-mono font-bold text-[#D4AF37]">{perk.coupon_code}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(perk.coupon_code)}
                    className="p-2 rounded-xl bg-[#0C4137] hover:bg-[#D4AF37] hover:text-[#04120F] transition-colors"
                  >
                    {copiedCode === perk.coupon_code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-xs text-[#A2C5BD]">
                  Validity: <strong className="text-[#E6FBF6]">{perk.validity}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket / Confirmation Modal */}
      {ticketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0C4137] border-2 border-[#06D6A0] rounded-3xl w-full max-w-md p-6 sm:p-7 space-y-5 shadow-2xl relative text-center">
            <button
              onClick={() => setTicketModal(null)}
              className="absolute top-5 right-5 text-[#A2C5BD] hover:text-white"
            >
              <Check className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#082C25] border-2 border-[#06D6A0] flex items-center justify-center mx-auto text-[#06D6A0] shadow-lg shadow-[#06D6A0]/20">
              {ticketModal.type === "volunteer" ? <Users className="w-7 h-7" /> : <BadgePercent className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <h3 className="font-serif-brand font-bold text-2xl text-[#E6FBF6]">
                {ticketModal.type === "volunteer" ? "Volunteer Registered!" : "Perk Redeemed!"}
              </h3>
              <p className="text-xs text-[#A2C5BD]">{ticketModal.message}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#08231E] border border-[#06D6A0]/30 space-y-2">
              <div className="text-[10px] text-[#A2C5BD] uppercase font-mono">
                {ticketModal.type === "volunteer" ? "Your Volunteer Gate Pass" : "Official Municipal Coupon Code"}
              </div>
              <div className="font-mono text-xl font-bold text-[#06D6A0] tracking-wider">
                {ticketModal.code}
              </div>
              <button
                onClick={() => copyToClipboard(ticketModal.code)}
                className="mx-auto px-3 py-1 rounded-xl bg-[#06D6A0] text-[#04120F] text-xs font-bold flex items-center gap-1 hover:bg-[#05B789]"
              >
                {copiedCode === ticketModal.code ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === ticketModal.code ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            {ticketModal.type === "volunteer" && (
              <div className="text-xs text-left bg-[#082C25] p-3 rounded-xl border border-[#06D6A0]/20 space-y-1 text-[#A2C5BD]">
                <div>📍 Report At: <strong className="text-[#E6FBF6]">{ticketModal.location}</strong></div>
                <div>🕒 Time: <strong className="text-[#E6FBF6]">{ticketModal.dateTime}</strong></div>
              </div>
            )}

            <button
              onClick={() => setTicketModal(null)}
              className="w-full py-2.5 rounded-2xl bg-[#06D6A0] text-[#04120F] text-xs font-bold hover:bg-[#05B789]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      <EcoCertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        certData={certificateData}
      />
    </div>
  );
}
