import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  ShieldAlert,
  Filter,
  ArrowUpDown,
  Upload,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Camera,
  X
} from "lucide-react";

export default function AuthorityDashboardPage({ onSelectReport }) {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [sortBy, setSortBy] = useState("severity"); // 'severity' | 'reporters' | 'newest'

  // Status Update Modal State
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [newStatus, setNewStatus] = useState("in_progress");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [afterFile, setAfterFile] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadIncidents();
    api.getZones().then((z) => setZones(z)).catch((e) => console.error(e));
  }, [statusFilter, categoryFilter, severityFilter, zoneFilter, sortBy, user]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await api.getReports({
        status: statusFilter,
        category: categoryFilter,
        severity: severityFilter,
        zone_id: zoneFilter !== "all" ? zoneFilter : undefined,
        authority_id: user?.authority_id,
      });

      // Sorting
      let sorted = [...data];
      if (sortBy === "severity") {
        const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
        sorted.sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0));
      } else if (sortBy === "reporters") {
        sorted.sort((a, b) => (b.reporters_count || 1) - (a.reporters_count || 1));
      } else if (sortBy === "newest") {
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      setIncidents(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (inc) => {
    setSelectedIncident(inc);
    setNewStatus(inc.status === "assigned" ? "in_progress" : "resolved");
    setResolutionNotes(
      inc.status === "in_progress"
        ? "Remediation crew deployed. Waste cleared and sanitization completed."
        : ""
    );
    setAfterFile(null);
    setAfterPreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterFile(file);
      setAfterPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("new_status", newStatus);
      if (resolutionNotes) formData.append("notes", resolutionNotes);
      if (afterFile) formData.append("after_file", afterFile);

      await api.updateStatus(selectedIncident.id, formData);
      alert(`Incident ${selectedIncident.incident_number} updated to '${newStatus}'!`);
      setSelectedIncident(null);
      loadIncidents();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#06D6A0] uppercase tracking-wider">
              Enforcement & Remediation Console
            </span>
          </div>
          <h1 className="font-serif-brand font-bold text-3xl sm:text-4xl text-[#E6FBF6]">
            Authority Incident Management Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#A2C5BD] mt-1">
            Prioritize high-severity hazards, review consolidated duplicate evidence, and upload resolution proof photos.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-[#0C4137] p-2.5 rounded-2xl border border-[#06D6A0]/20 text-xs">
          <div>
            <div className="text-xs text-[#659389]">Queue Depth</div>
            <div className="text-sm font-bold text-[#06D6A0]">{incidents.length} Cases</div>
          </div>
          <div className="h-6 w-[1px] bg-[#06D6A0]/20"></div>
          <div>
            <div className="text-xs text-[#659389]">Critical Alerts</div>
            <div className="text-sm font-bold text-[#EF4444]">
              {incidents.filter((i) => i.severity === "critical").length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting Bar */}
      <div className="envi-card p-4 rounded-3xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Status buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#659389] mr-1">Status:</span>
            {["all", "submitted", "assigned", "in_progress", "resolved", "closed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all border ${
                  statusFilter === st
                    ? "bg-[#06D6A0] text-[#04120F] font-bold border-[#06D6A0]"
                    : "bg-[#08231E] text-[#A2C5BD] border-[#06D6A0]/15 hover:border-[#06D6A0]/40"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Sort By buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#06D6A0]" />
            <span className="text-[#659389]">Sort:</span>
            <button
              onClick={() => setSortBy("severity")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                sortBy === "severity"
                  ? "bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/40 font-bold"
                  : "text-[#A2C5BD] hover:text-white"
              }`}
            >
              Highest Severity
            </button>
            <button
              onClick={() => setSortBy("reporters")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                sortBy === "reporters"
                  ? "bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/40 font-bold"
                  : "text-[#A2C5BD] hover:text-white"
              }`}
            >
              Most Reported (Duplicates)
            </button>
            <button
              onClick={() => setSortBy("newest")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                sortBy === "newest"
                  ? "bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/40 font-bold"
                  : "text-[#A2C5BD] hover:text-white"
              }`}
            >
              Newest
            </button>
          </div>
        </div>

        {/* Category & Zone dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#06D6A0]/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#659389]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6] focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="illegal_dumping">Illegal Dumping</option>
              <option value="air_pollution">Air Pollution</option>
              <option value="water_pollution">Water Pollution</option>
              <option value="deforestation">Deforestation</option>
              <option value="noise">Noise Pollution</option>
              <option value="other">Other Hazards</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#659389]">Zone / Ward:</span>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6] focus:outline-none"
            >
              <option value="all">All Zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Incident Queue Cards */}
      {loading ? (
        <div className="text-center py-20 text-[#A2C5BD]">Loading authority incident queue...</div>
      ) : incidents.length === 0 ? (
        <div className="envi-card p-12 text-center rounded-3xl space-y-2">
          <CheckCircle2 className="w-10 h-10 text-[#06D6A0] mx-auto" />
          <h3 className="font-semibold text-[#E6FBF6]">No incidents matching active filters</h3>
          <p className="text-xs text-[#A2C5BD]">Queue is clean for this criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className={`envi-card p-5 rounded-3xl space-y-4 transition-all hover:border-[#06D6A0]/40 ${
                inc.severity === "critical" ? "border-l-4 border-l-[#EF4444]" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#06D6A0] bg-[#082C25] px-2.5 py-1 rounded-xl border border-[#06D6A0]/30">
                    {inc.incident_number}
                  </span>
                  <span className="capitalize font-semibold text-[#E6FBF6]">
                    {inc.category.replace("_", " ")}
                  </span>
                  <span className="text-[#659389]">•</span>
                  <span className="text-[#A2C5BD]">{inc.zone_name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {inc.reporters_count > 1 && (
                    <span className="bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/30 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{inc.reporters_count} Citizens Merged</span>
                    </span>
                  )}
                  {inc.is_escalated && (
                    <span className="bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                      ESCALATED #{inc.escalation_count}
                    </span>
                  )}
                  <span
                    className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      inc.severity === "critical"
                        ? "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]"
                        : inc.severity === "high"
                        ? "bg-[#FB923C]/20 text-[#FB923C] border-[#FB923C]"
                        : "bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]"
                    }`}
                  >
                    {inc.severity}
                  </span>
                  <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#08231E] text-[#E6FBF6] border border-[#06D6A0]/20">
                    {inc.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="h-28 rounded-2xl overflow-hidden bg-black relative border border-[#06D6A0]/20">
                  <img
                    src={api.assetUrl(inc.primary_image_url)}
                    alt={inc.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/seed_assets/default_dumping.jpg";
                    }}
                    className="w-full h-full object-cover"
                  />
                  {inc.after_image_url && (
                    <span className="absolute bottom-1 right-1 bg-[#06D6A0] text-[#04120F] text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      After Photo Attached
                    </span>
                  )}
                </div>

                <div className="md:col-span-2 space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-[#E6FBF6] line-clamp-1">
                    {inc.title}
                  </h3>
                  <p className="text-xs text-[#A2C5BD] line-clamp-2">
                    {inc.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-[#659389] pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#06D6A0] flex-shrink-0" />
                    <span className="truncate">{inc.address}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {inc.status !== "closed" && (
                    <button
                      onClick={() => handleOpenStatusModal(inc)}
                      className="envi-btn-primary text-xs py-2 px-3 font-bold w-full"
                    >
                      <span>Update Status / Resolve</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectReport(inc.id)}
                    className="envi-btn-secondary text-xs py-2 px-3 font-semibold w-full"
                  >
                    <span>View Case Details →</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- STATUS UPDATE & RESOLUTION MODAL --- */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0C4137] border border-[#06D6A0]/40 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#06D6A0]">
                  {selectedIncident.incident_number}
                </span>
                <h3 className="font-serif-brand font-bold text-xl text-[#E6FBF6]">
                  Update Incident Workflow Status
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-[#A2C5BD] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A2C5BD] uppercase mb-1">
                  New Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "in_progress", label: "In Progress" },
                    { id: "resolved", label: "Resolved (with Proof)" },
                    { id: "closed", label: "Closed" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setNewStatus(st.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        newStatus === st.id
                          ? "bg-[#06D6A0] text-[#04120F] border-[#06D6A0] shadow-sm"
                          : "bg-[#08231E] text-[#E6FBF6] border-[#06D6A0]/20 hover:border-[#06D6A0]/40"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* When Resolving: Require Resolution Notes & After Photo */}
              {newStatus === "resolved" && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-[#08231E] border border-[#06D6A0]/30 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#06D6A0]">
                    <Sparkles className="w-4 h-4" />
                    <span>Feature 4 & 5: Upload Resolution Proof ('After' Photo)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A2C5BD] mb-1">
                      Field Remediation Notes *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="e.g. Sanitation squad cleared 3 tons of waste, disinfected with bleaching powder, and served fine on violator..."
                      className="w-full px-3 py-2 rounded-xl bg-[#04120F] border border-[#06D6A0]/20 text-xs text-[#E6FBF6] focus:outline-none focus:border-[#06D6A0]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A2C5BD] mb-1">
                      Remediation 'After' Photo Proof
                    </label>
                    <div className="border border-dashed border-[#06D6A0]/30 rounded-xl p-3 text-center bg-[#04120F] relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {afterPreview ? (
                        <div className="space-y-1">
                          <img
                            src={afterPreview}
                            alt="After proof"
                            className="h-28 mx-auto rounded-lg object-contain"
                          />
                          <p className="text-[11px] text-[#06D6A0]">Click to replace after photo</p>
                        </div>
                      ) : (
                        <div className="space-y-1 py-2">
                          <Camera className="w-6 h-6 text-[#06D6A0] mx-auto" />
                          <div className="text-xs text-[#E6FBF6] font-medium">
                            Upload cleaned site / remediated photo
                          </div>
                          <p className="text-[10px] text-[#659389]">
                            Will be displayed side-by-side on public before & after comparison
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 envi-btn-primary py-3 text-xs font-bold"
                >
                  {updating ? "Saving Changes..." : "Confirm Status Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-3 rounded-2xl bg-[#082C25] text-xs text-[#E6FBF6]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
