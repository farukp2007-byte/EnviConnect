import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents
} from "react-leaflet";
import L from "leaflet";
import { api } from "../services/api";
import {
  Layers,
  MapPin,
  AlertCircle,
  Users,
  ExternalLink,
  Shield,
  Crosshair,
  Settings,
  Key,
  Check,
  X,
  Compass,
  Sparkles
} from "lucide-react";

// Fix default leaflet marker icon issue in Vite/webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom colored incident markers
function createSeverityIcon(severity, reportersCount = 1) {
  const colors = {
    critical: "#EF4444",
    high: "#FB923C",
    medium: "#FBBF24",
    low: "#06D6A0",
  };
  const color = colors[severity] || "#06D6A0";

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        position: relative;
        background: #0C4137;
        border: 2px solid ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px ${color}88;
        transform: translate(-16px, -16px);
      ">
        <div style="background: ${color}; width: 12px; height: 12px; border-radius: 50%;"></div>
        ${
          reportersCount > 1
            ? `<div style="
                position: absolute;
                top: -6px;
                right: -6px;
                background: #06D6A0;
                color: #04120F;
                font-size: 10px;
                font-weight: 800;
                width: 17px;
                height: 17px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1.5px solid #0C4137;
              ">${reportersCount}</div>`
            : ""
        }
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// User Live Location Marker (Blue pulsating dot)
function createUserLocationIcon() {
  return L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="position: relative; width: 24px; height: 24px; transform: translate(-12px, -12px);">
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(6, 214, 160, 0.4);
          animation: pulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          top: 4px;
          left: 4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #06D6A0;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px #06D6A0;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Draggable Pin Handler for Incident Reporting form
function DraggablePin({ position, setPosition, onReverseGeocode }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      if (onReverseGeocode) onReverseGeocode(newPos[0], newPos[1]);
    },
  });

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          const newPos = [pos.lat, pos.lng];
          setPosition(newPos);
          if (onReverseGeocode) onReverseGeocode(newPos[0], newPos[1]);
        },
      }}
      icon={L.divIcon({
        className: "custom-picker-pin",
        html: `
          <div style="
            background: #06D6A0;
            color: #04120F;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 4px 15px rgba(6, 214, 160, 0.6);
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid #FFFFFF;
            transform: translate(-50%, -100%);
            white-space: nowrap;
          ">
            📍 Draggable Location Pin
          </div>
        `,
        iconSize: [0, 0],
      })}
    />
  );
}

// Map Controller for Centering, Fly-To and Live Locate
function MapController({ center, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  useEffect(() => {
    if (userLocation && userLocation[0] && userLocation[1]) {
      map.flyTo(userLocation, 16, { animate: true, duration: 1.5 });
    }
  }, [userLocation, map]);

  return null;
}

// TILE PROVIDER OPTIONS (OpenStreetMap standard is 100% free and requires no key)
export const TILE_PROVIDERS = {
  osm_standard: {
    name: "OpenStreetMap Standard (Free / No Key Required)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    requiresKey: false,
  },
  osm_hot: {
    name: "Humanitarian OSM (Free / High Contrast)",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by Humanitarian OSM',
    maxZoom: 19,
    requiresKey: false,
  },
  carto_dark: {
    name: "Carto Dark Matter (Dark Clean Theme)",
    url: "https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
    requiresKey: false,
  },
  mapbox_custom: {
    name: "Mapbox Streets / Dark (Requires Mapbox Token)",
    url: "https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token={apiKey}",
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 22,
    requiresKey: true,
  },
  stadia_alidade: {
    name: "Stadia Maps Alidade Smooth (Requires Stadia Key)",
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key={apiKey}",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    maxZoom: 20,
    requiresKey: true,
  }
};

export default function LeafletMap({
  incidents = [],
  trendingZones = [],
  selectedIncident,
  onSelectIncident,
  height = "520px",
  isPicker = false,
  pickerCoords = [13.6288, 79.4192],
  onPickCoords,
  onAddressResolved,
  showHeatmapDefault = true,
}) {
  const [showZones, setShowZones] = useState(showHeatmapDefault);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");

  // Geolocation state
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  // Map Provider & API Key State
  const [tileProviderKey, setTileProviderKey] = useState(
    localStorage.getItem("envi_tile_provider") || "osm_standard"
  );
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("envi_map_api_key") || import.meta.env.VITE_MAP_API_KEY || ""
  );
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempProvider, setTempProvider] = useState(tileProviderKey);

  const activeProvider = TILE_PROVIDERS[tileProviderKey] || TILE_PROVIDERS.osm_standard;
  const tileUrl = activeProvider.url.replace("{apiKey}", apiKey);

  const centerCoords = isPicker
    ? pickerCoords
    : selectedIncident
    ? [selectedIncident.latitude, selectedIncident.longitude]
    : userLocation || [13.6288, 79.4192]; // Tirupati default

  const filteredIncidents = incidents.filter((inc) => {
    if (activeCategoryFilter === "all") return true;
    return inc.category === activeCategoryFilter;
  });

  const getZoneColor = (level) => {
    switch (level) {
      case "red":
        return "#EF4444";
      case "orange":
        return "#FB923C";
      case "yellow":
        return "#FBBF24";
      default:
        return "#06D6A0";
    }
  };

  // Reverse geocoding using OpenStreetMap Nominatim API (Free, open)
  const handleReverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const displayName = data.display_name;
        if (displayName && onAddressResolved) {
          onAddressResolved(displayName);
        }
      }
    } catch (err) {
      console.warn("Reverse geocode warning:", err);
    }
  };

  // "Use My Location" Trigger with High Accuracy & Fallback
  const handleLocateMe = () => {
    setLocating(true);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Using IP-based location fallback.");
      fallbackIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const newLocation = [lat, lng];

        setUserLocation(newLocation);
        setLocationAccuracy(pos.coords.accuracy);
        setLocating(false);

        if (isPicker && onPickCoords) {
          onPickCoords(newLocation);
        }
        handleReverseGeocode(lat, lng);
      },
      (err) => {
        console.warn("HTML5 Geolocation warning/denied:", err.message);
        fallbackIpLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // IP Geolocation Fallback if GPS is blocked
  const fallbackIpLocation = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const newPos = [data.latitude, data.longitude];
          setUserLocation(newPos);
          if (isPicker && onPickCoords) {
            onPickCoords(newPos);
          }
          if (onAddressResolved) {
            onAddressResolved(`${data.city}, ${data.region}, ${data.country_name}`);
          }
          setLocating(false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLocating(false);
    alert("Could not detect location automatically. You can click anywhere or drag the pin to set your position.");
  };

  const handleSaveSettings = () => {
    setTileProviderKey(tempProvider);
    setApiKey(tempApiKey);
    localStorage.setItem("envi_tile_provider", tempProvider);
    localStorage.setItem("envi_map_api_key", tempApiKey);
    setShowSettingsModal(false);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#06D6A0]/25 shadow-2xl bg-[#04120F]">
      {/* Top Map Action Controls Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2">
        {/* Hotspot Zones Toggle */}
        <button
          onClick={() => setShowZones(!showZones)}
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md transition-all border ${
            showZones
              ? "bg-[#06D6A0] text-[#04120F] border-[#06D6A0] shadow-md shadow-[#06D6A0]/30"
              : "bg-[#0C4137]/90 text-[#E6FBF6] border-[#06D6A0]/30 hover:border-[#06D6A0]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{showZones ? "Hotspot Zones: ON" : "Hotspot Zones: OFF"}</span>
        </button>

        {/* USE MY LOCATION BUTTON (Locate Me) */}
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-[#06D6A0] to-[#0C4137] text-[#04120F] border border-[#06D6A0] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#06D6A0]/30 hover:scale-105 transition-all"
          title="Detect and fly to my live GPS location"
        >
          <Crosshair className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
          <span>{locating ? "Locating You..." : "🎯 Use My Location"}</span>
        </button>

        {/* MAP API KEYS & TILE PROVIDER SETTINGS BUTTON */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="px-3 py-1.5 rounded-2xl bg-[#082C25]/90 hover:bg-[#0C4137] text-[#A2C5BD] hover:text-[#06D6A0] border border-[#06D6A0]/30 text-xs font-medium flex items-center gap-1.5 backdrop-blur-md transition-all"
          title="Configure Map Tile Providers and Custom API Keys"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Map Provider & API Keys</span>
        </button>
      </div>

      {/* Heatmap Legend */}
      {showZones && (
        <div className="absolute bottom-4 right-4 z-[400] bg-[#0C4137]/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#06D6A0]/30 text-xs shadow-xl hidden sm:block">
          <div className="font-semibold text-[#E6FBF6] mb-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06D6A0]"></span>
            <span>Trending Zone Risk Levels:</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]/70 border border-[#EF4444]"></span>
              <span className="text-[#E6FBF6]">Critical Hotspot (Density + Age)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FB923C]/70 border border-[#FB923C]"></span>
              <span className="text-[#E6FBF6]">High Concern Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FBBF24]/70 border border-[#FBBF24]"></span>
              <span className="text-[#E6FBF6]">Moderate Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#06D6A0]/70 border border-[#06D6A0]"></span>
              <span className="text-[#E6FBF6]">Low / Monitored Green Belt</span>
            </div>
          </div>
        </div>
      )}

      {/* Actual Leaflet Map */}
      <MapContainer
        center={centerCoords}
        zoom={13}
        style={{ height, width: "100%" }}
        scrollWheelZoom={true}
      >
        <MapController center={centerCoords} userLocation={userLocation} />

        {/* Active TileLayer (Default: Official OpenStreetMap Standard - 100% Free, No API Key Required!) */}
        <TileLayer
          attribution={activeProvider.attribution}
          url={tileUrl}
          maxZoom={activeProvider.maxZoom || 19}
        />

        {/* User Current Location Marker & Accuracy Circle */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={createUserLocationIcon()}>
              <Popup>
                <div className="p-1 text-xs">
                  <div className="font-bold text-[#06D6A0] mb-0.5">📍 Your Live Position</div>
                  <div className="text-[#E6FBF6] text-[11px]">
                    Lat: {userLocation[0].toFixed(5)}, Lng: {userLocation[1].toFixed(5)}
                  </div>
                  {locationAccuracy && (
                    <div className="text-[10px] text-[#A2C5BD]">
                      Accuracy radius: ~{Math.round(locationAccuracy)}m
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
            {locationAccuracy && locationAccuracy > 20 && (
              <Circle
                center={userLocation}
                radius={locationAccuracy}
                pathOptions={{
                  color: "#06D6A0",
                  fillColor: "#06D6A0",
                  fillOpacity: 0.1,
                  weight: 1,
                  dashArray: "3, 6",
                }}
              />
            )}
          </>
        )}

        {/* Trending Zones Circle Overlays (Feature 7) */}
        {showZones &&
          trendingZones.map((zone) => {
            const color = getZoneColor(zone.risk_level);
            return (
              <Circle
                key={zone.zone_id}
                center={[zone.center_lat, zone.center_lng]}
                radius={(zone.radius_km || 3.0) * 1000}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: "4, 6",
                }}
              >
                <Popup>
                  <div className="p-1 max-w-[240px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#E6FBF6]">
                        {zone.zone_name}
                      </span>
                      <span
                        className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                        style={{ background: `${color}33`, color: color }}
                      >
                        {zone.risk_level} Hotspot
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A2C5BD] mb-2">
                      Code: {zone.zone_code} • Radius: {zone.radius_km} km
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-center text-[10px] bg-[#08231E] p-2 rounded-xl border border-[#06D6A0]/20">
                      <div>
                        <div className="text-[#E6FBF6] font-bold text-xs">{zone.open_count}</div>
                        <div className="text-[#659389]">Open Cases</div>
                      </div>
                      <div>
                        <div className="text-[#EF4444] font-bold text-xs">{zone.critical_count}</div>
                        <div className="text-[#659389]">Critical</div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Circle>
            );
          })}

        {/* Draggable Picker Pin */}
        {isPicker && (
          <DraggablePin
            position={pickerCoords}
            setPosition={onPickCoords}
            onReverseGeocode={handleReverseGeocode}
          />
        )}

        {/* Incident Markers */}
        {!isPicker &&
          filteredIncidents.map((inc) => {
            if (!inc.latitude || !inc.longitude) return null;
            const icon = createSeverityIcon(inc.severity, inc.reporters_count);

            return (
              <Marker
                key={inc.id}
                position={[inc.latitude, inc.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectIncident && onSelectIncident(inc),
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[210px] max-w-[260px]">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold text-[#06D6A0]">
                        {inc.incident_number}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#08231E] text-[#E6FBF6] border border-[#06D6A0]/30">
                        {inc.status.replace("_", " ")}
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs text-[#E6FBF6] line-clamp-1 mb-1">
                      {inc.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[10px] text-[#A2C5BD] mb-2">
                      <MapPin className="w-3 h-3 text-[#06D6A0] flex-shrink-0" />
                      <span className="truncate">{inc.address}</span>
                    </div>

                    {inc.reporters_count > 1 && (
                      <div className="bg-[#082C25] text-[#06D6A0] px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 mb-2">
                        <Users className="w-3 h-3" />
                        <span>{inc.reporters_count} citizens reported this (Duplicate merged)</span>
                      </div>
                    )}

                    <button
                      onClick={() => onSelectIncident && onSelectIncident(inc)}
                      className="w-full py-1.5 rounded-xl bg-[#06D6A0] text-[#04120F] text-xs font-bold hover:bg-[#05B789] transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View Incident Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* --- MAP SETTINGS & CUSTOM API KEYS MODAL --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0C4137] border border-[#06D6A0]/40 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#06D6A0]/20 border border-[#06D6A0]/40 flex items-center justify-center text-[#06D6A0]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-brand font-bold text-lg text-[#E6FBF6]">
                    Map Provider & API Key Configuration
                  </h3>
                  <p className="text-[11px] text-[#A2C5BD]">
                    Connect your custom map keys or use free OpenStreetMap tiles without keys
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-[#A2C5BD] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A2C5BD] font-semibold uppercase mb-1.5">
                  Select Tile Layer Provider
                </label>
                <div className="space-y-2">
                  {Object.entries(TILE_PROVIDERS).map(([key, provider]) => (
                    <label
                      key={key}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        tempProvider === key
                          ? "bg-[#06D6A0]/15 border-[#06D6A0] shadow-sm"
                          : "bg-[#08231E] border-[#06D6A0]/15 hover:border-[#06D6A0]/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="tile_provider"
                          value={key}
                          checked={tempProvider === key}
                          onChange={(e) => setTempProvider(e.target.value)}
                          className="accent-[#06D6A0]"
                        />
                        <div>
                          <div className="font-semibold text-[#E6FBF6]">{provider.name}</div>
                          <div className="text-[10px] text-[#659389]">
                            {provider.requiresKey ? "Requires API Key below" : "No API key required • 100% Free"}
                          </div>
                        </div>
                      </div>
                      {!provider.requiresKey && (
                        <span className="text-[10px] font-bold text-[#06D6A0] bg-[#06D6A0]/20 px-2 py-0.5 rounded-full border border-[#06D6A0]/30">
                          Recommended
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {TILE_PROVIDERS[tempProvider]?.requiresKey && (
                <div className="p-3 rounded-2xl bg-[#08231E] border border-[#06D6A0]/30 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-[#06D6A0] font-bold text-xs">
                    <Key className="w-3.5 h-3.5" />
                    <span>Enter Custom API Key / Access Token:</span>
                  </div>
                  <input
                    type="text"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="e.g. pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjb..."
                    className="w-full px-3 py-2 rounded-xl bg-[#04120F] border border-[#06D6A0]/30 text-xs text-[#E6FBF6] font-mono focus:outline-none focus:border-[#06D6A0]"
                  />
                  <p className="text-[10px] text-[#659389]">
                    Your API key is securely stored in your browser's localStorage and never transmitted to our servers.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex-1 envi-btn-primary py-2.5 text-xs font-bold"
              >
                Apply Provider Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempProvider("osm_standard");
                  setTempApiKey("");
                  setTileProviderKey("osm_standard");
                  setApiKey("");
                  localStorage.removeItem("envi_map_api_key");
                  localStorage.removeItem("envi_tile_provider");
                  setShowSettingsModal(false);
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#082C25] text-xs text-[#A2C5BD] hover:text-white"
              >
                Reset to Default Free OSM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
