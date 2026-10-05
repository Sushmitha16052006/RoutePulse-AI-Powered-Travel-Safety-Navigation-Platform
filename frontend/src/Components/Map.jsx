import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import BottomNav from "./Home/BottomNav";
import "../App.css";
import {
  MapPin, Navigation, Square, Wifi, WifiOff,
  Play, ArrowLeft, ArrowRight, ArrowUp, RotateCw,
  Flag, Clock, Activity, StopCircle, Zap,
} from "lucide-react";
import { toast } from "react-toastify";
import useDestinationAlerts from "./DestinationAlert";

/* ── Fix default Leaflet icons ──────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

/* ── Haversine distance (km) ────────────────────────────── */
const getDistKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ── Realistic transit ETA (avg 20 km/h + 5 min buffer) ── */
const transitETA = (distKm) => {
  const total = Math.round((distKm / 20) * 60) + 5;
  const h = Math.floor(total / 60), m = total % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/* ── Turn instruction icon ──────────────────────────────── */
const TurnIcon = ({ type, size = 18 }) => {
  const s = { width: size, height: size };
  if (["TurnLeft","SlightLeft","SharpLeft"].includes(type))  return <ArrowLeft  style={s} />;
  if (["TurnRight","SlightRight","SharpRight"].includes(type)) return <ArrowRight style={s} />;
  if (type === "DestinationReached") return <Flag style={s} />;
  if (type === "Roundabout")         return <RotateCw style={s} />;
  return <ArrowUp style={s} />;
};

/* ── CSS keyframes ──────────────────────────────────────── */
const STYLES = `
@keyframes alertSlideUp {
  from { opacity:0; transform:translateY(20px) scale(0.96); }
  to   { opacity:1; transform:translateY(0)    scale(1);    }
}
@keyframes navGlow {
  0%,100% { box-shadow:0 0 18px rgba(255,45,85,.2); }
  50%     { box-shadow:0 0 34px rgba(255,45,85,.45); }
}
@keyframes pulseDot {
  0%,100% { opacity:1; transform:scale(1); }
  50%     { opacity:.5; transform:scale(1.3); }
}
.alert-card-enter { animation: alertSlideUp .38s cubic-bezier(.34,1.56,.64,1) both; }
.nav-glow         { animation: navGlow 2.5s ease-in-out infinite; }
.pulse-dot        { animation: pulseDot 1.2s ease-in-out infinite; }
`;

/* ── CustomRoutingMachine ───────────────────────────────── */
const CustomRoutingMachine = ({ waypoints, onRouteFound, onTotalDistance, onInstructions, onRouteCoordinates }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || waypoints.length !== 2) return;
    const ctrl = L.Routing.control({
      waypoints        : waypoints.map(wp => L.latLng(wp.lat, wp.lon)),
      routeWhileDragging: false,
      show             : false,
      addWaypoints     : false,
      fitSelectedRoutes: true,
      lineOptions      : { styles: [{ color: "#FF2D55", weight: 5, opacity: 0.85 }] },
    }).addTo(map);

    ctrl.on("routesfound", (e) => {
      const route  = e.routes[0];
      const distKm = parseFloat((route.summary.totalDistance / 1000).toFixed(1));
      onRouteFound({ distance: distKm.toFixed(1), duration: transitETA(distKm) });
      if (onTotalDistance)  onTotalDistance(distKm);
      if (onInstructions && route.instructions) onInstructions(route.instructions);
      if (onRouteCoordinates && route.coordinates) onRouteCoordinates(route.coordinates);
    });
    return () => { try { map.removeControl(ctrl); } catch (_) {} };
  }, [map, waypoints]);
  return null;
};

/* ── ProgressBar ────────────────────────────────────────── */
const ProgressBar = ({ pct }) => (
  <div style={{ padding: "6px 0 2px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
      <span style={{ fontSize:"10px", color:"#9CA3AF", fontWeight:600, letterSpacing:"0.05em" }}>ROUTE PROGRESS</span>
      <span style={{ fontSize:"10px", color:"#FF2D55", fontWeight:700 }}>{Math.round(pct)}%</span>
    </div>
    <div style={{ height:"5px", background:"rgba(255,255,255,0.07)", borderRadius:"99px", overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${Math.max(2,pct)}%`, background:"linear-gradient(90deg,#FF2D55,#FF6B9D)", borderRadius:"99px", transition:"width 1.2s ease" }} />
    </div>
  </div>
);

/* ── TurnCard ───────────────────────────────────────────── */
const TurnCard = ({ instruction, dimmed }) => {
  if (!instruction) return null;
  const accent = dimmed ? "rgba(139,92,246,.8)" : "#FF2D55";
  const bg     = dimmed ? "rgba(139,92,246,.08)" : "rgba(255,45,85,.1)";
  const border = dimmed ? "rgba(139,92,246,.2)"  : "rgba(255,45,85,.25)";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:dimmed?"8px 12px":"11px 14px", background:bg, border:`1px solid ${border}`, borderRadius:"14px", transition:"all .3s" }}>
      <div style={{ flexShrink:0, width:dimmed?30:36, height:dimmed?30:36, borderRadius:"10px", background:dimmed?"rgba(139,92,246,.15)":"rgba(255,45,85,.15)", display:"flex", alignItems:"center", justifyContent:"center", color:accent }}>
        <TurnIcon type={instruction.type} size={dimmed?15:18} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontSize:dimmed?"11px":"13px", fontWeight:dimmed?500:700, color:dimmed?"#9CA3AF":"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {dimmed ? "Then: " : ""}{instruction.text || "Continue straight"}
        </p>
        {instruction.distance > 0 && (
          <p style={{ margin:"2px 0 0", fontSize:"10px", color:"#6B7280" }}>
            {instruction.distance < 1000 ? `${Math.round(instruction.distance)} m` : `${(instruction.distance/1000).toFixed(1)} km`}
          </p>
        )}
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────── */
const TrackMeMap = () => {
  const [currentPosition,    setCurrentPosition   ] = useState([19.076, 72.8777]);
  const [isTracking,         setIsTracking        ] = useState(false);
  const [watchId,            setWatchId           ] = useState(null);
  const [accuracy,           setAccuracy          ] = useState(null);
  const [locationMethod,     setLocationMethod    ] = useState(null);
  const mapRef = useRef(null);

  const [activeTab,          setActiveTab         ] = useState("tracker");
  const [source,             setSource            ] = useState("");
  const [destination,        setDestination       ] = useState("");
  const [routeInfo,          setRouteInfo         ] = useState(null);
  const [routingWaypoints,   setRoutingWaypoints  ] = useState([]);
  const [isRoutingLoading,   setIsRoutingLoading  ] = useState(false);
  const [totalRouteDistance, setTotalRouteDistance] = useState(null);
  const [navInstructions,    setNavInstructions   ] = useState([]);
  const [routeCoordinates,   setRouteCoordinates  ] = useState([]);

  const [isNavigating,       setIsNavigating      ] = useState(false);
  const [navStep,            setNavStep           ] = useState(0);
  const [routeProgress,      setRouteProgress     ] = useState(0);
  const [simIndex,           setSimIndex          ] = useState(0);

  const { alertOverlay } = useDestinationAlerts({
    currentPosition, routingWaypoints, isTracking: isTracking || isNavigating, totalRouteDistance,
  });

  /* Reset nav when new route loaded */
  useEffect(() => {
    setIsNavigating(false); setNavStep(0); setRouteProgress(0); setNavInstructions([]); setRouteCoordinates([]); setSimIndex(0);
  }, [routingWaypoints]);

  /* Demo Navigation Loop */
  useEffect(() => {
    let interval;
    if (isNavigating && routeCoordinates.length > 0) {
      interval = setInterval(() => {
        setSimIndex(prev => {
          // Adjust step to make the demo take ~15-20 seconds
          const step = Math.max(1, Math.floor(routeCoordinates.length / 150));
          const next = prev + step;
          
          if (next >= routeCoordinates.length - 1) {
            clearInterval(interval);
            const finalCoord = routeCoordinates[routeCoordinates.length - 1];
            setCurrentPosition([finalCoord.lat, finalCoord.lng]);
            return routeCoordinates.length - 1;
          }
          
          const coord = routeCoordinates[next];
          const newPos = [coord.lat, coord.lng];
          setCurrentPosition(newPos);
          
          if (mapRef.current) mapRef.current.panTo(newPos, { animate: true, duration: 0.1 });
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isNavigating, routeCoordinates]);

  /* Update progress + auto-advance step while navigating */
  useEffect(() => {
    if (!isNavigating || routingWaypoints.length !== 2 || !totalRouteDistance) return;
    const [,dest] = routingWaypoints;
    const [curLat, curLon] = currentPosition;
    const distToDest = getDistKm(curLat, curLon, +dest.lat, +dest.lon);
    const pct = Math.min(100, Math.max(0, ((totalRouteDistance - distToDest) / totalRouteDistance) * 100));
    setRouteProgress(pct);
    if (navInstructions.length > 0) {
      const expected = Math.floor((pct / 100) * navInstructions.length);
      setNavStep(s => Math.min(Math.max(s, expected), navInstructions.length - 1));
    }
  }, [currentPosition, isNavigating, routingWaypoints, totalRouteDistance, navInstructions]);

  /* Location helpers */
  const getIPLoc = async () => {
    let res = await fetch("https://ipapi.co/json/"); const d = await res.json();
    if (d.latitude) return { latitude: d.latitude, longitude: d.longitude, accuracy: 50000, method: "ipapi" };
    res = await fetch("https://ipwho.is/"); const fb = await res.json();
    return { latitude: fb.latitude, longitude: fb.longitude, accuracy: 50000, method: "ipwhois" };
  };
  const getLocation = async () => {
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
        );
        return { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy, method: "gps" };
      } catch { console.log("GPS failed, falling back to IP"); }
    }
    return getIPLoc();
  };

  const handleTrackMe = async () => {
    if (!isTracking) {
      try {
        const loc = await getLocation();
        const nl  = [loc.latitude, loc.longitude];
        setCurrentPosition(nl); setAccuracy(loc.accuracy); setLocationMethod(loc.method);
        if (mapRef.current) mapRef.current.setView(nl, 15);
        if (navigator.geolocation && loc.method === "gps") {
          const id = navigator.geolocation.watchPosition(
            p => setCurrentPosition([p.coords.latitude, p.coords.longitude]),
            err => console.log("Watch error:", err),
            { enableHighAccuracy: true, maximumAge: 10000 }
          );
          setWatchId(id);
        }
        setIsTracking(true);
      } catch (e) { console.error(e); }
    } else {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      setIsTracking(false); setWatchId(null); setLocationMethod(null); setIsNavigating(false);
    }
  };
  useEffect(() => () => { if (watchId) navigator.geolocation.clearWatch(watchId); }, [watchId]);

  const handleFindRoute = async () => {
    if (!source || !destination) return;
    setIsRoutingLoading(true); setRouteInfo(null); setTotalRouteDistance(null);
    try {
      const [sR, dR] = await Promise.all([
        axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(source)}`),
        axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`),
      ]);
      if (sR.data.length && dR.data.length) {
        setRoutingWaypoints([
          { lat: sR.data[0].lat, lon: sR.data[0].lon },
          { lat: dR.data[0].lat, lon: dR.data[0].lon },
        ]);
      } else {
        toast.error("Could not find one or both locations. Try a more specific address.");
      }
    } catch { toast.error("Error finding route. Please try again."); }
    finally { setIsRoutingLoading(false); }
  };

  const startNav = () => {
    setIsNavigating(true); setNavStep(0); setRouteProgress(0); setSimIndex(0);
    if (mapRef.current && routeCoordinates.length > 0) {
      const first = routeCoordinates[0];
      mapRef.current.setView([first.lat, first.lng], 16);
    }
    toast.success("Demo Navigation started!", { icon: "🧭" });
  };
  const stopNav = () => { setIsNavigating(false); setNavStep(0); setRouteProgress(0); setSimIndex(0); };

  const curInstruction  = navInstructions[navStep]     || null;
  const nextInstruction = navInstructions[navStep + 1] || null;

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-[calc(100vh-72px)] relative" style={{ background: "#0A0A0F" }}>
      <style>{STYLES}</style>

      {/* ── Control Panel ─────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0 z-[1000] relative bg-[#0A0A0F]">

        {/* Tab switcher */}
        <div className="flex bg-[#1A1A24] p-1 rounded-xl mb-4">
          {["tracker","route"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? "bg-[#FF2D55] text-white shadow-md" : "text-[#9CA3AF]"}`}>
              {tab === "tracker" ? "Live Tracker" : "Find Route"}
            </button>
          ))}
        </div>

        {/* ── TRACKER TAB ── */}
        {activeTab === "tracker" ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-white font-black text-xl">Live Tracker</h1>
                <p className="text-[#9CA3AF] text-xs mt-0.5">Real-time location monitoring</p>
              </div>
              {locationMethod && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${locationMethod === "gps" ? "text-[#4ade80]" : "text-[#fbbf24]"}`}
                  style={{ background: locationMethod === "gps" ? "rgba(74,222,128,.1)" : "rgba(251,191,36,.1)", border: `1px solid ${locationMethod === "gps" ? "rgba(74,222,128,.25)" : "rgba(251,191,36,.25)"}` }}>
                  {locationMethod === "gps" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {locationMethod === "gps" ? "GPS Active" : "IP Location"}
                </div>
              )}
            </div>
            <button onClick={handleTrackMe}
              className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${isTracking ? "text-[#FF6B9D]" : "btn-primary"}`}
              style={isTracking ? { background: "rgba(255,45,85,.08)", border: "1px solid rgba(255,45,85,.25)" } : {}}>
              {isTracking ? <><Square className="w-4 h-4 fill-current" />Stop Tracking</> : <><Navigation className="w-4 h-4" />Track My Location</>}
              {isTracking && <span className="w-2 h-2 rounded-full bg-[#FF2D55] pulse-dot ml-1" />}
            </button>
            {accuracy && <p className="text-center text-[#6B7280] text-xs mt-2">Accuracy: ~{accuracy < 1000 ? `${Math.round(accuracy)}m` : `${Math.round(accuracy/1000)}km`}</p>}
          </>

        ) : (
          /* ── ROUTE TAB ── */
          <div className="space-y-3 animate-fadeIn">
            <input type="text" placeholder="Enter Source..." value={source} onChange={e => setSource(e.target.value)}
              className="w-full bg-[#1A1A24] text-white px-4 py-3 rounded-xl border border-white/5 focus:border-[#FF2D55] outline-none text-sm transition-all" />
            <input type="text" placeholder="Enter Destination..." value={destination} onChange={e => setDestination(e.target.value)}
              className="w-full bg-[#1A1A24] text-white px-4 py-3 rounded-xl border border-white/5 focus:border-[#FF2D55] outline-none text-sm transition-all" />
            <button onClick={handleFindRoute} disabled={isRoutingLoading || !source || !destination}
              className="w-full btn-primary py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {isRoutingLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MapPin className="w-4 h-4" />}
              {isRoutingLoading ? "Finding Route…" : "Find Route"}
            </button>

            {/* Route stats */}
            {routeInfo && (
              <div className="animate-fadeInUp space-y-2">
                <div className="flex justify-between items-stretch bg-[#FF2D55]/10 border border-[#FF2D55]/20 p-3 rounded-xl">
                  <div className="text-center flex-1 border-r border-[#FF2D55]/20">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-[#FF6B9D]" />
                      <p className="text-[#9CA3AF] text-xs">Distance</p>
                    </div>
                    <p className="text-white font-bold text-base">{routeInfo.distance} km</p>
                  </div>
                  <div className="text-center flex-1">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-[#FF6B9D]" />
                      <p className="text-[#9CA3AF] text-xs">Transit ETA</p>
                    </div>
                    <p className="text-white font-bold text-base">{routeInfo.duration}</p>
                  </div>
                </div>

                {/* Start / Stop Navigation */}
                {!isNavigating ? (
                  <button onClick={startNav}
                    className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 nav-glow"
                    style={{ background: "linear-gradient(135deg,#FF2D55,#FF6B9D)", color: "#fff" }}>
                    <Play className="w-4 h-4 fill-white" /> Start Journey
                  </button>
                ) : (
                  <div className="space-y-2">
                    {/* Progress bar */}
                    <ProgressBar pct={routeProgress} />

                    {/* Current direction */}
                    <TurnCard instruction={curInstruction} dimmed={false} />

                    {/* Next direction */}
                    {nextInstruction && <TurnCard instruction={nextInstruction} dimmed={true} />}

                    {/* Manual step controls */}
                    <div className="flex gap-2">
                      <button onClick={() => setNavStep(s => Math.max(0, s - 1))} disabled={navStep === 0}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-[#9CA3AF] disabled:opacity-30 transition-all"
                        style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
                        ← Prev Step
                      </button>
                      <button onClick={() => setNavStep(s => Math.min(navInstructions.length - 1, s + 1))} disabled={navStep >= navInstructions.length - 1}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-[#9CA3AF] disabled:opacity-30 transition-all"
                        style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
                        Next Step →
                      </button>
                    </div>

                    {/* Step indicator */}
                    {navInstructions.length > 0 && (
                      <p className="text-center text-[#6B7280] text-xs">
                        Step {navStep + 1} of {navInstructions.length}
                      </p>
                    )}

                    {/* Stop navigation */}
                    <button onClick={stopNav}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                      style={{ background: "rgba(255,45,85,.08)", border: "1px solid rgba(255,45,85,.25)", color: "#FF6B9D" }}>
                      <StopCircle className="w-4 h-4" /> Stop Navigation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Map ───────────────────────────────────────────── */}
      <div className="flex-1 px-4 pb-2 min-h-0" style={{ position: "relative" }}>
        <div className="h-full w-full overflow-hidden"
          style={{ borderRadius: "20px", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 8px 32px rgba(0,0,0,.5), 0 0 0 1px rgba(255,45,85,.08)", position: "relative" }}>

          <MapContainer center={currentPosition} zoom={15} className="h-full w-full"
            whenCreated={map => { mapRef.current = map; }} style={{ borderRadius: "20px" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
            <CustomRoutingMachine
              waypoints={routingWaypoints}
              onRouteFound={setRouteInfo}
              onTotalDistance={setTotalRouteDistance}
              onInstructions={setNavInstructions}
              onRouteCoordinates={setRouteCoordinates}
            />
            {(activeTab === "tracker" || isNavigating) && (
              <Marker position={currentPosition}>
                <Popup>
                  <div style={{ fontFamily: "Inter, sans-serif", padding: "4px" }}>
                    <strong style={{ color: "#FF2D55" }}>{isNavigating ? "Navigating" : "You are here"}</strong>
                    {locationMethod && !isNavigating && <p style={{ fontSize: "12px", color: "#6B7280", margin: "4px 0 0" }}>via {locationMethod.toUpperCase()}</p>}
                    {isNavigating && <p style={{ fontSize: "12px", color: "#6B7280", margin: "4px 0 0" }}>Demo Mode Active</p>}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Destination alert overlay (existing hook) */}
          {alertOverlay}

          {/* Navigation status badge on map */}
          {isNavigating && (
            <div style={{ position: "absolute", top: "12px", left: "16px", zIndex: 2000,
              background: "rgba(26,26,36,.92)", border: "1px solid rgba(255,45,85,.4)", borderRadius: "12px",
              padding: "7px 12px", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: "7px" }}>
              <Activity className="w-3.5 h-3.5" style={{ color: "#FF2D55" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF6B9D" }}>Navigating</span>
              <span className="w-2 h-2 rounded-full bg-[#FF2D55] pulse-dot" />
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default TrackMeMap;
