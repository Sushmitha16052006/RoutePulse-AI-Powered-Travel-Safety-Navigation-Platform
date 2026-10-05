import React, { useState, useContext } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm } from "react-hook-form";
import axios from "axios";
import { Config } from '../../API/Config';
import { useGoogleLogin } from "@react-oauth/google";
import { AuthContext } from '../Context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../API/CustomApi';
import { Shield, Mail, Lock, User, AlertCircle, Zap, MapPin, Bell } from 'lucide-react';

function Signup() {
  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword]                   = useState('');
  const [isLoading, setIsLoading]                 = useState(false);
  const { register, handleSubmit, watch, formState: { errors: formErrors } } = useForm();
  const [errors, setErrors]                       = useState('');
  const { setAuth, setUser, checkAuth }           = useContext(AuthContext);
  const navigate                                  = useNavigate();

  /* ── All original logic preserved ── */
  const Submit = async (data) => {
    setErrors('');
    try {
      if (data.password !== password) { setErrors("Passwords don't match"); return; }
      if (!data.agreeToTerms)         { setErrors('Please agree to the Terms and Privacy Policy'); return; }
      setIsLoading(true);
      // Use `api` (not bare axios) so withCredentials:true is set and the JWT cookie is received
      const response = await api.post(Config.SignUPUrl, {
        username: data.userName, email: data.email, password: data.password
      });
      if (response.data) { await checkAuth(); navigate('/HomePage'); }
    } catch (error) {
      setErrors(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setIsLoading(true);
      const { data: googleUser } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      const response = await api.post(Config.GoogleSignUpUrl, {
        email: googleUser.email, googleId: googleUser.sub, name: googleUser.name, picture: googleUser.picture
      });
      if (response.data) { await checkAuth(); navigate('/HomePage'); }
    } catch (error) {
      setErrors('Google signup failed: ' + (error.response?.data?.message || 'Please try again'));
    } finally { setIsLoading(false); }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setErrors('Google signup failed. Please try again.'),
  });

  return (
    <div className="min-h-screen flex">
      {/* LEFT BRAND PANEL */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #0A0A14 50%, #0A0A0F 100%)' }}>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,45,85,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        {[
          { icon: Shield, top:'12%', left:'8%',    delay:'0s',   size:28 },
          { icon: Bell,   top:'28%', right:'10%',  delay:'1.2s', size:22 },
          { icon: MapPin, bottom:'30%',left:'10%', delay:'0.6s', size:20 },
          { icon: Zap,    top:'65%', right:'12%',  delay:'1.8s', size:18 },
        ].map(({ icon: Icon, top, left, right, bottom, delay, size }, i) => (
          <div key={i} className="absolute animate-floatSlow pointer-events-none"
            style={{ top, left, right, bottom, animationDelay: delay }}>
            <Icon style={{ width: size, height: size, color: '#8B5CF6', opacity: 0.12 }} />
          </div>
        ))}

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">TravelMate</p>
            <p className="text-[#6B7280] text-xs tracking-widest uppercase">Smart Travel Platform</p>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Travel smarter.<br /><span className="gradient-primary-text">Arrive safer.</span>
          </h2>
          <p className="text-[#9CA3AF] text-base leading-relaxed max-w-sm mb-8">
            Designed to guide passengers through every journey with smart alerts, seamless navigation, and reliable assistance.
          </p>
          <div className="flex flex-col gap-3">
            {[
              '✔ Smart alerts before your stop',
              '✔ Real-time route guidance',
              '✔ Instant SOS alerts in under 3 seconds',
              '✔ Live GPS location sharing with trusted contacts',
              '✔ End-to-end encrypted sessions',
            ].map((item, i) => (
              <p key={i} className="text-[#9CA3AF] text-sm">{item}</p>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-[#4B5563] text-xs">© 2024 TravelMate · Your trusted journey companion</p>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 relative overflow-y-auto"
        style={{ background: '#0A0A0F' }}>
        <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,45,85,0.05) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        <div className="w-full max-w-md relative z-10 animate-fadeInUp py-8">
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">TravelMate</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
            <p className="text-[#9CA3AF]">Join TravelMate — your smart journey companion</p>
          </div>

          {errors && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 animate-fadeInDown"
              style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.25)' }}>
              <AlertCircle className="w-4 h-4 text-[#FF2D55] flex-shrink-0" />
              <p className="text-[#FF6B9D] text-sm">{errors}</p>
            </div>
          )}

          <button type="button" disabled={isLoading} onClick={() => handleGoogleSignup()}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl mb-6 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
            <img src="/google.jfif" alt="Google" className="w-5 h-5 rounded-full" />
            <span className="text-[#D1D5DB] text-sm font-medium">
              {isLoading ? 'Loading...' : 'Continue with Google'}
            </span>
          </button>

          <div className="divider mb-5">or create with email</div>

          <form onSubmit={handleSubmit(Submit)} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input id="userName" type="text"
                  {...register('userName', { required: 'Username is Required', maxLength: 20 })}
                  className="input-dark pl-11" placeholder="Choose a username" />
              </div>
              {formErrors.userName && <p className="mt-1 text-xs text-[#FF6B9D]">{formErrors.userName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input id="email" type="email"
                  {...register('email', { required: true, pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i } })}
                  className="input-dark pl-11" placeholder="you@example.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input id="password" type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: true, maxLength: 20 })}
                  className="input-dark pl-11 pr-12" placeholder="••••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-11 pr-12" placeholder="••••••••••" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors">
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input id="agreeToTerms" type="checkbox"
                {...register('agreeToTerms', { required: 'You must agree to the Terms and Privacy Policy' })}
                className="mt-0.5 w-4 h-4 rounded flex-shrink-0" style={{ accentColor: '#FF2D55' }} />
              <label htmlFor="agreeToTerms" className="text-sm text-[#9CA3AF] leading-relaxed">
                I agree to the{' '}
                <a href="/terms" className="text-[#FF6B9D] hover:text-[#FF2D55] transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-[#FF6B9D] hover:text-[#FF2D55] transition-colors">Privacy Policy</a>
              </label>
            </div>
            {formErrors.agreeToTerms && <p className="text-xs text-[#FF6B9D]">{formErrors.agreeToTerms.message}</p>}

            <button type="submit" disabled={isLoading}
              className="btn-primary w-full py-3.5 rounded-2xl text-base justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
              {isLoading
                ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</div>
                : <><Shield className="w-4 h-4" />Create my account</>}
            </button>

            <p className="text-center text-sm text-[#9CA3AF]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#FF6B9D] font-semibold hover:text-[#FF2D55] transition-colors">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;