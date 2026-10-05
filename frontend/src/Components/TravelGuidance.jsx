import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Config } from "../../API/Config";
import BottomNav from "./Home/BottomNav";
import {
  Train, Bus, Navigation, MapPin, ArrowRight, ArrowLeft,
  AlertTriangle, CheckCircle, Clock, RefreshCw, ChevronRight,
  Zap, Radio, X, Search
} from "lucide-react";

// ─── CSS injected once ───────────────────────────────────────────
const STYLES = `
@keyframes pulseGlow {
  0%,100% { box-shadow: 0 0 8px 2px currentColor; opacity:.7; }
  50%      { box-shadow: 0 0 18px 6px currentColor; opacity:1; }
}
@keyframes slideDown {
  from { opacity:0; transform:translateY(-16px) scale(.97); }
  to   { opacity:1; transform:translateY(0)     scale(1);   }
}
@keyframes slideUp {
  from { opacity:0; transform:translateY(20px) scale(.97); }
  to   { opacity:1; transform:translateY(0)    scale(1);   }
}
@keyframes progressFill {
  from { width:0; }
}
@keyframes stepIn {
  from { opacity:0; transform:translateX(-12px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes trainMove {
  0%   { left:0%; }
  100% { left:calc(100% - 28px); }
}
@keyframes wrongPlatform {
  0%,100% { border-color:rgba(239,68,68,.3); }
  50%      { border-color:rgba(239,68,68,.8); }
}
.guidance-slide-down  { animation: slideDown .35s cubic-bezier(.34,1.56,.64,1) both; }
.guidance-slide-up    { animation: slideUp  .38s cubic-bezier(.34,1.56,.64,1) both; }
.step-in { animation: stepIn .3s ease both; }
.wrong-platform-pulse { animation: wrongPlatform 1.2s ease infinite; }
.train-anim { animation: trainMove 2.4s ease-in-out infinite alternate; }
`;

// ─── Palette helpers ─────────────────────────────────────────────
const glass = (alpha = ".12") => `rgba(255,255,255,${alpha})`;
const bg    = "rgba(26,26,36,.96)";

// ─── Sub-components ──────────────────────────────────────────────

/** Animated train/bus icon that moves along the track */
const TrainTrack = ({ color, type }) => (
  <div style={{ position:"relative", height:"28px", overflow:"hidden", marginBottom:"8px" }}>
    {/* Track */}
    <div style={{ position:"absolute", top:"50%", left:0, right:0, height:"2px",
      background:`linear-gradient(90deg, transparent, ${color}55, ${color}, ${color}55, transparent)`,
      transform:"translateY(-50%)" }} />
    {/* Moving icon */}
    <div className="train-anim" style={{ position:"absolute", top:"50%", transform:"translateY(-50%)",
      width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center",
      background:`${color}22`, border:`1px solid ${color}66`, borderRadius:"8px" }}>
      {type === "bus"
        ? <Bus  style={{ width:14, height:14, color }} />
        : <Train style={{ width:14, height:14, color }} />}
    </div>
  </div>
);

/** Single step card */
const StepCard = ({ step, index, color, isActive, delay }) => {
  const icons = {
    platform   : <Navigation style={{ width:18, height:18 }} />,
    train      : <Train style={{ width:18, height:18 }} />,
    interchange: <RefreshCw style={{ width:18, height:18 }} />,
    exit       : <MapPin style={{ width:18, height:18 }} />,
  };
  return (
    <div className="step-in" style={{ animationDelay:`${delay}ms`,
      background: isActive ? `${color}18` : bg,
      border    : `1px solid ${isActive ? color+"55" : glass(".06")}`,
      borderRadius:"14px", padding:"14px 16px", marginBottom:"10px",
      boxShadow : isActive ? `0 0 16px ${color}33` : "none",
      transition:"all .3s" }}>
      <div style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
        {/* Step number bubble */}
        <div style={{ flexShrink:0, width:"32px", height:"32px", borderRadius:"10px",
          background:`${color}22`, border:`1px solid ${color}44`,
          display:"flex", alignItems:"center", justifyContent:"center", color }}>
          {icons[step.icon] || <ChevronRight style={{ width:18, height:18 }} />}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ margin:0, color:"#fff", fontWeight:600, fontSize:"14px", lineHeight:1.4 }}>
            {step.text}
          </p>
          <p style={{ margin:"4px 0 0", color:"#9CA3AF", fontSize:"12px" }}>
            {step.detail}
          </p>
        </div>
        {isActive && (
          <div style={{ flexShrink:0, width:"8px", height:"8px", borderRadius:"50%",
            background:color, animation:"pulseGlow 1.4s ease infinite", color }} />
        )}
      </div>
    </div>
  );
};

/** Stop progress bar */
const StopsProgress = ({ stopsAlong = [], destination, color, currentStep }) => {
  const stops = [...(stopsAlong || []).slice(0, -1), destination];
  if (!stops.length) return null;
  const pct = Math.min(100, (currentStep / Math.max(1, stops.length - 1)) * 100);

  return (
    <div style={{ marginBottom:"16px" }}>
      <p style={{ margin:"0 0 8px", color:"#9CA3AF", fontSize:"11px", fontWeight:600, letterSpacing:".05em", textTransform:"uppercase" }}>
        Stops Along Route
      </p>
      {/* Bar */}
      <div style={{ position:"relative", height:"4px", background:"rgba(255,255,255,.08)", borderRadius:"4px", marginBottom:"12px" }}>
        <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${pct}%`,
          background:`linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius:"4px", transition:"width .6s ease",
          animation:"progressFill .8s ease both" }} />
      </div>
      {/* Dot row */}
      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
        {stops.map((stop, i) => (
          <div key={i} style={{
            padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:500,
            background: i < currentStep ? `${color}22` : "rgba(255,255,255,.04)",
            border    : `1px solid ${i < currentStep ? color+"44" : "rgba(255,255,255,.06)"}`,
            color     : i < currentStep ? color : "#6B7280",
            transition:"all .3s" }}>
            {stop}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Wrong-platform smart alert */
const WrongPlatformAlert = ({ correctPlatform, color, onDismiss }) => (
  <div className="guidance-slide-down wrong-platform-pulse"
    style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.4)",
      borderRadius:"14px", padding:"12px 16px", marginBottom:"12px", position:"relative" }}>
    <button onClick={onDismiss} style={{ position:"absolute", top:10, right:10,
      background:"none", border:"none", cursor:"pointer", color:"#6B7280" }}>
      <X style={{ width:14, height:14 }} />
    </button>
    <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
      <AlertTriangle style={{ width:18, height:18, color:"#EF4444", flexShrink:0 }} />
      <div>
        <p style={{ margin:0, color:"#FCA5A5", fontWeight:700, fontSize:"13px" }}>
          Wrong Platform Detected!
        </p>
        <p style={{ margin:"2px 0 0", color:"#9CA3AF", fontSize:"12px" }}>
          Move to Platform {correctPlatform} for your journey
        </p>
      </div>
    </div>
  </div>
);

// ─── Autocomplete Input ──────────────────────────────────────────
const StationInput = ({ value, onChange, placeholder, stations, icon: Icon, color }) => {
  const [open,     setOpen    ] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    if (!value.trim()) { setFiltered([]); setOpen(false); return; }
    const q = value.toLowerCase();
    const f = stations.filter(s => s.toLowerCase().includes(q)).slice(0, 7);
    setFiltered(f);
    setOpen(f.length > 0);
  }, [value, stations]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <Icon style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
          width:16, height:16, color, zIndex:1 }} />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => filtered.length && setOpen(true)}
          placeholder={placeholder}
          style={{
            width:"100%", boxSizing:"border-box",
            background:"rgba(26,26,36,.9)",
            border:`1px solid ${value ? color+"44" : "rgba(255,255,255,.07)"}`,
            borderRadius:"12px", padding:"12px 14px 12px 40px",
            color:"#fff", fontSize:"14px", outline:"none",
            transition:"border-color .2s",
          }}
        />
      </div>
      {open && (
        <div className="guidance-slide-down" style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:9999,
          background:"rgba(18,18,28,.98)", border:`1px solid ${color}33`,
          borderRadius:"12px", overflow:"hidden",
          boxShadow:"0 16px 48px rgba(0,0,0,.7)" }}>
          {filtered.map((s, i) => (
            <div key={i} onClick={() => { onChange(s); setOpen(false); }}
              style={{ padding:"10px 16px", cursor:"pointer", fontSize:"13px", color:"#E5E7EB",
                borderBottom:"1px solid rgba(255,255,255,.04)",
                transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = `${color}18`}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <MapPin style={{ width:12, height:12, color, display:"inline", marginRight:8 }} />
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────
export default function TravelGuidance() {
  const [stations,       setStations      ] = useState([]);
  const [source,         setSource        ] = useState("");
  const [dest,           setDest          ] = useState("");
  const [guidance,       setGuidance      ] = useState(null);
  const [loading,        setLoading       ] = useState(false);
  const [error,          setError         ] = useState("");
  const [activeStep,     setActiveStep    ] = useState(0);
  const [showWrongPlat,  setShowWrongPlat ] = useState(false);
  const [simActive,      setSimActive     ] = useState(false);
  const wrongPlatTimer = useRef(null);

  // Fetch station list on mount
  useEffect(() => {
    axios.get(Config.STATIONSUrl)
      .then(r => setStations(r.data.stations || []))
      .catch(() => {});
  }, []);

  // Random wrong-platform alert demo after 8s of active guidance
  useEffect(() => {
    if (!guidance) return;
    setShowWrongPlat(false);
    wrongPlatTimer.current = setTimeout(() => setShowWrongPlat(true), 8000);
    return () => clearTimeout(wrongPlatTimer.current);
  }, [guidance]);

  const handleSearch = async () => {
    if (!source.trim() || !dest.trim()) return;
    setLoading(true); setError(""); setGuidance(null); setActiveStep(0); setSimActive(false);
    try {
      const { data } = await axios.get(Config.GUIDANCEUrl, { params: { source, destination: dest } });
      setGuidance(data);
    } catch (e) {
      setError(e.response?.data?.message || "Could not fetch guidance. Check backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const swapStations = () => { setSource(dest); setDest(source); setGuidance(null); };

  // Simulate journey progress
  const handleSimulate = () => {
    setSimActive(true);
    setActiveStep(0);
    let step = 0;
    const total = guidance.steps.length;
    const tick = setInterval(() => {
      step += 1;
      setActiveStep(step);
      if (step >= total - 1) clearInterval(tick);
    }, 1800);
  };

  const color = guidance?.lineColor || "#FF2D55";

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"calc(100vh - 72px)",
      background:"#0A0A0F", overflowY:"auto" }}>
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div style={{ padding:"20px 16px 0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"4px" }}>
          <div style={{ width:36, height:36, borderRadius:"10px",
            background:"rgba(255,45,85,.15)", border:"1px solid rgba(255,45,85,.3)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Train style={{ width:18, height:18, color:"#FF2D55" }} />
          </div>
          <div>
            <h1 style={{ margin:0, color:"#fff", fontWeight:800, fontSize:"20px", lineHeight:1.2 }}>
              Travel Guidance
            </h1>
            <p style={{ margin:0, color:"#6B7280", fontSize:"12px" }}>
              Metro · Bus · Public Transport
            </p>
          </div>
        </div>
      </div>

      {/* ── Search panel ── */}
      <div style={{ padding:"16px", flexShrink:0 }}>
        <div style={{ background:"rgba(26,26,36,.85)", border:"1px solid rgba(255,255,255,.07)",
          borderRadius:"20px", padding:"16px",
          boxShadow:"0 8px 32px rgba(0,0,0,.5)" }}>

          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <StationInput value={source} onChange={setSource} placeholder="From station..."
              stations={stations} icon={Radio} color="#FF2D55" />

            {/* Swap button */}
            <div style={{ display:"flex", justifyContent:"center" }}>
              <button onClick={swapStations} style={{
                background:"rgba(255,45,85,.1)", border:"1px solid rgba(255,45,85,.25)",
                borderRadius:"10px", padding:"6px 20px", cursor:"pointer", color:"#FF6B9D",
                fontSize:"12px", fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                <ArrowLeft style={{ width:12, height:12 }} />
                Swap
                <ArrowRight style={{ width:12, height:12 }} />
              </button>
            </div>

            <StationInput value={dest} onChange={setDest} placeholder="To station..."
              stations={stations} icon={MapPin} color="#8B5CF6" />

            <button onClick={handleSearch}
              disabled={loading || !source.trim() || !dest.trim()}
              style={{
                width:"100%", padding:"13px", borderRadius:"14px", border:"none",
                background: loading || !source.trim() || !dest.trim()
                  ? "rgba(255,45,85,.3)"
                  : "linear-gradient(135deg,#FF2D55,#FF6B9D)",
                color:"#fff", fontWeight:700, fontSize:"14px",
                cursor: loading || !source.trim() || !dest.trim() ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                boxShadow: "0 4px 20px rgba(255,45,85,.4)",
                transition:"all .2s"
              }}>
              {loading
                ? <><div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,.3)",
                    borderTopColor:"#fff", borderRadius:"50%",
                    animation:"spin 1s linear infinite" }} />Finding Route...</>
                : <><Search style={{ width:16, height:16 }} />Get Guidance</>}
            </button>
          </div>
        </div>

        {error && (
          <div className="guidance-slide-down" style={{ marginTop:"10px",
            background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)",
            borderRadius:"12px", padding:"12px 16px",
            display:"flex", gap:"10px", alignItems:"center" }}>
            <AlertTriangle style={{ width:16, height:16, color:"#EF4444", flexShrink:0 }} />
            <p style={{ margin:0, color:"#FCA5A5", fontSize:"13px" }}>{error}</p>
          </div>
        )}
      </div>

      {/* ── Guidance result ── */}
      {guidance && (
        <div className="guidance-slide-up" style={{ padding:"0 16px 16px", flex:1 }}>

          {/* Header card */}
          <div style={{ background:bg, border:`1px solid ${color}33`,
            borderRadius:"20px", padding:"16px", marginBottom:"12px",
            boxShadow:`0 8px 32px ${color}22`,
            position:"relative", overflow:"hidden" }}>
            {/* Colour strip */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px",
              background:`linear-gradient(90deg, transparent, ${color}, transparent)` }} />

            <TrainTrack color={color} type={guidance.lineType} />

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                  <span style={{ background:`${color}22`, border:`1px solid ${color}44`,
                    color, padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:700 }}>
                    {guidance.lineName}
                  </span>
                  {guidance.type === "interchange" && (
                    <span style={{ background:"rgba(139,92,246,.15)", border:"1px solid rgba(139,92,246,.3)",
                      color:"#A78BFA", padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:600 }}>
                      Interchange
                    </span>
                  )}
                </div>
                <p style={{ margin:0, color:"#fff", fontWeight:700, fontSize:"16px" }}>
                  {guidance.source} → {guidance.destination}
                </p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ margin:0, color, fontWeight:800, fontSize:"22px" }}>
                  ~{guidance.estimatedMinutes}m
                </p>
                <p style={{ margin:0, color:"#6B7280", fontSize:"11px" }}>est. time</p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginTop:"14px" }}>
              {[
                { label:"Platform",  val:`P${guidance.platform}`,             icon:<Navigation style={{width:13,height:13}}/> },
                { label:"Stops",     val:guidance.stopsCount,                  icon:<ChevronRight style={{width:13,height:13}}/> },
                { label:"Every",     val:guidance.frequency || "—",            icon:<Clock style={{width:13,height:13}}/> },
              ].map(({ label, val, icon }) => (
                <div key={label} style={{ background:"rgba(255,255,255,.04)",
                  border:"1px solid rgba(255,255,255,.07)", borderRadius:"12px",
                  padding:"10px", textAlign:"center" }}>
                  <div style={{ color:"#6B7280", marginBottom:"4px", display:"flex", justifyContent:"center" }}>
                    {icon}
                  </div>
                  <p style={{ margin:0, color:"#fff", fontWeight:700, fontSize:"15px" }}>{val}</p>
                  <p style={{ margin:0, color:"#6B7280", fontSize:"10px" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wrong platform alert */}
          {showWrongPlat && (
            <WrongPlatformAlert correctPlatform={guidance.platform} color={color}
              onDismiss={() => setShowWrongPlat(false)} />
          )}

          {/* Direction card */}
          <div style={{ background:bg, border:`1px solid ${color}22`,
            borderRadius:"16px", padding:"14px 16px", marginBottom:"12px",
            display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ width:40, height:40, borderRadius:"12px",
              background:`${color}18`, border:`1px solid ${color}33`,
              display:"flex", alignItems:"center", justifyContent:"center",
              animation:"pulseGlow 2s ease infinite", color }}>
              <Zap style={{ width:20, height:20 }} />
            </div>
            <div>
              <p style={{ margin:0, color:"#9CA3AF", fontSize:"11px", fontWeight:600, textTransform:"uppercase", letterSpacing:".05em" }}>
                Direction
              </p>
              <p style={{ margin:"2px 0 0", color:"#fff", fontWeight:700, fontSize:"14px" }}>
                Towards {guidance.towards}
              </p>
              <p style={{ margin:"2px 0 0", color:"#6B7280", fontSize:"12px" }}>
                Exit on the <span style={{ color }}>{guidance.exitSide}</span> side
              </p>
            </div>
          </div>

          {/* Stops progress */}
          {guidance.stopsAlong?.length > 0 && (
            <div style={{ background:bg, border:"1px solid rgba(255,255,255,.07)",
              borderRadius:"16px", padding:"14px 16px", marginBottom:"12px" }}>
              <StopsProgress stopsAlong={guidance.stopsAlong} destination={guidance.destination}
                color={color} currentStep={activeStep} />
            </div>
          )}

          {/* Step-by-step */}
          <div style={{ marginBottom:"12px" }}>
            <p style={{ margin:"0 0 10px", color:"#9CA3AF", fontSize:"11px", fontWeight:600,
              textTransform:"uppercase", letterSpacing:".05em" }}>
              Step-by-Step
            </p>
            {guidance.steps.map((step, i) => (
              <StepCard key={i} step={step} index={i} color={color}
                isActive={simActive && activeStep === i}
                delay={i * 80} />
            ))}
          </div>

          {/* Simulate button */}
          <button onClick={handleSimulate} disabled={simActive}
            style={{
              width:"100%", padding:"13px", borderRadius:"14px", border:"none",
              background: simActive
                ? "rgba(139,92,246,.1)"
                : "linear-gradient(135deg,rgba(139,92,246,.8),rgba(99,102,241,.8))",
              color: simActive ? "#A78BFA" : "#fff",
              fontWeight:700, fontSize:"14px", cursor: simActive ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
              border: simActive ? "1px solid rgba(139,92,246,.3)" : "none",
              boxShadow: simActive ? "none" : "0 4px 20px rgba(139,92,246,.4)",
              transition:"all .2s"
            }}>
            <Zap style={{ width:16, height:16 }} />
            {simActive ? "Simulation Running…" : "Simulate Journey"}
          </button>

          {/* Arrived */}
          {simActive && activeStep >= guidance.steps.length - 1 && (
            <div className="guidance-slide-up" style={{ marginTop:"12px",
              background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.3)",
              borderRadius:"14px", padding:"14px 16px",
              display:"flex", gap:"10px", alignItems:"center" }}>
              <CheckCircle style={{ width:20, height:20, color:"#22C55E", flexShrink:0 }} />
              <div>
                <p style={{ margin:0, color:"#86EFAC", fontWeight:700, fontSize:"14px" }}>
                  You have arrived!
                </p>
                <p style={{ margin:"2px 0 0", color:"#6B7280", fontSize:"12px" }}>
                  Welcome to {guidance.destination}. Stay safe 💜
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
