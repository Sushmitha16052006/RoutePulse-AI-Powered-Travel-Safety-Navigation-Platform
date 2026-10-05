import React, { useState } from 'react'
import { FaInstagram, FaFacebook, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { Shield, Mail, ArrowRight } from 'lucide-react'

const socialLinks = [
  { icon: FaInstagram, label: 'Instagram', color: '#E1306C' },
  { icon: FaFacebook,  label: 'Facebook',  color: '#1877F2' },
  { icon: FaLinkedin,  label: 'LinkedIn',  color: '#0A66C2' },
  { icon: FaTwitter,   label: 'Twitter',   color: '#1DA1F2' },
]

function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer
      className="w-full relative mt-4 overflow-hidden"
      style={{
        background: 'rgba(5,5,10,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Gradient top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #FF2D55, #8B5CF6, transparent)' }}
      />

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B9D)' }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">TravelMate</p>
                <p className="text-[#6B7280] text-xs tracking-widest uppercase">Smart Travel Platform</p>
              </div>
            </div>
            <p className="text-[#6B7280] text-sm leading-relaxed max-w-xs">
              Designed to guide passengers through every journey with smart alerts, seamless navigation, and reliable assistance.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-widest mb-5">Platform</h3>
            <div className="flex flex-col gap-3">
              {['Testimonials', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[#6B7280] text-sm hover:text-white transition-colors duration-200 w-fit"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-widest mb-5">Stay Updated</h3>
            <p className="text-[#6B7280] text-sm mb-4">
              Get safety tips and platform updates.
            </p>
            {subscribed ? (
              <div
                className="rounded-xl px-4 py-3 text-sm text-[#4ade80] font-medium animate-fadeIn"
                style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                ✓ You're subscribed!
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-dark pl-10 py-2.5 text-sm rounded-xl"
                    onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                  />
                </div>
                <button
                  onClick={handleSubscribe}
                  className="btn-primary py-2.5 px-4 rounded-xl flex-shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Social */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {socialLinks.map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              aria-label={label}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.borderColor = `${color}40`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </button>
          ))}
        </div>

        {/* Bottom */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-6">
            {['Terms of Service', 'Privacy Policy', 'Disclaimer'].map((item) => (
              <a key={item} href="#" className="text-[#6B7280] text-xs hover:text-[#9CA3AF] transition-colors">
                {item}
              </a>
            ))}
          </div>
          <p className="text-[#4B5563] text-xs">
            © 2024 TravelMate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer