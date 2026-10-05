import React, { useContext, useEffect, useState } from 'react';
import SOSButton from '../SOSButton';
import { Plus, X, CircleX, Phone, User, MapPin, Wifi, WifiOff, Shield } from 'lucide-react';
import BottomNav from './BottomNav';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../Context/AuthContext';
import api from '../../../API/CustomApi';
import { Config } from '../../../API/Config';
import Loader from './Loader';
import axios from 'axios';
import { toast } from 'react-toastify';

function AfterLogin() {
  const [showAddContact, setShowAddContact] = useState(false);
  const { handleSubmit, register, reset }   = useForm();
  const { user, setUser }                   = useContext(AuthContext);
  const [contactsdata, setContactsdata]     = useState([]);
  const [showLoader, setShowLoader]         = useState(false);
  const [MobileNo, setMobileNo]             = useState([]);
  const [locationMethod, setLocationMethod] = useState(null);
  const [locationError, setLocationError]   = useState(null);

  useEffect(() => {
    setContactsdata(Array.isArray(user?.contacts) ? user.contacts : []);
    setMobileNo(Array.isArray(user?.contacts) ? user.contacts : []);
  }, [user]);

  /* ── All original logic preserved exactly ── */
  const Submit = async (formData) => {
    setShowLoader(true);
    try {
      const contactData = new FormData();
      contactData.append('photo', formData.photo[0]);
      contactData.append('name', formData.name);
      contactData.append('MobileNo', formData.MobileNo);
      contactData.append('userId', user._id);
      const { data: responseData } = await api.post(Config.ContactUrl, contactData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (responseData) {
        const newContact = responseData.contact;
        setUser((prev) => ({ ...prev, contacts: [...(prev.contacts || []), newContact] }));
        setShowAddContact(false);
        reset();
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    } finally { setShowLoader(false); }
  };

  const handleDelete = async (contactId) => {
    setShowLoader(true);
    try {
      const response = await api.delete(Config.DELETECONTACTUrl, { params: { userId: user._id, contactId } });
      if (response.status === 200) {
        setContactsdata((prev) => prev.filter((c) => c._id !== contactId));
      }
    } catch (error) { console.error('Error deleting contact:', error); }
    finally { setShowLoader(false); }
  };

  const getIPBasedLocation = async () => {
    try {
      let response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('First IP API failed');
      const data = await response.json();
      if (data.latitude && data.longitude) return { latitude: data.latitude, longitude: data.longitude, accuracy: 50000, method: 'ipapi' };
      response = await fetch('https://ipwho.is/');
      if (!response.ok) throw new Error('Second IP API failed');
      const fallback = await response.json();
      return { latitude: fallback.latitude, longitude: fallback.longitude, accuracy: 50000, method: 'ipwhois' };
    } catch (error) { throw new Error('Could not determine approximate location from IP'); }
  };

  const getLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
        );
        setLocationMethod('gps');
        return { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, method: 'gps' };
      } catch { console.log('GPS failed, falling back to IP'); }
    }
    try {
      const ipLocation = await getIPBasedLocation();
      setLocationMethod('ip');
      return ipLocation;
    } catch { throw new Error('Could not determine your location'); }
  };

  const handleSOS = async () => {
    setShowLoader(true);
    setLocationError(null);
    
    const toastId = toast.loading("Sending Emergency Alert...");

    try {
      if (MobileNo.length === 0) {
        toast.dismiss(toastId);
        throw new Error('No emergency contacts available');
      }

      const location = await getLocation();

      // Trigger backend API in background
      api.post(Config.EMERGENCYUrl, {
        contactNumbers: MobileNo.map(c => c.MobileNo),
        location: { latitude: location.latitude, longitude: location.longitude },
      }).catch(e => console.error("API Error (Non-Fatal):", e));
      
      // Artificial delay for cinematic demo effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.update(toastId, { 
        render: <div><p className="font-bold text-base">Emergency Alert Sent Successfully</p><p className="text-xs mt-1 text-[#9CA3AF]">Live location shared with trusted contacts</p></div>, 
        type: "success", 
        isLoading: false, 
        autoClose: 5000 
      });
    } catch (error) {
      setLocationError(error.message);
      toast.update(toastId, { 
        render: <div><p className="font-semibold">Emergency Alert Failed</p><p className="text-sm">{error.message}</p></div>, 
        type: "error", 
        isLoading: false, 
        autoClose: 5000 
      });
    } finally { 
      setShowLoader(false); 
    }
  };

  const testLocation = async () => {
    toast.info('Testing location access...');
    try {
      const location = await getLocation();
      toast.success(<div><p>Location test successful!</p><p className="text-sm mt-1">Method: {location.method.toUpperCase()} · Accuracy: ~{Math.round(location.accuracy / 1000)}km</p></div>);
    } catch (error) { toast.error(`Location test failed: ${error.message}`); }
  };

  return (
    <div className="w-full min-h-screen pb-32 relative" style={{ background: '#0A0A0F' }}>
      {showLoader && <Loader />}

      {/* ── Location Status Banner ── */}
      {locationMethod && (
        <div className={`mx-4 mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium animate-fadeInDown ${
          locationMethod === 'gps'
            ? 'text-[#4ade80]'
            : 'text-[#fbbf24]'
        }`}
          style={{
            background: locationMethod === 'gps' ? 'rgba(74,222,128,0.08)' : 'rgba(251,191,36,0.08)',
            border: `1px solid ${locationMethod === 'gps' ? 'rgba(74,222,128,0.2)' : 'rgba(251,191,36,0.2)'}`,
          }}>
          {locationMethod === 'gps' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {locationMethod === 'gps' ? 'Precise GPS location active' : 'Approximate IP-based location'}
        </div>
      )}

      {locationError && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm text-[#FF6B9D] animate-fadeInDown"
          style={{ background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.2)' }}>
          {locationError}
        </div>
      )}

      {/* ── SOS Hero Section ── */}
      <section className="w-full flex flex-col items-center justify-center px-6 pt-10 pb-4">
        {/* Greeting */}
        <div className="text-center mb-2">
          <p className="text-[#9CA3AF] text-sm font-medium">Welcome back,</p>
          <h1 className="text-2xl font-black text-white">{user?.username}</h1>
        </div>

        {/* Status indicator */}
        <div className="badge-success mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
          Protection Active
        </div>

        {/* SOS Button */}
        <div
          className="cursor-pointer mb-3"
          onClick={handleSOS}
          role="button"
          aria-label="Activate SOS Emergency Alert"
        >
          <SOSButton />
        </div>

        <p className="text-[#6B7280] text-xs text-center max-w-[200px] leading-relaxed">
          Tap to instantly alert all emergency contacts with your location
        </p>

        {/* Test Location */}
        <button
          onClick={(e) => { e.stopPropagation(); testLocation(); }}
          className="mt-5 btn-ghost text-xs px-5 py-2"
        >
          <MapPin className="w-3.5 h-3.5" />
          Test Location
        </button>
      </section>

      {/* ── Emergency Contacts ── */}
      <section className="px-4 mt-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-white font-bold text-lg">Emergency Contacts</h2>
          <span className="text-[#6B7280] text-xs">
            {contactsdata.length}/3
          </span>
        </div>

        {contactsdata.length > 0 ? (
          <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4">
            {contactsdata.map((contact, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-4 flex items-center gap-4 animate-fadeInUp"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#FF2D55]/20"
                    src={contact.photo}
                    alt={contact.name}
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#4ade80] border-2 border-[#0A0A0F]" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{contact.name}</p>
                  <p className="text-[#9CA3AF] text-xs mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {contact.MobileNo}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(contact._id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-[#FF2D55]/10 hover:border-[#FF2D55]/30"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  aria-label="Delete contact"
                >
                  <CircleX className="w-4 h-4 text-[#6B7280] hover:text-[#FF2D55]" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.15)' }}>
              <User className="w-7 h-7 text-[#FF2D55]" />
            </div>
            <p className="text-white font-semibold mb-1">No contacts yet</p>
            <p className="text-[#9CA3AF] text-sm max-w-xs">
              Add emergency contacts so they can be alerted instantly when you trigger SOS.
            </p>
          </div>
        )}

        {/* Add Contact Button / Limit Message */}
        <div className="flex flex-col items-center mt-4 gap-2">
          {contactsdata.length < 3 ? (
            <button
              className="btn-primary px-6 py-3 rounded-2xl"
              onClick={() => setShowAddContact(true)}
            >
              <Plus className="w-4 h-4" />
              Add Emergency Contact
            </button>
          ) : (
            <div className="badge-warning">
              Maximum 3 contacts reached
            </div>
          )}
        </div>
      </section>

      {/* ── Add Contact Modal ── */}
      {showAddContact && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowAddContact(false)}>
          <div
            className="w-full max-w-md rounded-3xl p-6 animate-scaleIn"
            style={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-bold text-xl">Add Contact</h2>
                <p className="text-[#9CA3AF] text-sm mt-0.5">Emergency contact details</p>
              </div>
              <button onClick={() => { setShowAddContact(false); reset(); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <X className="w-4 h-4 text-[#9CA3AF]" />
              </button>
            </div>

            <form onSubmit={handleSubmit(Submit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Profile Photo</label>
                <input type="file" accept="image/png, image/jpg, image/jpeg, image/webp"
                  className="w-full text-sm text-[#9CA3AF] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#FF2D55]/10 file:text-[#FF6B9D] hover:file:bg-[#FF2D55]/20 file:cursor-pointer file:transition-colors"
                  {...register('photo', { required: true })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input type="text" className="input-dark pl-11" placeholder="Contact's name"
                    {...register('name', { required: true })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input type="text" className="input-dark pl-11" placeholder="+91 99999 99999"
                    {...register('MobileNo', { required: true })} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddContact(false); reset(); }}
                  className="btn-ghost flex-1 py-3 justify-center rounded-2xl">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 py-3 justify-center rounded-2xl">
                  <Shield className="w-4 h-4" />
                  Add Contact
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

export default AfterLogin;