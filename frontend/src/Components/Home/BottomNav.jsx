import React from 'react'
import { Home, Map, MessageSquare, User, Train } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/HomePage',  icon: Home,          label: 'Home' },
  { to: '/map',       icon: Map,           label: 'Map' },
  { to: '/guidance',  icon: Train,         label: 'Guide' },
  { to: '/reviews',   icon: MessageSquare, label: 'Reviews' },
  { to: '/profile',   icon: User,          label: 'Profile' },
]

function BottomNav() {
  const location = useLocation()

  return (
    <div className="w-full sticky bottom-0 z-20 px-4 pb-4 pt-2">
      <div
        className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 group"
                style={{ minWidth: '64px' }}
              >
                {/* Active background pill */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,45,85,0.15) 0%, rgba(255,107,157,0.08) 100%)',
                      border: '1px solid rgba(255,45,85,0.2)',
                    }}
                  />
                )}

                {/* Icon */}
                <div className={`relative z-10 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                  <Icon
                    className={`w-5 h-5 transition-colors duration-300 ${
                      isActive ? 'text-[#FF2D55]' : 'text-[#6B7280] group-hover:text-[#9CA3AF]'
                    }`}
                  />
                  {/* Glow under active icon */}
                  {isActive && (
                    <div
                      className="absolute inset-0 blur-sm opacity-60"
                      style={{ background: '#FF2D55', filter: 'blur(6px)' }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`relative z-10 text-[10px] font-semibold tracking-wide transition-colors duration-300 ${
                    isActive ? 'text-[#FF6B9D]' : 'text-[#6B7280] group-hover:text-[#9CA3AF]'
                  }`}
                >
                  {label}
                </span>

                {/* Active dot */}
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#FF2D55] animate-pulse" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BottomNav