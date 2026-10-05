import { 
  Camera, X, LogOut, Settings, Star, Shield, MessageSquare, Users, 
  ChevronRight, ChevronDown, User, Lock, Bell, MapPin, ShieldAlert, MonitorSmartphone,
  Smartphone, Laptop, CheckCircle, AlertCircle, Eye, ShieldCheck, Navigation, Activity, Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import BottomNav from './Home/BottomNav';
import { useContext, useState } from 'react';
import { AuthContext } from '../Context/AuthContext';
import ReviewCard from './ReviewCard';
import api from '../../API/CustomApi';
import { Config } from '../../API/Config';

// Reusable animated toggle switch
const Toggle = ({ active, onClick, color }) => (
  <div onClick={onClick} className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300" style={{ background: active ? color : 'rgba(255,255,255,0.1)' }}>
    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${active ? 'translate-x-6 shadow-md' : 'translate-x-0'}`} />
  </div>
);

const ToggleRow = ({ icon: Icon, label, desc, active, onClick, color }) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `rgba(255,255,255,0.05)` }}>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div>
        <h4 className="text-white font-semibold text-sm">{label}</h4>
        <p className="text-gray-500 text-xs">{desc}</p>
      </div>
    </div>
    <Toggle active={active} onClick={onClick} color={color} />
  </div>
);

function Profile() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useContext(AuthContext);
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'reviews'
  const [expandedSection, setExpandedSection] = useState(null);
  
  const { register, handleSubmit, reset, watch } = useForm();
  const photoFile = watch('photo');

  // Interactive toggle states
  const [toggles, setToggles] = useState({
    location: true, profileVis: true, shareContacts: true, 
    dataProtection: true, smartAlerts: true, sosNotif: true, travelReminders: false,
  });
  const handleToggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  // Form states for inputs
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    newPassword: ''
  });
  const [updateStatus, setUpdateStatus] = useState({ loading: false, error: '', success: '' });

  /* ── Original API Logic Preserved ── */
  const handleLogout = async () => { const res = await logout(); if (res) navigate('/login'); };

  const handleUpdateAccount = async (type) => {
    setUpdateStatus({ loading: true, error: '', success: '' });
    try {
      if (type === 'username') {
        const response = await api.post(Config.UPDATEUSERNAME, { userId: user._id, username: formData.username });
        if (response.data.success) {
          setUpdateStatus({ loading: false, error: '', success: 'Profile updated successfully!' });
          setUser(prev => ({ ...prev, username: formData.username }));
        }
      } else if (type === 'security') {
        if (formData.email !== user.email) {
          await api.post(Config.UPDATEEMAIL, { userId: user._id, email: formData.email, isGoogleUser: user.isGoogleUser });
        }
        if (formData.newPassword) {
          await api.post(Config.UPDATEPASSWORD, { userId: user._id, currentPassword: 'any', newPassword: formData.newPassword, isGoogleUser: user.isGoogleUser });
        }
        setUpdateStatus({ loading: false, error: '', success: 'Security settings updated!' });
        setFormData(prev => ({ ...prev, newPassword: '' }));
      }
    } catch (err) {
      setUpdateStatus({ loading: false, error: err.response?.data?.message || 'Update failed', success: '' });
    }
    setTimeout(() => setUpdateStatus({ loading: false, error: '', success: '' }), 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); reset({ photo: null }); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File size should be less than 5MB'); reset({ photo: null }); return; }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmitPhoto = async (data) => {
    if (!data.photo?.[0]) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('userId', user._id);
      fd.append('photo', data.photo[0]);
      const response = await api.post(Config.ADDPROFILEPHOTO, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.status === 200) setUser(prev => ({ ...prev, profilePhoto: response.data.updatedUser.profilePhoto }));
    } catch (error) { console.error('Failed to upload', error); }
    finally { setIsUploading(false); setShowPhotoModal(false); }
  };

  const handleCloseModal = () => { setShowPhotoModal(false); setPreviewUrl(null); reset(); };

  const stats = [
    { icon: MessageSquare, label: 'Reviews',  value: user.reviews?.length || 0,  color: '#FF2D55' },
    { icon: Users,         label: 'Contacts', value: user.contacts?.length || 0, color: '#8B5CF6' },
  ];

  const settingsOptions = [
    { id: 'details', icon: User, label: 'Profile Details', desc: 'Personal information', color: '#3B82F6' },
    { id: 'security', icon: Lock, label: 'Email & Password', desc: 'Security settings', color: '#10B981' },
    { id: 'privacy', icon: ShieldAlert, label: 'Privacy', desc: 'Data control', color: '#8B5CF6' },
    { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert preferences', color: '#F59E0B' },
    { id: 'location', icon: MapPin, label: 'Location Access', desc: 'Tracking permissions', color: '#EF4444' },
    { id: 'devices', icon: MonitorSmartphone, label: 'Manage Accounts', desc: 'Connected devices', color: '#EC4899' },
  ];

  const STYLES = `
    .setting-item { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .setting-item:hover { background: rgba(255, 255, 255, 0.05); }
    .setting-icon-box { transition: all 0.3s ease; }
    .setting-item:hover .setting-icon-box { transform: scale(1.08); }
    .expand-content { animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; transform-origin: top; }
    @keyframes slideDown { from { opacity: 0; transform: scaleY(0.95); } to { opacity: 1; transform: scaleY(1); } }
  `;

  return (
    <div className="min-h-screen pb-28 relative" style={{ background: '#0A0A0F' }}>
      <style>{STYLES}</style>
      
      {/* ── Profile Header ── */}
      <div className="relative px-4 pt-10 pb-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,45,85,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-5 group">
            <div className="w-28 h-28 rounded-[2rem] overflow-hidden ring-4 ring-[#1A1A24] shadow-2xl transition-transform duration-300 group-hover:scale-105"
                 style={{ boxShadow: '0 0 40px rgba(255,45,85,0.2)' }}>
              <img src={user.profilePhoto || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvFbJHIvlkPWSvsJ1rWRbr64ZPiCCdb1SCLg&s'} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button onClick={() => setShowPhotoModal(true)}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-12"
              style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B9D)', boxShadow: '0 8px 20px rgba(255,45,85,0.4)' }}>
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          <h1 className="text-white font-black text-3xl mb-1 tracking-tight">{user.username}</h1>
          <p className="text-[#9CA3AF] text-sm mb-5 font-medium">{user.email}</p>

          <div className="badge-success mb-6 px-4 py-1.5 shadow-lg shadow-[#10B981]/10">
            <Shield className="w-3.5 h-3.5" /> Protected Account
          </div>

          <div className="flex items-center gap-4 w-full max-w-sm">
            {stats.map(({ icon: Icon, label, value, color }, i) => (
              <div key={i} className="flex-1 glass-card rounded-[1.5rem] p-4 text-center transition-all duration-300 hover:bg-white/5 border border-white/5">
                <div className="text-3xl font-black text-white mb-1">{value}</div>
                <div className="flex items-center justify-center gap-1.5 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">
                  <Icon className="w-3.5 h-3.5" style={{ color }} /> {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="px-4 mb-6 relative z-10">
        <div className="flex bg-[#1A1A24] p-1.5 rounded-2xl border border-white/5">
          <button onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'settings' ? 'bg-[#FF2D55] text-white shadow-lg shadow-[#FF2D55]/20' : 'text-[#9CA3AF] hover:text-white'}`}>
            <Settings className="w-4 h-4" /> Preferences
          </button>
          <button onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'reviews' ? 'bg-[#FF2D55] text-white shadow-lg shadow-[#FF2D55]/20' : 'text-[#9CA3AF] hover:text-white'}`}>
            <Star className="w-4 h-4" /> My Reviews
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="px-4 relative z-10">
        {updateStatus.error && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm animate-fadeIn">
            <AlertCircle className="w-4 h-4" /> {updateStatus.error}
          </div>
        )}
        {updateStatus.success && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-sm animate-fadeIn">
            <CheckCircle className="w-4 h-4" /> {updateStatus.success}
          </div>
        )}

        {activeTab === 'settings' ? (
          <div className="space-y-3 animate-fadeInUp">
            
            {settingsOptions.map((item) => (
              <div key={item.id} className="glass-card rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-300"
                style={{ background: expandedSection === item.id ? 'rgba(255,255,255,0.03)' : 'rgba(26,26,36,0.5)', borderColor: expandedSection === item.id ? `${item.color}40` : 'rgba(255,255,255,0.05)' }}>
                
                {/* Accordion Header */}
                <div onClick={() => setExpandedSection(expandedSection === item.id ? null : item.id)}
                  className="setting-item flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="setting-icon-box w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                         style={{ background: `rgba(${parseInt(item.color.slice(1,3),16)}, ${parseInt(item.color.slice(3,5),16)}, ${parseInt(item.color.slice(5,7),16)}, 0.15)` }}>
                      <item.icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">{item.label}</h3>
                      <p className="text-[#9CA3AF] text-xs font-medium mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-[#6B7280]">
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedSection === item.id ? 'rotate-180 text-white' : ''}`} />
                  </div>
                </div>

                {/* Expanded Content UIs */}
                {expandedSection === item.id && (
                  <div className="px-4 pb-5 pt-2 expand-content">
                    <div className="h-px w-full bg-white/5 mb-4" />

                    {/* 1. Location Access */}
                    {item.id === 'location' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-[#EF4444]/20" style={{ background: toggles.location ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)' }}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toggles.location ? 'bg-[#EF4444]/20' : 'bg-white/5'}`}>
                              <Navigation className={`w-5 h-5 ${toggles.location ? 'text-[#EF4444] animate-pulse' : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-sm">Live Location Sharing</h4>
                              <p className={`text-xs mt-0.5 font-medium ${toggles.location ? 'text-[#EF4444]' : 'text-gray-500'}`}>
                                {toggles.location ? 'Active - Tracking enabled' : 'Inactive - Tracking paused'}
                              </p>
                            </div>
                          </div>
                          <Toggle active={toggles.location} onClick={() => handleToggle('location')} color="#EF4444" />
                        </div>
                        <p className="text-[#9CA3AF] text-xs px-2 leading-relaxed">
                          When active, your real-time location is shared securely with your emergency contacts during active navigation or SOS mode.
                        </p>
                      </div>
                    )}

                    {/* 2. Privacy */}
                    {item.id === 'privacy' && (
                      <div className="space-y-2 p-2">
                        <ToggleRow icon={Eye} label="Profile Visibility" desc="Allow others to see your profile info" active={toggles.profileVis} onClick={() => handleToggle('profileVis')} color="#8B5CF6" />
                        <div className="h-px w-full bg-white/5 my-2" />
                        <ToggleRow icon={Users} label="Share Contacts" desc="Visible to your trusted network only" active={toggles.shareContacts} onClick={() => handleToggle('shareContacts')} color="#8B5CF6" />
                        <div className="h-px w-full bg-white/5 my-2" />
                        <ToggleRow icon={ShieldCheck} label="Data Protection" desc="End-to-end encryption for trip data" active={toggles.dataProtection} onClick={() => handleToggle('dataProtection')} color="#8B5CF6" />
                      </div>
                    )}

                    {/* 3. Notifications */}
                    {item.id === 'notifications' && (
                      <div className="space-y-2 p-2">
                        <ToggleRow icon={Activity} label="Smart Alerts" desc="Vibration and voice popups near stops" active={toggles.smartAlerts} onClick={() => handleToggle('smartAlerts')} color="#F59E0B" />
                        <div className="h-px w-full bg-white/5 my-2" />
                        <ToggleRow icon={AlertCircle} label="SOS Overrides" desc="Bypass device 'Do Not Disturb' mode" active={toggles.sosNotif} onClick={() => handleToggle('sosNotif')} color="#F59E0B" />
                        <div className="h-px w-full bg-white/5 my-2" />
                        <ToggleRow icon={MapPin} label="Travel Reminders" desc="Push notifications for saved routes" active={toggles.travelReminders} onClick={() => handleToggle('travelReminders')} color="#F59E0B" />
                      </div>
                    )}

                    {/* 4. Manage Accounts */}
                    {item.id === 'devices' && (
                      <div className="space-y-3">
                        <div className="rounded-2xl p-4 border border-[#EC4899]/30 flex items-center justify-between" style={{ background: 'rgba(236,72,153,0.05)' }}>
                          <div className="flex items-center gap-4">
                            <Smartphone className="w-5 h-5 text-[#EC4899]" />
                            <div>
                              <h4 className="text-white font-bold text-sm">iPhone 13 Pro</h4>
                              <p className="text-[#EC4899] text-xs mt-0.5 font-medium">Active Session • Mumbai</p>
                            </div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse shadow-[0_0_8px_#EC4899]" />
                        </div>
                        <div className="rounded-2xl p-4 border border-white/5 flex items-center justify-between bg-white/5 opacity-70">
                          <div className="flex items-center gap-4">
                            <Laptop className="w-5 h-5 text-gray-400" />
                            <div>
                              <h4 className="text-white font-bold text-sm">MacBook Air</h4>
                              <p className="text-gray-400 text-xs mt-0.5 font-medium">Last seen 2h ago • Pune</p>
                            </div>
                          </div>
                        </div>
                        <button className="w-full py-3.5 mt-2 rounded-xl text-xs font-bold text-[#EC4899] bg-[#EC4899]/10 hover:bg-[#EC4899]/20 transition-colors">
                          Sign Out of All Other Devices
                        </button>
                      </div>
                    )}

                    {/* 5. Email & Password */}
                    {item.id === 'security' && (
                      <div className="space-y-4 px-1">
                        <div>
                          <label className="text-xs text-gray-400 mb-1.5 block font-medium">Account Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#1A1A24] text-white rounded-xl py-3 pl-11 pr-4 text-sm border border-white/5 focus:border-[#10B981] outline-none transition-colors" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1.5 block font-medium">Update Password</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="password" placeholder="Enter new password..." value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} className="w-full bg-[#1A1A24] text-white rounded-xl py-3 pl-11 pr-4 text-sm border border-white/5 focus:border-[#10B981] outline-none transition-colors" />
                          </div>
                        </div>
                        <button onClick={() => handleUpdateAccount('security')} disabled={updateStatus.loading} className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-bold text-sm shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/40 transition-shadow flex justify-center items-center">
                          {updateStatus.loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Security Settings'}
                        </button>
                      </div>
                    )}

                    {/* 6. Profile Details */}
                    {item.id === 'details' && (
                      <div className="space-y-4 px-1">
                        <div>
                          <label className="text-xs text-gray-400 mb-1.5 block font-medium">Display Username</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-[#1A1A24] text-white rounded-xl py-3 pl-11 pr-4 text-sm border border-white/5 focus:border-[#3B82F6] outline-none transition-colors" />
                          </div>
                        </div>
                        <button onClick={() => handleUpdateAccount('username')} disabled={updateStatus.loading || formData.username === user.username} className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-bold text-sm shadow-lg shadow-[#3B82F6]/20 hover:shadow-[#3B82F6]/40 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                          {updateStatus.loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Profile Details'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* Logout Button */}
            <div className="pt-4 pb-4">
              <button onClick={handleLogout} 
                className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 group shadow-lg"
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444' }}>
                <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Secure Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fadeInUp">
            {user.reviews?.length > 0 ? (
              <div className="space-y-4">
                {user.reviews.map((review, i) => (
                  <ReviewCard key={i} {...review} username={user.username} />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-[2rem] p-10 text-center border border-white/5 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-[#6B7280]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">No reviews yet</h3>
                <p className="text-[#9CA3AF] text-sm max-w-[200px] mb-6">Your safety insights help other women navigate the city securely.</p>
                <Link to="/reviews" className="btn-primary py-3 px-6 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Write a Review
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Photo Upload Modal ── */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
          onClick={handleCloseModal}>
          <div className="w-full max-w-md rounded-[2.5rem] p-8 animate-scaleIn relative overflow-hidden"
            style={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF2D55] opacity-10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#8B5CF6] opacity-10 blur-3xl rounded-full" />
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div>
                <h2 className="text-white font-black text-2xl tracking-tight">Update Photo</h2>
                <p className="text-[#9CA3AF] text-sm mt-1">Choose a new profile picture</p>
              </div>
              <button onClick={handleCloseModal} className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <X className="w-5 h-5 text-[#9CA3AF]" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmitPhoto)} className="space-y-8 relative z-10">
              <div className="flex flex-col items-center">
                {previewUrl ? (
                  <div className="relative group">
                    <img src={previewUrl} alt="Preview" className="w-40 h-40 rounded-[2.5rem] object-cover ring-4 ring-[#FF2D55]/40 shadow-2xl transition-transform group-hover:scale-105" />
                    <button type="button" onClick={() => { reset({ photo: null }); setPreviewUrl(null); }} className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform" style={{ background: '#FF2D55' }}>
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => document.getElementById('photo-upload').click()} className="w-40 h-40 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/5" style={{ background: 'rgba(255,45,85,0.05)', border: '2px dashed rgba(255,45,85,0.3)' }}>
                    <Camera className="w-10 h-10 text-[#FF2D55] mb-3" />
                    <p className="text-[#FF2D55] font-semibold text-sm">Upload Photo</p>
                    <p className="text-[#9CA3AF] text-xs mt-1">Tap to browse</p>
                  </div>
                )}
                <input id="photo-upload" type="file" className="hidden" accept="image/*" {...register('photo', { onChange: handleFileChange })} />
                <p className="text-[#6B7280] text-xs mt-4 font-medium">PNG, JPG, WEBP up to 5MB</p>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 justify-center rounded-2xl font-bold text-[#9CA3AF] hover:text-white transition-colors bg-white/5 hover:bg-white/10">Cancel</button>
                <button type="submit" disabled={!photoFile?.[0] || isUploading} className="btn-primary flex-1 py-4 justify-center rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                  {isUploading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Uploading...</> : <><Camera className="w-5 h-5 mr-2" />Save Photo</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default Profile;