import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  Users,
  Copy,
  Layers,
  Sparkles,
  Award,
  Flame
} from "lucide-react";

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [trendingZones, setTrendingZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [kpisData, chartsData, zonesData] = await Promise.all([
        api.getAnalyticsKPIs(),
        api.getAnalyticsCharts(),
        api.getTrendingZones(),
      ]);
      setKpis(kpisData);
      setCharts(chartsData);
      setTrendingZones(zonesData);
    } catch (e) {
      console.error("Failed to load analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  const SEVERITY_COLORS = {
    critical: "#EF4444",
    high: "#FB923C",
    medium: "#FBBF24",
    low: "#06D6A0",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#06D6A0] uppercase tracking-wider">
              Authority & NGO Environmental Intelligence
            </span>
          </div>
          <h1 className="font-serif-brand font-bold text-3xl sm:text-4xl text-[#E6FBF6]">
            Regional Environmental Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#A2C5BD] mt-1">
            Real-time KPIs, multi-agency resolution velocity, duplicate merge efficiency, and GIS hotspot rankings.
          </p>
        </div>

        <div className="bg-[#0C4137] px-4 py-2 rounded-2xl border border-[#06D6A0]/20 text-xs text-[#06D6A0] font-semibold flex items-center gap-2 self-start sm:self-auto">
          <Sparkles className="w-4 h-4" />
          <span>Live Data Sync</span>
        </div>
      </div>

      {/* Top KPI Cards (Feature 9) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="envi-card p-6 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-xs text-[#659389]">
            <span>Average Resolution Time</span>
            <Clock className="w-4 h-4 text-[#06D6A0]" />
          </div>
          <div className="text-3xl font-extrabold text-[#06D6A0] font-serif-brand">
            {kpis ? `${kpis.avg_resolution_hours}h` : "28.5h"}
          </div>
          <div className="text-[11px] text-[#A2C5BD]">
            {kpis ? `${kpis.avg_resolution_days} days average` : "1.2 days average"}
          </div>
        </div>

        <div className="envi-card p-6 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-xs text-[#659389]">
            <span>Closed With Proof (USP)</span>
            <ShieldCheck className="w-4 h-4 text-[#06D6A0]" />
          </div>
          <div className="text-3xl font-extrabold text-[#06D6A0] font-serif-brand">
            {kpis ? `${kpis.proof_percentage}%` : "80%"}
          </div>
          <div className="text-[11px] text-[#A2C5BD]">
            {kpis ? `${kpis.cases_closed_with_proof} verified cases` : "24 verified cases"}
          </div>
        </div>

        <div className="envi-card p-6 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-xs text-[#659389]">
            <span>Active Citizen Reporters</span>
            <Users className="w-4 h-4 text-[#06D6A0]" />
          </div>
          <div className="text-3xl font-extrabold text-[#06D6A0] font-serif-brand">
            {kpis ? kpis.active_reporters_count : "18"}
          </div>
          <div className="text-[11px] text-[#A2C5BD]">
            Geo-verified contributors
          </div>
        </div>

        <div className="envi-card p-6 rounded-3xl space-y-1">
          <div className="flex items-center justify-between text-xs text-[#659389]">
            <span>Duplicate Tickets Merged</span>
            <Copy className="w-4 h-4 text-[#06D6A0]" />
          </div>
          <div className="text-3xl font-extrabold text-[#06D6A0] font-serif-brand">
            {kpis ? kpis.duplicate_merges_count : "16"}
          </div>
          <div className="text-[11px] text-[#A2C5BD]">
            Saved redundant field visits
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Open vs Resolved by Category */}
          <div className="envi-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
                  Open vs. Resolved by Category
                </h3>
                <p className="text-xs text-[#A2C5BD]">
                  Comparing current open queue against closed remediations
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.category_stats}>
                  <XAxis dataKey="category" stroke="#659389" fontSize={10} tickLine={false} />
                  <YAxis stroke="#659389" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0C4137",
                      borderColor: "rgba(6, 214, 160, 0.4)",
                      borderRadius: "16px",
                      color: "#E6FBF6",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="open" name="Open / Active" fill="#FB923C" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved & Closed" fill="#06D6A0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Severity Distribution */}
          <div className="envi-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
                  Incident Severity Distribution
                </h3>
                <p className="text-xs text-[#A2C5BD]">
                  Breakdown by environmental risk severity
                </p>
              </div>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.severity_stats}
                    dataKey="count"
                    nameKey="severity"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    label={(entry) => `${entry.severity}: ${entry.count}`}
                    labelLine={false}
                  >
                    {charts.severity_stats.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={SEVERITY_COLORS[entry.key] || "#06D6A0"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0C4137",
                      borderColor: "rgba(6, 214, 160, 0.4)",
                      borderRadius: "16px",
                      color: "#E6FBF6",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Authority Resolution Rate */}
          <div className="envi-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
                  Authority Resolution Rate (%)
                </h3>
                <p className="text-xs text-[#A2C5BD]">
                  Percentage of assigned cases remediated by agency
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.authority_stats} layout="vertical">
                  <XAxis type="number" stroke="#659389" fontSize={10} domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="#659389" fontSize={11} width={70} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Resolution Rate"]}
                    contentStyle={{
                      backgroundColor: "#0C4137",
                      borderColor: "rgba(6, 214, 160, 0.4)",
                      borderRadius: "16px",
                      color: "#E6FBF6",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="rate" name="Resolution Rate (%)" fill="#06D6A0" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: 7-Day Incident Trend */}
          <div className="envi-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
                  Past 7 Days Incident Volume
                </h3>
                <p className="text-xs text-[#A2C5BD]">
                  Newly reported violations vs. closed cases
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.timeline_stats}>
                  <defs>
                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB923C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06D6A0" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06D6A0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#659389" fontSize={10} />
                  <YAxis stroke="#659389" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0C4137",
                      borderColor: "rgba(6, 214, 160, 0.4)",
                      borderRadius: "16px",
                      color: "#E6FBF6",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reported"
                    name="Reported"
                    stroke="#FB923C"
                    fillOpacity={1}
                    fill="url(#colorReported)"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved"
                    stroke="#06D6A0"
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Top Trending Zones Risk Ranking Table (Feature 9) */}
      <div className="envi-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-brand font-bold text-xl text-[#E6FBF6] flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#EF4444]" />
              <span>Trending Environmental Risk Zones Ranking</span>
            </h3>
            <p className="text-xs text-[#A2C5BD]">
              Algorithmically computed from incident density, severity weights, and unresolved case age.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#06D6A0]/20 text-[#659389] uppercase tracking-wider">
                <th className="py-3 px-4">Rank / Zone</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Open Incidents</th>
                <th className="py-3 px-4">Critical Alerts</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4 text-right">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#06D6A0]/10">
              {trendingZones.map((z, idx) => (
                <tr key={z.zone_id} className="hover:bg-[#08231E]/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#E6FBF6]">
                    #{idx + 1} {z.zone_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#06D6A0]">{z.zone_code}</td>
                  <td className="py-3.5 px-4 font-bold text-[#FB923C]">{z.open_count}</td>
                  <td className="py-3.5 px-4 font-bold text-[#EF4444]">{z.critical_count}</td>
                  <td className="py-3.5 px-4 text-[#06D6A0] font-medium">{z.resolved_count}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#E6FBF6]">{z.risk_score}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border ${
                        z.risk_level === "red"
                          ? "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40"
                          : z.risk_level === "orange"
                          ? "bg-[#FB923C]/20 text-[#FB923C] border-[#FB923C]/40"
                          : z.risk_level === "yellow"
                          ? "bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/40"
                          : "bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/40"
                      }`}
                    >
                      {z.risk_level} Hotspot
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
