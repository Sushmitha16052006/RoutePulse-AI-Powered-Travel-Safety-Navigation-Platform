import React from 'react';
import { Shield } from 'lucide-react';

function Loader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
      {/* Spinner rings */}
      <div className="relative flex items-center justify-center mb-6" style={{ width: 80, height: 80 }}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#FF2D55',
            borderRightColor: 'rgba(255,45,85,0.3)',
            animation: 'spin 1s linear infinite',
          }} />
        {/* Middle ring */}
        <div className="absolute rounded-full border-2 border-transparent"
          style={{
            inset: 10,
            borderTopColor: '#8B5CF6',
            borderLeftColor: 'rgba(139,92,246,0.3)',
            animation: 'spinReverse 1.5s linear infinite',
          }} />
        {/* Center icon */}
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Text */}
      <p className="text-[#9CA3AF] text-sm font-medium tracking-wide animate-pulse">Processing...</p>
      <div className="mt-3 flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#FF2D55]"
            style={{ animation: `pulse 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

export default Loader;
