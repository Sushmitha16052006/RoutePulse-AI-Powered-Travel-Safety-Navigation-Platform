import React, { useContext, useState } from 'react';
import { ChevronLeft, User, Mail, Lock, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../API/CustomApi';
import { Config } from '../../API/Config';
import { AuthContext } from '../Context/AuthContext';

const SettingsSection = ({ icon: Icon, title, color = '#FF2D55', children }) => (
  <div className="glass-card rounded-2xl overflow-hidden mb-4">
    <div className="flex items-center gap-3 px-5 py-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <h2 className="text-white font-semibold text-base">{title}</h2>
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

function Settings() {
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user }                            = useContext(AuthContext);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { username: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  /* ── All original logic preserved ── */
  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      if (data.username) {
        const response = await api.post(Config.UPDATEUSERNAME, { userId: user._id, username: data.username });
        if (response.data.success) { setSuccessMessage('Username updated successfully'); reset({ username: '' }); }
      }
      if (data.email) {
        const response = await api.post(Config.UPDATEEMAIL, { userId: user._id, email: data.email, isGoogleUser: user.isGoogleUser });
        if (response.data.success) { setSuccessMessage('Email updated successfully'); reset({ email: '' }); }
      }
      if (data.currentPassword && data.newPassword) {
        if (data.newPassword !== data.confirmPassword) { setError('New passwords do not match'); return; }
        const response = await api.post(Config.UPDATEPASSWORD, {
          userId: user._id, currentPassword: data.currentPassword, newPassword: data.newPassword, isGoogleUser: user.isGoogleUser
        });
        if (response.data.success) {
          setSuccessMessage('Password updated successfully');
          reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pb-10 relative" style={{ background: '#0A0A0F' }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-10 px-4 py-4 flex-shrink-0"
        style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/profile"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/[0.08]"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ChevronLeft className="w-5 h-5 text-[#9CA3AF]" />
          </Link>
          <div>
            <h1 className="text-white font-black text-xl leading-none">Settings</h1>
            <p className="text-[#6B7280] text-xs mt-0.5">Manage your account</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-5 animate-fadeInDown"
            style={{ background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.2)' }}>
            <AlertCircle className="w-4 h-4 text-[#FF2D55] flex-shrink-0 mt-0.5" />
            <p className="text-[#FF6B9D] text-sm">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-5 animate-fadeInDown"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <CheckCircle className="w-4 h-4 text-[#4ade80] flex-shrink-0 mt-0.5" />
            <p className="text-[#4ade80] text-sm">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
          {/* Username */}
          <SettingsSection icon={User} title="Update Username" color="#FF2D55">
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">New Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input type="text"
                  {...register('username', { minLength: { value: 3, message: 'Username must be at least 3 characters' } })}
                  className="input-dark pl-11" placeholder="Enter new username" />
              </div>
              {errors.username && <p className="mt-1.5 text-xs text-[#FF6B9D]">{errors.username.message}</p>}
            </div>
          </SettingsSection>

          {/* Email */}
          <SettingsSection icon={Mail} title="Update Email" color="#8B5CF6">
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">New Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input type="email"
                  {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email' } })}
                  className="input-dark pl-11" placeholder="Enter new email" />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-[#FF6B9D]">{errors.email.message}</p>}
            </div>
          </SettingsSection>

          {/* Password */}
          <SettingsSection icon={Lock} title="Update Password" color="#06B6D4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input type="password" {...register('currentPassword')}
                    className="input-dark pl-11" placeholder="Enter current password" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input type="password"
                    {...register('newPassword', { minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                    className="input-dark pl-11" placeholder="Enter new password" />
                </div>
                {errors.newPassword && <p className="mt-1.5 text-xs text-[#FF6B9D]">{errors.newPassword.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input type="password" {...register('confirmPassword')}
                    className="input-dark pl-11" placeholder="Confirm new password" />
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Save button */}
          <button type="submit" disabled={loading}
            className="btn-primary w-full py-4 rounded-2xl text-base justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving changes...</>
              : <><Shield className="w-4 h-4" />Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;