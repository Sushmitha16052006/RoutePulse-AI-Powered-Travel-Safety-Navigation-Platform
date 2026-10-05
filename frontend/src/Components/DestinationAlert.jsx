import React, { useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Bell, X, Zap } from "lucide-react";

// ── CSS for alert animations ─────────────────────────────────────
const ALERT_CSS = `
@keyframes alertSlideUp {
  from { opacity:0; transform:translateY(24px) scale(0.95); }
  to   { opacity:1; transform:translateY(0)    scale(1);    }
}
@keyframes glowPulse {
  0%,100% { box-shadow:0 0 0 0 rgba(255,45,85,0); }
  50%     { box-shadow:0 0 0 6px rgba(255,45,85,0.18); }
}
@keyframes borderRotate {
  0%   { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
@keyframes ringPulse {
  0%   { transform:scale(1);   opacity:0.6; }
  100% { transform:scale(1.55);opacity:0; }
}
.dest-alert-enter { animation: alertSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
.ring-pulse       { animation: ringPulse 1.4s ease-out infinite; }
`;

// ── Voice helper ─────────────────────────────────────────────────
export const speakAlert = (message) => {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u   = new SpeechSynthesisUtterance(message);
    u.lang    = "en-US";
    u.rate    = 0.92;
    u.pitch   = 1.08;
    u.volume  = 1;
    // Prefer a female voice if available
    const voices = window.speechSynthesis.getVoices();
    const female  = voices.find(v => /female|woman|zira|samantha|karen|victoria/i.test(v.name));
    if (female) u.voice = female;
    window.speechSynthesis.speak(u);
  } catch (e) { console.warn("SpeechSynthesis:", e); }
};

// ── Haversine distance (km) ──────────────────────────────────────
export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// ── Alert configs ────────────────────────────────────────────────
const CONFIGS = {
  midway: {
    icon  : <Navigation className="w-6 h-6" style={{ color:"#8B5CF6" }} />,
    title : "Halfway There! 🎉",
    msg   : "You've reached the midpoint of your journey. Stay alert and safe!",
    accent: "#8B5CF6",
    glow  : "rgba(139,92,246,0.22)",
    border: "rgba(139,92,246,0.4)",
    ring  : "rgba(139,92,246,0.25)",
  },
  near: {
    icon  : <MapPin className="w-6 h-6" style={{ color:"#FF2D55" }} />,
    title : "Your Stop is Nearby! 📍",
    msg   : "You are within 500 m of your destination. Prepare to arrive safely!",
    accent: "#FF2D55",
    glow  : "rgba(255,45,85,0.22)",
    border: "rgba(255,45,85,0.45)",
    ring  : "rgba(255,45,85,0.25)",
  },
};

// ── AlertCard ────────────────────────────────────────────────────
const AlertCard = ({ type, onDismiss }) => {
  const c = CONFIGS[type];
  return (
    <>
      <style>{ALERT_CSS}</style>
      <div className="dest-alert-enter" style={{ position:"relative" }}>
        {/* Outer pulse ring */}
        <div className="ring-pulse" style={{
          position:"absolute", inset:"-6px", borderRadius:"26px",
          border:`2px solid ${c.ring}`, pointerEvents:"none",
        }} />

        {/* Card */}
        <div style={{
          position     :"relative",
          background   :"rgba(16,16,28,0.97)",
          border       :`1px solid ${c.border}`,
          borderRadius :"20px",
          padding      :"18px 20px",
          backdropFilter:"blur(24px)",
          boxShadow    :`0 12px 48px rgba(0,0,0,0.65), 0 0 0 1px ${c.border}, 0 0 28px ${c.glow}`,
          overflow     :"hidden",
        }}>
          {/* Top glow strip */}
          <div style={{
            position :"absolute", top:0, left:0, right:0, height:"2px",
            background:`linear-gradient(90deg,transparent,${c.accent},transparent)`,
          }} />
          {/* Bottom subtle strip */}
          <div style={{
            position :"absolute", bottom:0, left:"20%", right:"20%", height:"1px",
            background:`linear-gradient(90deg,transparent,${c.glow},transparent)`,
          }} />

          {/* Dismiss */}
          <button onClick={onDismiss} style={{
            position:"absolute", top:"12px", right:"12px",
            background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:"8px", padding:"4px 5px", cursor:"pointer",
            display:"flex", alignItems:"center",
          }}>
            <X className="w-3 h-3" style={{ color:"#6B7280" }} />
          </button>

          {/* Content */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:"14px", paddingRight:"24px" }}>
            <div style={{
              flexShrink:0, width:"44px", height:"44px", borderRadius:"12px",
              background:c.glow, border:`1px solid ${c.border}`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {c.icon}
            </div>
            <div>
              <p style={{ margin:0, color:"#fff", fontWeight:800, fontSize:"15px", lineHeight:"1.3" }}>
                {c.title}
              </p>
              <p style={{ margin:"5px 0 0", color:"#9CA3AF", fontSize:"12px", lineHeight:"1.55" }}>
                {c.msg}
              </p>
            </div>
          </div>

          {/* Bell accent row */}
          <div style={{
            marginTop:"12px", paddingTop:"10px",
            borderTop:"1px solid rgba(255,255,255,0.06)",
            display:"flex", alignItems:"center", gap:"6px",
          }}>
            <Bell className="w-3 h-3" style={{ color:c.accent }} />
            <span style={{ fontSize:"10px", color:"#6B7280", fontWeight:600, letterSpacing:"0.04em" }}>
              VOICE ALERT TRIGGERED
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Main hook ─────────────────────────────────────────────────────
export const useDestinationAlerts = ({
  currentPosition,
  routingWaypoints,
  isTracking,
  totalRouteDistance,
}) => {
  const [activeAlert, setActiveAlert] = React.useState(null);
  const midwayFired = useRef(false);
  const nearFired   = useRef(false);

  // Reset on new route
  useEffect(() => {
    midwayFired.current = false;
    nearFired.current   = false;
    setActiveAlert(null);
  }, [routingWaypoints]);

  // Proximity monitoring
  useEffect(() => {
    if (!isTracking || routingWaypoints.length !== 2 || !totalRouteDistance) return;
    const [src, dest]    = routingWaypoints;
    const [curLat, curLon] = currentPosition;
    const distToDest  = getDistanceKm(curLat, curLon, +dest.lat, +dest.lon);
    const distFromSrc = getDistanceKm(curLat, curLon, +src.lat,  +src.lon);
    const total       = +totalRouteDistance;

    if (!nearFired.current && distToDest <= 0.5) {
      nearFired.current = true;
      setActiveAlert("near");
      speakAlert("Your stop is nearby. You will arrive shortly. Stay safe.");
      if (navigator.vibrate) navigator.vibrate([200,100,200,100,200]);
    } else if (!midwayFired.current && !nearFired.current && total > 0) {
      const pct = distFromSrc / total;
      if (pct >= 0.4 && pct <= 0.65) {
        midwayFired.current = true;
        setActiveAlert("midway");
        speakAlert("You are halfway to your destination. Keep going, you are doing great.");
        if (navigator.vibrate) navigator.vibrate([100,50,100]);
      }
    }
  }, [currentPosition, routingWaypoints, isTracking, totalRouteDistance]);

  const dismissAlert = useCallback(() => setActiveAlert(null), []);

  // Overlay JSX
  const alertOverlay = (
    <>
      {activeAlert && (
        <div style={{ position:"absolute", bottom:"90px", left:"16px", right:"16px", zIndex:2000 }}>
          <AlertCard type={activeAlert} onDismiss={dismissAlert} />
        </div>
      )}
    </>
  );

  return { alertOverlay };
};

export default useDestinationAlerts;
