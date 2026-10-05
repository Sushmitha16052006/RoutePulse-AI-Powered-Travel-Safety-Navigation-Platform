import { AlertCircle } from 'lucide-react'
import { useState } from 'react'

const SOSButton = () => {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {/* Pulse rings */}
      <span className="absolute inset-0 rounded-full border-2 border-[#FF2D55] sos-ring-1" style={{ opacity: 0 }} />
      <span className="absolute inset-0 rounded-full border-2 border-[#FF2D55] sos-ring-2" style={{ opacity: 0 }} />
      <span className="absolute inset-0 rounded-full border border-[#FF6B9D] sos-ring-3"  style={{ opacity: 0 }} />

      {/* Outer decorative ring */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '16px',
          border: '1px dashed rgba(255,45,85,0.25)',
          animation: 'spin 20s linear infinite',
        }}
      />

      {/* Main button */}
      <button
        className={`relative z-10 flex flex-col items-center justify-center rounded-full text-white font-black transition-all duration-200 select-none
          ${isPressed ? 'animate-sosShake scale-95' : 'active:scale-95'}`}
        style={{
          width: 160,
          height: 160,
          background: 'linear-gradient(135deg, #FF2D55 0%, #E01040 100%)',
          boxShadow: isPressed
            ? '0 0 60px rgba(255,45,85,0.8), 0 0 120px rgba(255,45,85,0.4), inset 0 2px 0 rgba(255,255,255,0.2)'
            : '0 0 30px rgba(255,45,85,0.5), 0 0 60px rgba(255,45,85,0.2), inset 0 2px 0 rgba(255,255,255,0.15)',
          animation: 'glowPulse 2.5s ease-in-out infinite',
        }}
        onClick={() => { setIsPressed(true); setTimeout(() => setIsPressed(false), 600); }}
        aria-label="Send SOS Emergency Alert"
      >
        {/* Inner glass highlight */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: 8, left: 8, right: 8, bottom: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
            borderRadius: '50% 50% 0 0',
          }}
        />

        <AlertCircle className="w-10 h-10 mb-1.5 drop-shadow-lg" strokeWidth={2.5} />
        <span className="text-3xl font-black tracking-widest leading-none drop-shadow-lg">SOS</span>
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase mt-1 opacity-80">EMERGENCY</span>
      </button>

      {/* Status indicator */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full"
        style={{ background: 'rgba(255,45,85,0.12)', border: '1px solid rgba(255,45,85,0.2)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
        <span className="text-[#FF6B9D] text-[9px] font-semibold tracking-wider uppercase">Ready</span>
      </div>
    </div>
  )
}

export default SOSButton