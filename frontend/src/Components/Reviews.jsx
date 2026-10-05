import React, { useContext, useEffect, useState } from 'react';
import { Search, Plus, Star, X, MapPin, Calendar, User, MessageSquare } from 'lucide-react';
import BottomNav from './Home/BottomNav';
import { useForm } from 'react-hook-form';
import api from '../../API/CustomApi';
import { Config } from '../../API/Config';
import { AuthContext } from '../Context/AuthContext';
import Loader from './Home/Loader';

function Reviews() {
  const [searchQuery, setSearchQuery]   = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const { handleSubmit, register, reset } = useForm();
  const { user, setUser }               = useContext(AuthContext);
  const [reviews, setReviews]           = useState([]);
  const [allReviews, setAllReviews]     = useState([]);

  /* ── All original logic preserved ── */
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(Config.GETREVIEWSUrl);
        if (response.data) {
          const fetched = response.data.reviews || [];
          setReviews(fetched);
          setAllReviews(fetched);
        }
      } catch (error) { console.error('Error fetching reviews:', error); }
      finally { setIsLoading(false); }
    };
    fetchReviews();
  }, []);

  const handleSubmitReview = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post(Config.ADDREVIEWUrl, {
        location: data.location, title: data.title, review: data.review, userId: user._id,
      });
      if (response.status === 201) {
        const { review: newReview } = response.data;
        setReviews(prev => [newReview, ...prev]);
        setAllReviews(prev => [newReview, ...prev]);
        setShowAddReview(false);
        reset();
      }
    } catch (error) { console.error('Error submitting review:', error); }
    finally { setIsLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!searchQuery.trim()) {
        setReviews(allReviews);
      } else {
        const filtered = allReviews.filter(r =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.user?.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setReviews(filtered);
      }
    } catch { console.error('Search error'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen relative pb-28" style={{ background: '#0A0A0F' }}>
      {isLoading && <Loader />}

      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-white font-black text-2xl">Safety Reviews</h1>
            <p className="text-[#9CA3AF] text-sm mt-0.5">
              Welcome, <span className="text-[#FF6B9D] font-semibold">{user.username}</span>
            </p>
          </div>
          <button
            onClick={() => setShowAddReview(true)}
            className="btn-primary py-2.5 px-4 text-sm rounded-2xl"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Review</span>
          </button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-dark pl-11 py-3 rounded-2xl"
              placeholder="Search reviews, locations, users..."
            />
          </div>
          <button type="submit"
            className="btn-primary py-3 px-5 rounded-2xl text-sm flex-shrink-0">
            Search
          </button>
        </form>

        {/* Result count */}
        {allReviews.length > 0 && (
          <p className="text-[#6B7280] text-xs mt-3 px-1">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}{searchQuery && ' found'}
          </p>
        )}
      </div>

      {/* ── Reviews List ── */}
      <div className="flex-1 px-4 overflow-y-auto">
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <div
                key={review._id}
                className="glass-card rounded-2xl p-5 animate-fadeInUp"
                style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-[#FF6B9D]"
                      style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.2)' }}>
                      <MapPin className="w-3 h-3" />
                      {review.location}
                    </div>
                    <div className="flex items-center gap-1 text-[#6B7280] text-xs">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, si) => (
                      <Star key={si} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-white font-bold text-base mb-1.5">{review.title}</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-3">{review.review}</p>

                {/* Author */}
                <div className="flex items-center gap-2 pt-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-[#9CA3AF] text-xs">
                    <span className="text-white font-semibold">{review.user?.username || 'Anonymous'}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.15)' }}>
              <MessageSquare className="w-10 h-10 text-[#FF2D55]" />
            </div>
            <p className="text-white font-bold text-xl mb-2">
              {searchQuery ? 'No results found' : 'No reviews yet'}
            </p>
            <p className="text-[#9CA3AF] text-sm max-w-xs mb-6 leading-relaxed">
              {searchQuery
                ? `No reviews match "${searchQuery}". Try a different search.`
                : 'Be the first to share a safety review for your area.'}
            </p>
            {!searchQuery && (
              <button onClick={() => setShowAddReview(true)} className="btn-primary">
                <Plus className="w-4 h-4" /> Add First Review
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Add Review Modal ── */}
      {showAddReview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => { setShowAddReview(false); reset(); }}>
          <div
            className="w-full max-w-lg rounded-3xl p-6 animate-scaleIn"
            style={{ background: '#0F0F1A', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-bold text-xl">Share a Review</h2>
                <p className="text-[#9CA3AF] text-sm mt-0.5">Help others stay safe</p>
              </div>
              <button onClick={() => { setShowAddReview(false); reset(); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <X className="w-4 h-4 text-[#9CA3AF]" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleSubmitReview)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <input type="text" {...register('location', { required: true })}
                    className="input-dark pl-11" placeholder="e.g. MG Road, Bengaluru" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Title</label>
                <input type="text" {...register('title', { required: true })}
                  className="input-dark" placeholder="Brief summary of your experience" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9CA3AF] mb-2">Review</label>
                <textarea {...register('review', { required: true })} rows={4}
                  className="input-dark resize-none" placeholder="Share details about safety, lighting, foot traffic..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddReview(false); reset(); }}
                  className="btn-ghost flex-1 py-3 justify-center rounded-2xl">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-3 justify-center rounded-2xl">
                  <Star className="w-4 h-4" /> Submit Review
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

export default Reviews;
