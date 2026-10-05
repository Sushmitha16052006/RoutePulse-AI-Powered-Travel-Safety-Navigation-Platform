import React from 'react'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Alice Dorman',
    role: 'College Student',
    avatar: 'AD',
    gradient: 'from-[#FF2D55] to-[#FF6B9D]',
    stars: 5,
    content: 'This app has completely changed how I feel about going out alone. The instant SOS and live tracking gave my family peace of mind too. Absolutely essential!',
  },
  {
    name: 'Priya Sharma',
    role: 'Working Professional',
    avatar: 'PS',
    gradient: 'from-[#8B5CF6] to-[#6366F1]',
    stars: 5,
    content: 'The moment I pressed SOS, my contacts knew exactly where I was within seconds. The platform is beautifully designed and incredibly reliable.',
  },
  {
    name: 'Emma Wilson',
    role: 'Late-Night Commuter',
    avatar: 'EW',
    gradient: 'from-[#06B6D4] to-[#3B82F6]',
    stars: 5,
    content: "I've seen a massive increase in my confidence since using TravelMate. The smart alerts help me stay on track and never miss my stop. Absolutely game-changing.",
  },
  {
    name: 'Sarah Chen',
    role: 'Solo Traveler',
    avatar: 'SC',
    gradient: 'from-[#F59E0B] to-[#EF4444]',
    stars: 5,
    content: 'Exceptional quality and reliability. The attention to detail and user-first approach makes this stand out from everything else available.',
  },
]

function Testimony() {
  return (
    <section className="w-full max-w-6xl mx-auto py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
          style={{
            background: 'rgba(255,45,85,0.1)',
            border: '1px solid rgba(255,45,85,0.2)',
            color: '#FF6B9D',
          }}
        >
          <Star className="w-3 h-3 fill-[#FF6B9D]" />
          Loved by users
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
          What our community says
        </h2>
        <p className="text-[#9CA3AF] text-base max-w-lg mx-auto">
          Real stories from real women who feel safer every day.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="glass-card rounded-2xl p-6 relative overflow-hidden group"
            style={{
              animationDelay: `${i * 80}ms`,
            }}
          >
            {/* Quote icon */}
            <div
              className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
            >
              <Quote className="w-10 h-10 text-[#FF2D55]" />
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(t.stars)].map((_, si) => (
                <Star key={si} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>

            {/* Content */}
            <p className="text-[#D1D5DB] text-sm leading-relaxed mb-6">
              "{t.content}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-xs font-bold">{t.avatar}</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{t.name}</p>
                <p className="text-[#6B7280] text-xs">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testimony