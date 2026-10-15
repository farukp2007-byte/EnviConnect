import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LeafletMap from "../components/LeafletMap";
import {
  Camera,
  MapPin,
  Bot,
  AlertTriangle,
  Upload,
  Sparkles,
  CheckCircle2,
  Copy,
  ArrowRight,
  Info,
  Layers,
  Shield,
  X
} from "lucide-react";

export default function ReportIncidentPage({ onSelectReport, setTab }) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("illegal_dumping");
  const [severity, setSeverity] = useState("medium");
  const [coords, setCoords] = useState([13.6288, 79.4192]); // Default Tirupati Central
  const [address, setAddress] = useState("Gandhi Road, Tirupati Central, Andhra Pradesh");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // AI Prediction state
  const [aiPrediction, setAiPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const debounceTimerRef = useRef(null);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Result Modals
  const [submissionResult, setSubmissionResult] = useState(null);

  // Categories list
  const categories = [
    { id: "illegal_dumping", label: "Illegal Dumping", icon: "🗑️", desc: "Solid waste, plastic heaps, debris" },
    { id: "air_pollution", label: "Air Pollution", icon: "🏭", desc: "Black chimney smoke, stubble burning, fumes" },
    { id: "water_pollution", label: "Water Pollution", icon: "💧", desc: "Industrial effluents, sewage, lake foaming" },
    { id: "deforestation", label: "Deforestation", icon: "🌲", desc: "Illegal tree cutting, timber logging" },
    { id: "noise", label: "Noise Pollution", icon: "📢", desc: "Loudspeakers, generators, night drills" },
    { id: "other", label: "Other Hazard", icon: "⚠️", desc: "Civic hazards, encroachments, open pits" },
  ];

  const severities = [
    { id: "low", label: "Low", color: "border-[#06D6A0] text-[#06D6A0] bg-[#06D6A0]/10" },
    { id: "medium", label: "Medium", color: "border-[#FBBF24] text-[#FBBF24] bg-[#FBBF24]/10" },
    { id: "high", label: "High", color: "border-[#FB923C] text-[#FB923C] bg-[#FB923C]/10" },
    { id: "critical", label: "Critical", color: "border-[#EF4444] text-[#EF4444] bg-[#EF4444]/10" },
  ];

  // Live NLP AI Prediction as user types description (debounced)
  useEffect(() => {
    if (!description || description.trim().length < 8) {
      setAiPrediction(null);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setIsPredicting(true);
      try {
        const pred = await api.predictNLP(description);
        setAiPrediction(pred);
      } catch (e) {
        console.error("AI NLP error:", e);
      } finally {
        setIsPredicting(false);
      }
    }, 600);

    return () => clearTimeout(debounceTimerRef.current);
  }, [description]);

  const applyAiSuggestion = () => {
    if (!aiPrediction) return;
    setCategory(aiPrediction.category);
    setSeverity(aiPrediction.severity);
  };

  const [locating, setLocating] = useState(false);

  // Reverse geocoding helper via OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { "Accept-Language": "en" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
    }
  };

  // Browser Geolocation with High Accuracy and IP Fallback
  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      fallbackIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords([lat, lng]);
        reverseGeocode(lat, lng);
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation denied or unavailable:", err.message);
        fallbackIpLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const fallbackIpLocation = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setCoords([data.latitude, data.longitude]);
          setAddress(`${data.city || "Tirupati"}, ${data.region || "Andhra Pradesh"}, India`);
          setLocating(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLocating(false);
    alert("Could not detect live GPS. You can drag the map pin to mark your location.");
  };

  // File selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Quick Preset Sample Reports for Fast Evaluation
  const fillPreset = (presetType) => {
    if (presetType === "duplicate_test") {
      // Coordinates matching existing seeded report at Gandhi Road market (13.6295, 79.4210) within 30 meters!
      setTitle("Massive pile of garbage overflowing onto pavement near market");
      setDescription("Another pile of household plastic waste, rotting vegetables, and construction debris dumped near the market entrance.");
      setCategory("illegal_dumping");
      setSeverity("high");
      setCoords([13.6296, 79.4212]); // ~25 meters from existing report ENV-2026-0001!
      setAddress("Gandhi Road Market, Tirupati Central (Near Stall 14)");
    } else if (presetType === "river_effluent") {
      setTitle("Industrial chemical effluent gushing into irrigation channel");
      setDescription("Untreated dark purple chemical water with pungent sulfur odor discharging into Swarnamukhi stream.");
      setCategory("water_pollution");
      setSeverity("critical");
      setCoords([13.6418, 79.5122]);
      setAddress("Settipalli Industrial Zone, Renigunta");
    } else if (presetType === "smoke_factory") {
      setTitle("Heavy black soot and particulate smoke from factory chimney");
      setDescription("Factory chimney spewing dense black toxic smoke and chemical soot directly into residential neighborhood.");
      setCategory("air_pollution");
      setSeverity("critical");
      setCoords([13.6385, 79.5085]);
      setAddress("Tirupati-Renigunta Highway Industrial Belt");
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please enter title and description");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("severity", severity);
      formData.append("latitude", coords[0]);
      formData.append("longitude", coords[1]);
      formData.append("address", address);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await api.createReport(formData);
      setSubmissionResult(res);
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0C4137] border border-[#06D6A0]/30 text-xs font-semibold text-[#06D6A0]">
          <Camera className="w-3.5 h-3.5" />
          <span>Citizen Incident Submission</span>
        </div>
        <h1 className="font-serif-brand font-bold text-3xl sm:text-4xl text-[#E6FBF6]">
          Report Environmental Violation
        </h1>
        <p className="text-xs sm:text-sm text-[#A2C5BD] max-w-xl mx-auto">
          Upload photo or video evidence with auto-captured GPS. Our system extracts EXIF coordinates, runs NLP classification, detects duplicates (&lt;100m), and routes to the assigned authority.
        </p>

        {/* Quick presets bar for test demo */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-[11px] text-[#659389]">Instant Demo Fill:</span>
          <button
            type="button"
            onClick={() => fillPreset("duplicate_test")}
            className="px-2.5 py-1 rounded-xl bg-[#082C25] hover:bg-[#0C4137] border border-[#06D6A0]/30 text-[11px] font-semibold text-[#06D6A0] flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            <span>Test 100m Duplicate Merge</span>
          </button>
          <button
            type="button"
            onClick={() => fillPreset("river_effluent")}
            className="px-2.5 py-1 rounded-xl bg-[#082C25] hover:bg-[#0C4137] border border-[#06D6A0]/30 text-[11px] font-semibold text-[#E6FBF6]"
          >
            Chemical Water Pollution
          </button>
          <button
            type="button"
            onClick={() => fillPreset("smoke_factory")}
            className="px-2.5 py-1 rounded-xl bg-[#082C25] hover:bg-[#0C4137] border border-[#06D6A0]/30 text-[11px] font-semibold text-[#E6FBF6]"
          >
            Toxic Chimney Smoke
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Information & NLP Suggestion */}
        <div className="envi-card p-6 rounded-3xl space-y-5">
          <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6] flex items-center gap-2">
            <span>1. Violation Details</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#A2C5BD] uppercase mb-1.5">
              Incident Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hazardous biomedical waste dumped behind vegetable market"
              className="w-full px-4 py-3 rounded-2xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6] placeholder-[#659389] text-sm focus:outline-none focus:border-[#06D6A0] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#A2C5BD] uppercase">
                Detailed Description *
              </label>
              {isPredicting && (
                <span className="text-[11px] text-[#06D6A0] animate-pulse flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5" />
                  NLP analyzing description...
                </span>
              )}
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the environmental hazard, visible signs, odor, source, and affected surroundings..."
              className="w-full px-4 py-3 rounded-2xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6] placeholder-[#659389] text-sm focus:outline-none focus:border-[#06D6A0] transition-colors"
            />

            {/* AI Auto-Suggestion Banner (Feature 1 NLP) */}
            {aiPrediction && (
              <div className="mt-2.5 p-3 rounded-2xl bg-[#0C4137]/90 border border-[#06D6A0]/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#06D6A0]/20 border border-[#06D6A0]/50 flex items-center justify-center text-[#06D6A0]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#A2C5BD]">AI Suggestion: </span>
                    <span className="font-bold text-[#E6FBF6] capitalize">
                      {aiPrediction.category.replace("_", " ")}
                    </span>
                    <span className="text-[#A2C5BD] mx-1.5">•</span>
                    <span className="text-[#A2C5BD]">Severity: </span>
                    <span className="font-bold text-[#06D6A0] capitalize">
                      {aiPrediction.severity}
                    </span>
                    <span className="text-[11px] text-[#659389] ml-2">
                      ({Math.round(aiPrediction.confidence * 100)}% match)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applyAiSuggestion}
                  className="px-3 py-1 rounded-xl bg-[#06D6A0] text-[#04120F] font-bold text-xs hover:bg-[#05B789] transition-colors shadow-sm"
                >
                  Apply AI Tags
                </button>
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#A2C5BD] uppercase mb-2">
              Environmental Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    category === c.id
                      ? "bg-[#06D6A0]/20 border-[#06D6A0] shadow-sm shadow-[#06D6A0]/30"
                      : "bg-[#08231E] border-[#06D6A0]/15 hover:border-[#06D6A0]/40 text-[#E6FBF6]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{c.icon}</span>
                    <span className={`text-xs font-bold ${category === c.id ? "text-[#06D6A0]" : "text-[#E6FBF6]"}`}>
                      {c.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A2C5BD] line-clamp-1">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#A2C5BD] uppercase mb-2">
              Assessed Severity Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {severities.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeverity(s.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all text-center ${
                    severity === s.id
                      ? `${s.color} border-2 shadow-sm`
                      : "bg-[#08231E] border-[#06D6A0]/15 text-[#A2C5BD] hover:text-[#E6FBF6]"
                  }`}
                >
                  {s.label} Severity
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Photographic Evidence Upload */}
        <div className="envi-card p-6 rounded-3xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6] flex items-center gap-2">
              <span>2. Photographic / Video Evidence & EXIF GPS</span>
            </h3>
            {/* Direct Mobile Camera Actions */}
            <div className="flex items-center gap-2">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#06D6A0] to-[#0C4137] text-[#04120F] font-bold text-xs flex items-center gap-2 shadow-md shadow-[#06D6A0]/20 hover:scale-105 transition-transform"
                title="Launch phone camera directly"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>Take Live Photo</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-[#08231E] border border-[#06D6A0]/30 hover:border-[#06D6A0] text-xs font-semibold text-[#E6FBF6] flex items-center gap-2"
              >
                <Upload className="w-4 h-4 text-[#06D6A0]" />
                <span>Browse Files</span>
              </button>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#06D6A0]/30 rounded-2xl p-6 text-center bg-[#08231E]/60 hover:bg-[#08231E] transition-colors relative cursor-pointer"
          >
            {previewUrl ? (
              <div className="space-y-3">
                <img
                  src={previewUrl}
                  alt="Evidence preview"
                  className="max-h-56 mx-auto rounded-xl object-contain border border-[#06D6A0]/40 shadow-lg"
                />
                <div className="text-xs text-[#06D6A0] font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Photo loaded • EXIF metadata will be auto-extracted</span>
                </div>
                <p className="text-[11px] text-[#A2C5BD]">Tap or click to change media</p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0C4137] border border-[#06D6A0]/40 flex items-center justify-center mx-auto text-[#06D6A0]">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-[#E6FBF6]">
                  Tap to capture photo with camera or upload evidence file
                </div>
                <p className="text-xs text-[#A2C5BD]">
                  Supports smartphone camera photos, JPG, PNG, MP4. Built-in PIL EXIF extractor captures camera coordinates.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Location and Draggable Pin Fallback */}
        <div className="envi-card p-6 rounded-3xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
                3. Incident Location & Zone
              </h3>
              <p className="text-xs text-[#A2C5BD]">
                Live browser GPS or drag the pin on the map to specify exact point
              </p>
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#06D6A0] to-[#0C4137] text-[#04120F] border border-[#06D6A0] text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#06D6A0]/25 hover:scale-105 transition-all"
            >
              <MapPin className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
              <span>{locating ? "Detecting Live GPS..." : "🎯 Use My Location"}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A2C5BD] uppercase mb-1">
              Address / Landmark
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Gandhi Road Railway Feeder Gate"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#08231E] border border-[#06D6A0]/20 text-[#E6FBF6] text-xs focus:outline-none focus:border-[#06D6A0]"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#06D6A0] bg-[#08231E] p-2.5 rounded-xl border border-[#06D6A0]/15">
            <span>Lat: {coords[0].toFixed(5)}</span>
            <span>Lng: {coords[1].toFixed(5)}</span>
            <span className="text-[#659389] ml-auto text-[11px] font-sans">
              📍 Draggable map pin active below
            </span>
          </div>

          {/* Interactive Leaflet Map Picker */}
          <div className="rounded-2xl overflow-hidden border border-[#06D6A0]/20">
            <LeafletMap
              isPicker={true}
              pickerCoords={coords}
              onPickCoords={(newCoords) => setCoords(newCoords)}
              onAddressResolved={(newAddr) => setAddress(newAddr)}
              height="300px"
              showHeatmapDefault={false}
            />
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full envi-btn-primary py-4 text-base font-bold shadow-xl shadow-[#06D6A0]/30 hover:scale-[1.01] transition-transform disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">🌀</span>
                <span>Processing & Checking Duplicate Proximity...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>Submit Complaint & Route to Authority</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </span>
            )}
          </button>
        </div>
      </form>

      {/* --- SUBMISSION RESULT MODAL (USP DUPLICATE MERGE OR NEW REPORT) --- */}
      {submissionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0C4137] border border-[#06D6A0]/40 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSubmissionResult(null)}
              className="absolute top-5 right-5 text-[#A2C5BD] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {submissionResult.is_duplicate ? (
              /* DUPLICATE DETECTED & MERGED USP SCREEN */
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#06D6A0]/20 border border-[#06D6A0] flex items-center justify-center text-[#06D6A0] mx-auto shadow-lg shadow-[#06D6A0]/30">
                  <Copy className="w-8 h-8" />
                </div>

                <div className="text-center space-y-1">
                  <span className="bg-[#06D6A0] text-[#04120F] text-xs font-bold px-3 py-0.5 rounded-full uppercase">
                    Duplicate Violation Merged (USP)
                  </span>
                  <h3 className="font-serif-brand font-bold text-2xl text-[#E6FBF6] pt-1">
                    Consolidated Evidence Attached!
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-[#08231E] border border-[#06D6A0]/30 text-xs text-[#E6FBF6] space-y-2">
                  <p className="leading-relaxed font-medium">
                    {submissionResult.message}
                  </p>
                  <div className="pt-2 border-t border-[#06D6A0]/20 flex items-center justify-between text-[11px] text-[#A2C5BD]">
                    <span>Unified Incident:</span>
                    <span className="font-mono font-bold text-[#06D6A0]">
                      {submissionResult.incident.incident_number}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#A2C5BD]">
                    <span>Total Citizens Reporting:</span>
                    <span className="font-bold text-[#06D6A0] bg-[#06D6A0]/20 px-2 py-0.5 rounded">
                      {submissionResult.reporters_count} Citizens
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#A2C5BD]">
                    <span>Assigned Authority:</span>
                    <span className="text-[#E6FBF6]">{submissionResult.incident.authority_name}</span>
                  </div>
                </div>

                <p className="text-xs text-[#A2C5BD] text-center">
                  Instead of creating redundant paperwork, your photographic proof has been linked to the primary case to increase enforcement priority!
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      onSelectReport(submissionResult.incident.id);
                      setSubmissionResult(null);
                    }}
                    className="flex-1 envi-btn-primary py-3 text-xs font-bold"
                  >
                    <span>View Consolidated Incident</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSubmissionResult(null);
                      setTab("map");
                    }}
                    className="px-4 py-3 rounded-2xl bg-[#082C25] hover:bg-[#08231E] text-xs font-semibold text-[#E6FBF6] border border-[#06D6A0]/20"
                  >
                    View on Map
                  </button>
                </div>
              </div>
            ) : (
              /* NEW INCIDENT CREATED SCREEN */
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#06D6A0]/20 border border-[#06D6A0] flex items-center justify-center text-[#06D6A0] mx-auto shadow-lg shadow-[#06D6A0]/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="bg-[#06D6A0]/20 text-[#06D6A0] text-xs font-bold px-3 py-0.5 rounded-full border border-[#06D6A0]/30 uppercase">
                    Incident Registered & Routed
                  </span>
                  <h3 className="font-serif-brand font-bold text-2xl text-[#E6FBF6]">
                    Complaint {submissionResult.incident.incident_number}
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-[#08231E] border border-[#06D6A0]/30 text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#A2C5BD]">Assigned Authority:</span>
                    <span className="font-bold text-[#E6FBF6]">{submissionResult.incident.authority_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A2C5BD]">Jurisdiction Zone:</span>
                    <span className="text-[#E6FBF6]">{submissionResult.incident.zone_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A2C5BD]">Severity:</span>
                    <span className="font-bold text-[#06D6A0] uppercase">{submissionResult.incident.severity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A2C5BD]">AI Classification:</span>
                    <span className="text-[#A2C5BD]">
                      {submissionResult.incident.ai_predicted_category} ({Math.round((submissionResult.incident.ai_confidence || 0.9) * 100)}% conf.)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#A2C5BD]">
                  The relevant department has been notified. You can track remediation progress and verify when resolved.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      onSelectReport(submissionResult.incident.id);
                      setSubmissionResult(null);
                    }}
                    className="flex-1 envi-btn-primary py-3 text-xs font-bold"
                  >
                    <span>Track Incident Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSubmissionResult(null);
                      setTab("my-reports");
                    }}
                    className="px-4 py-3 rounded-2xl bg-[#082C25] hover:bg-[#08231E] text-xs font-semibold text-[#E6FBF6] border border-[#06D6A0]/20"
                  >
                    My Reports
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
