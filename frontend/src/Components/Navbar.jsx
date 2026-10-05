import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { Shield } from 'lucide-react';

function Navbar() {
  const [isOpen, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useContext(AuthContext);

  /* Enhance glass blur on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleStart = () => {
    if (auth) navigate('/HomePage');
    else navigate('/register');
  };

  const handleLogout = async () => {
    const res = await logout();
    if (res) navigate('/login');
  };

  const navLinks = [
    { name: 'Testimonials', url: '#testimony', show: !auth },
    { name: 'Contact Us', url: 'mailto:abdullahmukadam21@gmail.com', show: !auth },
    { name: 'Contact Us', url: 'mailto:abdullahmukadam21@gmail.com', show: !!auth },
    { name: 'Home', url: '/HomePage', show: !!auth },
  ];

  const visibleLinks = navLinks.filter(l => l.show);

  return (
    <nav className="relative w-full z-[200]">
      {/* Main bar */}
      <div
        className={`w-full px-6 py-3 flex items-center justify-between sticky top-0 z-[200] transition-all duration-300 ${
          scrolled
            ? 'glass-dark border-b border-white/[0.06] shadow-2xl'
            : 'bg-transparent'
        }`}
        style={{ backdropFilter: scrolled ? 'blur(24px)' : 'none' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => navigate(auth ? '/HomePage' : '/')}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(255,45,85,0.5)] transition-all duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {/* Glow dot */}
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0A0A0F] animate-pulse" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-[15px] text-white tracking-tight">TravelMate</span>
            <span className="text-[9px] text-[#9CA3AF] font-medium tracking-widest uppercase">Smart Travel Platform</span>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {visibleLinks.map((item, i) => (
            <a
              key={i}
              href={item.url}
              className="relative text-[#9CA3AF] text-sm font-medium hover:text-white transition-colors duration-200 group py-1"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#FF2D55] to-[#FF6B9D] group-hover:w-full transition-all duration-300 rounded-full" />
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {auth ? (
            <button className="btn-ghost text-sm" onClick={handleLogout}>
              Sign Out
            </button>
          ) : (
            <>
              <button
                className="text-sm text-[#9CA3AF] font-medium hover:text-white transition-colors px-4 py-2"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
              <button className="btn-primary text-sm" onClick={handleStart}>
                <Shield className="w-4 h-4" />
                Get Protected
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="relative md:hidden w-10 h-10 flex items-center justify-center focus:outline-none"
          onClick={() => setOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <div className="w-6 space-y-1.5">
            <span className={`block h-0.5 bg-white rounded-full transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-white rounded-full transition-all duration-200 ${isOpen ? 'opacity-0 w-0' : 'w-full opacity-100'}`} />
            <span className={`block h-0.5 bg-white rounded-full transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`absolute w-full md:hidden z-[199] transition-all duration-400 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="glass-dark border-b border-white/[0.06] mx-4 mt-1 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex flex-col p-5 gap-1">
            {visibleLinks.map((item, i) => (
              <a
                key={i}
                href={item.url}
                className="text-[#9CA3AF] text-sm font-medium hover:text-white hover:bg-white/[0.05] px-4 py-3 rounded-xl transition-all duration-200"
              >
                {item.name}
              </a>
            ))}
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
              {auth ? (
                <button className="btn-ghost w-full justify-center" onClick={handleLogout}>
                  Sign Out
                </button>
              ) : (
                <>
                  <button
                    className="text-sm text-[#9CA3AF] font-medium hover:text-white transition-colors px-4 py-3 rounded-xl hover:bg-white/[0.04] text-center"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </button>
                  <button className="btn-primary w-full justify-center" onClick={handleStart}>
                    <Shield className="w-4 h-4" />
                    Get Protected
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;