import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import LeafletMap from "../components/LeafletMap";
import {
  MapPin,
  Layers,
  Filter,
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Flame,
  Info
} from "lucide-react";

export default function PublicMapPage({ onSelectReport }) {
  const [incidents, setIncidents] = useState([]);
  const [trendingZones, setTrendingZones] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, [categoryFilter, severityFilter, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, zonesData] = await Promise.all([
        api.getReports({
          category: categoryFilter,
          severity: severityFilter,
          status: statusFilter,
          search: searchQuery,
        }),
        api.getTrendingZones(),
      ]);
      setIncidents(reportsData);
      setTrendingZones(zonesData);
    } catch (e) {
      console.error("Failed to load map data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06D6A0] animate-pulse"></span>
            <span className="text-xs font-bold text-[#06D6A0] uppercase tracking-wider">
              Real-Time GIS Environmental Surveillance
            </span>
          </div>
          <h1 className="font-serif-brand font-bold text-3xl sm:text-4xl text-[#E6FBF6]">
            Tirupati Regional Incident Map & Heatmap
          </h1>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[280px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search landmark, keyword, ID..."
            className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-[#08231E] border border-[#06D6A0]/25 text-xs text-[#E6FBF6] placeholder-[#659389] focus:outline-none focus:border-[#06D6A0]"
          />
          <Search className="w-4 h-4 text-[#659389] absolute left-3.5 top-3" />
        </form>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-1 text-xs">
        <span className="text-[#659389] font-medium flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5 text-[#06D6A0]" />
          Filter:
        </span>

        {/* Category Pills */}
        {[
          { id: "all", label: "All Categories" },
          { id: "illegal_dumping", label: "🗑️ Dumping" },
          { id: "air_pollution", label: "🏭 Air" },
          { id: "water_pollution", label: "💧 Water" },
          { id: "deforestation", label: "🌲 Forest" },
          { id: "noise", label: "📢 Noise" },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              categoryFilter === c.id
                ? "bg-[#06D6A0] text-[#04120F] font-bold border-[#06D6A0] shadow-sm shadow-[#06D6A0]/30"
                : "bg-[#0C4137]/60 text-[#E6FBF6] border-[#06D6A0]/20 hover:border-[#06D6A0]/50"
            }`}
          >
            {c.label}
          </button>
        ))}

        <div className="h-4 w-[1px] bg-[#06D6A0]/20 mx-1 hidden sm:block"></div>

        {/* Severity Pills */}
        {[
          { id: "all", label: "All Severities" },
          { id: "critical", label: "Critical", color: "text-[#EF4444]" },
          { id: "high", label: "High", color: "text-[#FB923C]" },
          { id: "medium", label: "Medium", color: "text-[#FBBF24]" },
          { id: "low", label: "Low", color: "text-[#06D6A0]" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSeverityFilter(s.id)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
              severityFilter === s.id
                ? "bg-[#082C25] text-[#06D6A0] border-[#06D6A0] font-bold"
                : "bg-[#0C4137]/40 text-[#A2C5BD] border-transparent hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Map + Side Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Leaflet Map Component (3 cols) */}
        <div className="lg:col-span-3">
          <LeafletMap
            incidents={incidents}
            trendingZones={trendingZones}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            height="580px"
            showHeatmapDefault={true}
          />
        </div>

        {/* Side Details Drawer (1 col) */}
        <div className="space-y-4">
          {/* Selected Incident Card */}
          {selectedIncident ? (
            <div className="envi-card p-5 rounded-3xl space-y-3.5 border-[#06D6A0]/40 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#06D6A0] bg-[#082C25] px-2 py-0.5 rounded border border-[#06D6A0]/30">
                  {selectedIncident.incident_number}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#06D6A0]/15 text-[#06D6A0] border border-[#06D6A0]/30">
                  {selectedIncident.status.replace("_", " ")}
                </span>
              </div>

              {/* Image Preview */}
              <div className="h-32 rounded-2xl overflow-hidden bg-black relative border border-[#06D6A0]/20">
                <img
                  src={api.assetUrl(selectedIncident.primary_image_url)}
                  alt="Incident evidence"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/seed_assets/default_dumping.jpg";
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-[#04120F]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-[#A2C5BD]">
                  📸 Citizen Evidence
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#E6FBF6] line-clamp-2">
                  {selectedIncident.title}
                </h4>
                <p className="text-xs text-[#A2C5BD] line-clamp-2 mt-1">
                  {selectedIncident.description}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-[#A2C5BD] pt-2 border-t border-[#06D6A0]/10">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="text-[#E6FBF6] capitalize font-medium">
                    {selectedIncident.category.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned:</span>
                  <span className="text-[#06D6A0] font-medium">{selectedIncident.authority_name}</span>
                </div>
                {selectedIncident.reporters_count > 1 && (
                  <div className="flex justify-between text-[#06D6A0] font-semibold bg-[#082C25] p-1.5 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Citizen Reports:
                    </span>
                    <span>{selectedIncident.reporters_count} (Merged)</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectReport(selectedIncident.id)}
                className="w-full envi-btn-primary py-2.5 text-xs font-bold"
              >
                <span>Inspect Full Case & Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="envi-card p-5 rounded-3xl text-center space-y-2 py-8">
              <MapPin className="w-10 h-10 text-[#06D6A0]/40 mx-auto" />
              <h4 className="font-semibold text-sm text-[#E6FBF6]">Click Any Marker</h4>
              <p className="text-xs text-[#A2C5BD]">
                Select any incident pin on the map to preview evidence, duplicate reports, and resolution status.
              </p>
            </div>
          )}

          {/* Trending Hotspot Zones Quick Ranking */}
          <div className="envi-card p-5 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif-brand font-bold text-sm text-[#E6FBF6] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#EF4444]" />
                <span>Trending Hotspot Zones</span>
              </h4>
              <span className="text-[10px] text-[#06D6A0] font-semibold">GET /zones/trending</span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-[#06D6A0]/10">
              {trendingZones.slice(0, 4).map((z) => {
                const badgeColor =
                  z.risk_level === "red"
                    ? "text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/30"
                    : z.risk_level === "orange"
                    ? "text-[#FB923C] bg-[#FB923C]/15 border-[#FB923C]/30"
                    : z.risk_level === "yellow"
                    ? "text-[#FBBF24] bg-[#FBBF24]/15 border-[#FBBF24]/30"
                    : "text-[#06D6A0] bg-[#06D6A0]/15 border-[#06D6A0]/30";

                return (
                  <div key={z.zone_id} className="pt-2 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#E6FBF6] truncate max-w-[150px]">
                        {z.zone_name}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {z.risk_level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#659389]">
                      <span>{z.open_count} open cases ({z.critical_count} critical)</span>
                      <span className="font-mono text-[#06D6A0]">Score: {z.risk_score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
