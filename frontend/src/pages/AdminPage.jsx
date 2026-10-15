import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  Sliders,
  Building2,
  MapPin,
  GitFork,
  Users,
  Plus,
  Check,
  X,
  Power,
  Shield,
  Layers,
  Sparkles
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("routing"); // 'routing' | 'authorities' | 'zones' | 'users'
  const [routingRules, setRoutingRules] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [zones, setZones] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Rule Form
  const [newCategory, setNewCategory] = useState("illegal_dumping");
  const [newAuthorityId, setNewAuthorityId] = useState("");
  const [newZoneId, setNewZoneId] = useState("");
  const [newPriority, setNewPriority] = useState(10);
  const [creatingRule, setCreatingRule] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [rulesData, authData, zonesData, usersData] = await Promise.all([
        api.getRoutingRules(),
        api.getAuthorities(),
        api.getAdminZones(),
        api.getUsers(),
      ]);
      setRoutingRules(rulesData);
      setAuthorities(authData);
      setZones(zonesData);
      setUsers(usersData);
      if (authData.length > 0) setNewAuthorityId(authData[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId) => {
    try {
      await api.toggleRoutingRule(ruleId);
      setRoutingRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, is_active: !r.is_active } : r))
      );
    } catch (e) {
      alert(`Toggle failed: ${e.message}`);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!newAuthorityId) return;

    setCreatingRule(true);
    try {
      const created = await api.createRoutingRule({
        category: newCategory,
        authority_id: parseInt(newAuthorityId),
        zone_id: newZoneId ? parseInt(newZoneId) : null,
        priority: parseInt(newPriority),
        is_active: true,
      });
      setRoutingRules((prev) => [...prev, created]);
      alert("New routing rule created successfully!");
    } catch (e) {
      alert(`Failed to create rule: ${e.message}`);
    } finally {
      setCreatingRule(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#06D6A0] uppercase tracking-wider">
            System Administration
          </span>
        </div>
        <h1 className="font-serif-brand font-bold text-3xl sm:text-4xl text-[#E6FBF6]">
          Platform Rules, Authorities & Municipal Zones
        </h1>
        <p className="text-xs sm:text-sm text-[#A2C5BD] mt-1">
          Configure the automated GIS routing engine, assign agency jurisdictions, and manage access roles.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#06D6A0]/15 pb-2 text-xs">
        {[
          { id: "routing", label: "Automated Routing Engine", icon: GitFork },
          { id: "authorities", label: "Responding Authorities", icon: Building2 },
          { id: "zones", label: "Municipal Zones & Wards", icon: MapPin },
          { id: "users", label: "User Access Directory", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all border ${
                isActive
                  ? "bg-[#06D6A0] text-[#04120F] border-[#06D6A0] shadow-sm"
                  : "bg-[#0C4137]/60 text-[#E6FBF6] border-transparent hover:border-[#06D6A0]/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#A2C5BD]">Loading configuration tables...</div>
      ) : (
        <div>
          {/* TAB 1: AUTOMATED ROUTING ENGINE */}
          {activeTab === "routing" && (
            <div className="space-y-6">
              {/* Add New Rule Card */}
              <div className="envi-card p-6 rounded-3xl space-y-4">
                <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#06D6A0]" />
                  <span>Add Automated Routing Rule</span>
                </h3>

                <form onSubmit={handleCreateRule} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs items-end">
                  <div>
                    <label className="block font-semibold text-[#A2C5BD] mb-1">Violation Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6]"
                    >
                      <option value="illegal_dumping">Illegal Dumping</option>
                      <option value="air_pollution">Air Pollution</option>
                      <option value="water_pollution">Water Pollution</option>
                      <option value="deforestation">Deforestation</option>
                      <option value="noise">Noise Pollution</option>
                      <option value="other">Other Hazards</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#A2C5BD] mb-1">Target Authority</label>
                    <select
                      value={newAuthorityId}
                      onChange={(e) => setNewAuthorityId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6]"
                    >
                      {authorities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#A2C5BD] mb-1">Zone (Optional)</label>
                    <select
                      value={newZoneId}
                      onChange={(e) => setNewZoneId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6]"
                    >
                      <option value="">All Zones (Global Rule)</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#A2C5BD] mb-1">Priority</label>
                    <input
                      type="number"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6]"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={creatingRule}
                      className="w-full envi-btn-primary py-2.5 font-bold"
                    >
                      {creatingRule ? "Adding..." : "+ Create Rule"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Rules Table */}
              <div className="envi-card p-6 rounded-3xl space-y-4">
                <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
                  Active Routing Rules
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#06D6A0]/20 text-[#659389] uppercase">
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Assigned Authority</th>
                        <th className="py-3 px-4">Zone Coverage</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#06D6A0]/10">
                      {routingRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-[#08231E]/60">
                          <td className="py-3 px-4 font-semibold text-[#E6FBF6] capitalize">
                            {rule.category.replace("_", " ")}
                          </td>
                          <td className="py-3 px-4 text-[#06D6A0] font-bold">
                            {rule.authority_name || `Authority #${rule.authority_id}`}
                          </td>
                          <td className="py-3 px-4 text-[#A2C5BD]">{rule.zone_name}</td>
                          <td className="py-3 px-4 font-mono">{rule.priority}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                rule.is_active
                                  ? "bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/40"
                                  : "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40"
                              }`}
                            >
                              {rule.is_active ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleToggleRule(rule.id)}
                              className={`p-1.5 rounded-xl border transition-colors ${
                                rule.is_active
                                  ? "bg-[#08231E] text-[#06D6A0] border-[#06D6A0]/30 hover:border-[#EF4444] hover:text-[#EF4444]"
                                  : "bg-[#08231E] text-[#659389] border-[#659389]/30 hover:border-[#06D6A0] hover:text-[#06D6A0]"
                              }`}
                              title={rule.is_active ? "Disable Rule" : "Activate Rule"}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUTHORITIES */}
          {activeTab === "authorities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authorities.map((auth) => (
                <div key={auth.id} className="envi-card p-6 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#06D6A0] bg-[#082C25] px-2.5 py-1 rounded-xl border border-[#06D6A0]/30">
                      {auth.code}
                    </span>
                    <span className="text-[11px] text-[#659389]">ID #{auth.id}</span>
                  </div>
                  <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
                    {auth.name}
                  </h3>
                  <div className="text-xs text-[#06D6A0] font-medium">{auth.department}</div>
                  <p className="text-xs text-[#A2C5BD] leading-relaxed">{auth.description}</p>
                  <div className="pt-2 border-t border-[#06D6A0]/10 text-xs text-[#659389] space-y-1">
                    <div>Jurisdiction: <span className="text-[#E6FBF6]">{auth.jurisdiction}</span></div>
                    <div>Contact: <span className="text-[#E6FBF6]">{auth.contact_email}</span> • {auth.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ZONES */}
          {activeTab === "zones" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zones.map((z) => (
                <div key={z.id} className="envi-card p-6 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#06D6A0] bg-[#082C25] px-2.5 py-1 rounded-xl border border-[#06D6A0]/30">
                      {z.code}
                    </span>
                    <span className="text-xs text-[#659389]">Radius: {z.radius_km} km</span>
                  </div>
                  <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
                    {z.name}
                  </h3>
                  <div className="text-xs text-[#06D6A0] font-mono">
                    Lat: {z.center_lat.toFixed(4)}, Lng: {z.center_lng.toFixed(4)}
                  </div>
                  <p className="text-xs text-[#A2C5BD]">{z.description}</p>
                  <div className="pt-2 border-t border-[#06D6A0]/10 text-xs text-[#659389]">
                    Wards: <span className="text-[#E6FBF6]">{z.ward_numbers}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: USERS */}
          {activeTab === "users" && (
            <div className="envi-card p-6 rounded-3xl space-y-4">
              <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
                System Users Directory
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#06D6A0]/20 text-[#659389] uppercase">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#06D6A0]/10">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#08231E]/60">
                        <td className="py-3 px-4 font-semibold text-[#E6FBF6]">{u.full_name}</td>
                        <td className="py-3 px-4 text-[#A2C5BD]">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#082C25] text-[#06D6A0] border border-[#06D6A0]/30">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#659389]">{u.phone || "N/A"}</td>
                        <td className="py-3 px-4 text-[#659389]">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
