import React, { useEffect, useRef } from 'react'
import Testimony from './Testimony'
import Footer from '../Footer'
import { Shield, MapPin, Bell, Users, ArrowRight, Zap, Lock, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/* Scroll reveal hook */
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-fadeInUp')
          el.style.opacity = '1'
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

const stats = [
  { value: '10K+', label: 'Women Protected', icon: Shield },
  { value: '< 3s', label: 'Alert Delivery',  icon: Zap },
  { value: '99.9%', label: 'Uptime',          icon: Lock },
  { value: '50+',  label: 'Cities Active',    icon: MapPin },
]

const features = [
  {
    icon: Bell,
    title: 'Instant SOS Alerts',
    desc: 'One-touch emergency broadcast to all trusted contacts with live GPS coordinates.',
    color: '#FF2D55',
    glow: 'rgba(255,45,85,0.2)',
  },
  {
    icon: MapPin,
    title: 'Live Location Tracking',
    desc: 'Real-time GPS monitoring with interactive Leaflet maps and location history.',
    color: '#FF6B9D',
    glow: 'rgba(255,107,157,0.2)',
  },
  {
    icon: Users,
    title: 'Safety Community',
    desc: 'Crowd-sourced safety reviews for locations, helping you avoid unsafe zones.',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.2)',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    desc: 'JWT-secured sessions, encrypted data, and Google OAuth for seamless access.',
    color: '#06B6D4',
    glow: 'rgba(6,182,212,0.2)',
  },
]

function HeroSection() {
  const navigate = useNavigate()
  const statsRef   = useReveal()
  const featRef    = useReveal()
  const missionRef = useReveal()
  const testRef    = useReveal()

  return (
    <div className="w-full relative overflow-hidden">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-72px)] flex flex-col items-center justify-center text-center px-6 pt-16 pb-24">

        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-white/[0.04] absolute" />
          <div className="w-[900px] h-[900px] rounded-full border border-white/[0.025] absolute" />
          <div className="w-[1200px] h-[1200px] rounded-full border border-white/[0.015] absolute" />
        </div>

        {/* Badge */}
        <div className="badge-primary mb-6 animate-fadeInDown">
          <Zap className="w-3 h-3" />
          AI-Driven Travel Safety & Guidance Platform
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6 animate-fadeInUp">
          <span className="text-white">Your Personal</span>
          <br />
          <span className="gradient-primary-text">Companion</span>
          <br />
          <span className="text-white">Never Stops</span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-2xl text-[#9CA3AF] text-lg md:text-xl leading-relaxed mb-10 animate-fadeInUp delay-200">
          Empowering passengers with intelligent travel assistance, real-time destination alerts, smart navigation, and seamless journey guidance — making every trip safer, smarter, and stress-free.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-fadeInUp delay-300">
          <button
            className="btn-primary text-base px-8 py-4 shadow-[0_8px_30px_rgba(255,45,85,0.4)]"
            onClick={() => navigate('/register')}
          >
            <Shield className="w-5 h-5" />
            Start for Free
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            className="btn-ghost text-base px-8 py-4"
            onClick={() => navigate('/login')}
          >
            Sign In →
          </button>
        </div>

        {/* Social proof avatars */}
        <div className="flex items-center gap-4 animate-fadeInUp delay-400">
          <div className="flex -space-x-3">
            {['/img1.png', '/img2.png', '/img3.png'].map((src, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0F] overflow-hidden ring-1 ring-white/10">
                <img src={src} alt={`User ${i+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0F] bg-gradient-to-br from-[#FF2D55] to-[#8B5CF6] flex items-center justify-center ring-1 ring-white/10">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-[#9CA3AF] text-xs">Trusted by <span className="text-white font-semibold">10,000+</span> women</p>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section
        ref={statsRef}
        className="px-6 py-16 max-w-5xl mx-auto"
        style={{ opacity: 0 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label, icon: Icon }, i) => (
            <div
              key={i}
              className="stat-card text-center"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 mx-auto"
                style={{ background: 'rgba(255,45,85,0.12)', border: '1px solid rgba(255,45,85,0.2)' }}
              >
                <Icon className="w-5 h-5 text-[#FF2D55]" />
              </div>
              <div className="text-2xl md:text-3xl font-black gradient-primary-text mb-1">{value}</div>
              <div className="text-[#9CA3AF] text-xs font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE CARDS ─────────────────────────────────── */}
      <section
        ref={featRef}
        className="px-6 py-16 max-w-6xl mx-auto"
        style={{ opacity: 0 }}
      >
        <div className="text-center mb-12">
          <div className="badge-primary mb-4 mx-auto inline-flex">
            <Lock className="w-3 h-3" />
            Platform Features
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Everything you need to
            <br />
            <span className="gradient-primary-text">stay safe</span>
          </h2>
          <p className="text-[#9CA3AF] text-base max-w-xl mx-auto">
            Built with cutting-edge technology to give you complete peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, desc, color, glow }, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 group cursor-default"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ background: glow, border: `1px solid ${color}30` }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-[#9CA3AF] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION STATEMENT ─────────────────────────────── */}
      <section
        ref={missionRef}
        className="px-6 py-24 max-w-4xl mx-auto text-center"
        style={{ opacity: 0 }}
      >
        <div
          className="rounded-3xl p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,45,85,0.08) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #FF2D55 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
          />

          <p className="text-[#9CA3AF] text-sm font-semibold tracking-widest uppercase mb-4">Our Commitment</p>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
            Not just a product —<br />
            <span className="gradient-primary-text">a movement toward</span>
            <br />meaningful safety.
          </h2>
          <p className="text-[#9CA3AF] text-base max-w-xl mx-auto leading-relaxed">
            We combine real-time alerts, location intelligence, and crowd-sourced safety data 
            to create a proactive safety net for those who need it most.
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section
        ref={testRef}
        id="testimony"
        className="px-6 pb-16"
        style={{ opacity: 0 }}
      >
        <Testimony />
      </section>

      <Footer />
    </div>
  )
}

export default HeroSection