'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, Calendar, LogOut } from 'lucide-react';
import { APPS } from '@/lib/appData';
import { AuthGatekeeper } from '@/components/auth/AuthGatekeeper';
import { DownloadButton } from '@/components/shared/DownloadButton';
import { StarRating } from '@/components/store/StarRating';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AppDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = React.use(params);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  
  // App lookup
  const staticApp = APPS.find((a) => a.id === id);
  const [app, setApp] = useState<any>(staticApp);

  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [rating, setRating] = useState(4.5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Edit/Delete states
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(4.5);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Custom Neo-brutalist Toast/Confirm states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'error' | 'success'>('info');
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4000);
  };

  const fetchDynamicApp = async () => {
    try {
      const res = await fetch('/api/apps');
      if (res.ok) {
        const data = await res.json();
        const matchedApp = data.find((a: any) => a.id === id);
        if (matchedApp) {
          setApp(matchedApp);
        }
      }
    } catch (e) {
      console.error('[KatyalStore] Error loading dynamic app details:', e);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDynamicApp();
    }
  }, [id]);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const user = localStorage.getItem('katyalstore_user');
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
        setIsAuthenticated(true);
      } catch (e) {
        console.error('[KatyalStore] Error parsing stored user:', e);
      }
    }
  }, []);

  const handleAuthenticated = (userData: { name: string; email: string }) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('katyalstore_user', JSON.stringify(userData));
  };

  const handleLogOut = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('katyalstore_user');
    router.push('/');
  };

  // Fetch reviews from API
  const fetchReviews = async () => {
    if (!staticApp) return;
    setIsLoadingReviews(true);
    try {
      const res = await fetch(`/api/reviews?appName=${encodeURIComponent(staticApp.name)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error('[KatyalStore] Error fetching reviews:', e);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (staticApp) {
      fetchReviews();
    }
  }, [id]);

  if (!app) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black text-black uppercase tracking-tight mb-4">App Not Found</h2>
        <p className="text-black font-medium mb-8">The app you are looking for does not exist in our vibe catalog.</p>
        <Link href="/" className="bg-white border-4 border-black px-6 py-3 font-black text-black uppercase tracking-tight shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] transition-shadow">
          Back to Store
        </Link>
      </div>
    );
  }

  // Only use dynamic reviews (removed pre-seeded hardcoded data)
  const allReviews = reviews;

  // Calculate dynamic ratings summary
  const averageRating = allReviews.length > 0 
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : 5.0; // default to a high rating if no reviews yet

  const handleShare = () => {
    const downloadUrl = `${window.location.origin}/app/${app.id}`;
    setShareUrl(downloadUrl);
    setIsShareOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please fill in all review fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: app.name,
          rating,
          title,
          content,
          author: currentUser?.name || 'Store Guest',
          email: currentUser?.email || 'guest@example.com',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setTitle('');
        setContent('');
        setRating(4.5);
        fetchReviews(); // refresh
        fetchDynamicApp(); // refresh app details count
        showToast('Review submitted successfully!', 'success');
      } else {
        showToast('Failed to submit review', 'error');
      }
    } catch (error) {
      console.error('[KatyalStore] Review submission error:', error);
      showToast('Error submitting review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (rev: any) => {
    setEditingReviewId(rev.id);
    setEditRating(rev.rating);
    setEditTitle(rev.title);
    setEditContent(rev.content);
  };

  const handleReviewUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewId || !editTitle.trim() || !editContent.trim()) {
      showToast('Please fill in all review fields', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingReviewId,
          rating: editRating,
          title: editTitle,
          content: editContent,
          email: currentUser?.email,
        }),
      });

      if (response.ok) {
        setEditingReviewId(null);
        fetchReviews(); // refresh
        fetchDynamicApp(); // refresh app details count
        showToast('Review updated successfully!', 'success');
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to update review', 'error');
      }
    } catch (error) {
      console.error('[KatyalStore] Review update error:', error);
      showToast('Error updating review', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReviewDelete = async (reviewId: string) => {
    setConfirmDialog({
      message: 'Are you sure you want to delete your review? This vibe is permanent.',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const response = await fetch(`/api/reviews?id=${reviewId}&email=${encodeURIComponent(currentUser?.email || '')}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            fetchReviews(); // refresh
            fetchDynamicApp(); // refresh app details count
            showToast('Review deleted successfully!', 'success');
          } else {
            const data = await response.json();
            showToast(data.error || 'Failed to delete review', 'error');
          }
        } catch (error) {
          console.error('[KatyalStore] Review delete error:', error);
          showToast('Error deleting review', 'error');
        }
      }
    });
  };

  return (
    <>
      {/* Protect page with Auth Gatekeeper */}
      {!isAuthenticated && (
        <AuthGatekeeper onAuthenticated={handleAuthenticated} />
      )}

      {isAuthenticated && (
        <div className="relative min-h-screen bg-[#FDFBF7] text-black pb-32">
          {/* Fixed Bottom Right Log Out Button */}
          <motion.button
            onClick={handleLogOut}
            className="fixed bottom-4 right-4 z-50 bg-red-400 border-2 border-black px-4 py-2 font-black text-black uppercase tracking-tight text-xs md:text-sm hover:shadow-[4px_4px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-shadow flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </motion.button>

          {/* Main Container */}
          <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
            {/* Navigation & Share bar */}
            <div className="flex justify-between items-center mb-8">
              <Link 
                href="/" 
                className="group flex items-center gap-2 bg-white border-2 border-black px-4 py-2 text-black font-black uppercase tracking-tight text-xs md:text-sm hover:shadow-[4px_4px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-shadow duration-100"
              >
                <ArrowLeft className="w-4 h-4" /> 
                <span>Back to Store</span>
              </Link>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-yellow-300 border-2 border-black px-4 py-2 text-black font-black uppercase tracking-tight text-xs md:text-sm hover:shadow-[4px_4px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-shadow duration-100"
              >
                <Share2 className="w-4 h-4" />
                <span>Share App</span>
              </button>
            </div>

            {/* Split layout: App description on left, reviews on right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Product Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_#000000] relative">
                  
                  {/* Category Accent */}
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 font-black text-xs uppercase tracking-wider">
                    {app.category}
                  </div>

                  {/* App Basic Info */}
                  <div className="flex flex-col sm:flex-row gap-6 sm:items-center mb-6 pt-4">
                    {/* App icon surrounded in white background rectangle */}
                    <div className="bg-white w-24 h-24 p-4 flex items-center justify-center flex-shrink-0 relative border-4 border-black shadow-[4px_4px_0px_0px_#000000]">
                      <Image
                        src={app.icon}
                        alt={app.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mb-1">
                        {app.name}
                      </h1>
                      <div className="flex flex-wrap gap-3 text-xs font-black uppercase tracking-tight">
                        <span className="bg-orange-200 border border-black px-2 py-0.5">{app.size}</span>
                        <span className="bg-yellow-200 border border-black px-2 py-0.5">v1.0.0</span>
                        {app.downloadsCount !== undefined && (
                          <span className="bg-green-300 border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000]">
                            📥 {app.downloadsCount} Downloads
                          </span>
                        )}
                        {app.reviewsCount !== undefined && (
                          <span className="bg-blue-300 border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000]">
                            💬 {app.reviewsCount} Reviews
                          </span>
                        )}
                        {app.averageRating !== undefined && app.reviewsCount > 0 && (
                          <span className="bg-yellow-300 border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000]">
                            ★ {app.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Teaser quote */}
                  <div className="border-l-4 border-black pl-4 mb-6">
                    <p className="text-lg font-bold text-gray-700 italic">
                      &quot;{app.teaser}&quot;
                    </p>
                  </div>

                  {/* Full Description */}
                  <h3 className="text-xl font-black uppercase tracking-tight border-b-2 border-black pb-2 mb-3">
                    About App
                  </h3>
                  <p className="text-sm sm:text-base font-medium leading-relaxed mb-8 text-black">
                    {app.fullDescription}
                  </p>

                  {/* Download Action Box */}
                  <div className="bg-orange-50 border-2 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_#000000]">
                    <h4 className="text-sm font-black uppercase tracking-wider mb-2">Ready to vibe?</h4>
                    <p className="text-xs text-gray-600 mb-4">Click below to start simulating the immediate APK download for your device.</p>
                    <DownloadButton appName={app.name} onDownloadComplete={fetchDynamicApp} />
                  </div>
                </div>


              </div>

              {/* Right Column: Reviews and Ratings */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Aggregate Rating Summary */}
                <div className="bg-yellow-300 border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000000]">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">User Feedback</h3>
                  
                  {allReviews.length === 0 ? (
                    <div className="py-2">
                      <p className="text-2xl font-black uppercase tracking-tight text-black mb-1">No Stars yet...</p>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-700">Be the first to rate this app!</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl sm:text-5xl font-black text-black">{averageRating.toFixed(1)}</span>
                        <span className="text-lg font-bold text-black uppercase">out of 5</span>
                      </div>

                      <div className="mb-2">
                        <StarRating value={averageRating} onChange={() => {}} interactive={false} size="md" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-wide text-gray-700">
                        Based on {allReviews.length} total user reviews
                      </p>
                    </>
                  )}
                </div>

                {/* Write a Review Section */}
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000000]">
                  <h3 className="text-lg font-black uppercase tracking-tight border-b-2 border-black pb-2 mb-4">
                    Leave a Review
                  </h3>
                  
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-tight mb-2">
                        Rating
                      </label>
                      <StarRating value={rating} onChange={setRating} interactive={true} size="md" />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-tight mb-1">
                        Review Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Give it a punchy title..."
                        maxLength={60}
                        className="w-full border-2 border-black bg-white px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:bg-orange-50 font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-tight mb-1">
                        Your Thoughts
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe your vibe with this app..."
                        maxLength={300}
                        className="w-full border-2 border-black bg-white px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:bg-orange-50 font-medium text-sm resize-none h-24"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-black text-white font-black py-3 uppercase tracking-tight text-xs border-4 border-black hover:shadow-[4px_4px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting Vibe...' : 'Submit Review'}
                    </button>
                  </form>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-tight">Recent Reviews ({allReviews.length})</h3>
                  
                  {isLoadingReviews ? (
                    <div className="bg-white border-2 border-black p-4 text-center font-bold">
                      Loading reviews...
                    </div>
                  ) : allReviews.length === 0 ? (
                    /* Display text "Yet to be Vibed" and subtext "Do you have it on your vibe? Tell us...." */
                    <div className="bg-white border-4 border-black p-8 text-center shadow-[4px_4px_0px_0px_#000000] bg-orange-50">
                      <p className="font-black text-xl uppercase tracking-tight text-black mb-1">Yet to be Vibed</p>
                      <p className="text-xs text-gray-700 font-bold uppercase tracking-wide">Do you have it on your vibe? Tell us....</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {allReviews.map((rev) => (
                        <div 
                          key={rev.id} 
                          className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000000]"
                        >
                          {editingReviewId === rev.id ? (
                            <form onSubmit={handleReviewUpdate} className="space-y-3">
                              <h4 className="font-black text-xs uppercase tracking-tight text-black">Edit Review</h4>
                              <div>
                                <StarRating value={editRating} onChange={setEditRating} interactive={true} size="sm" />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  placeholder="Title"
                                  maxLength={60}
                                  className="w-full border border-black bg-white px-2 py-1 text-black font-bold text-xs focus:outline-none"
                                />
                              </div>
                              <div>
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  placeholder="Your thoughts..."
                                  maxLength={300}
                                  className="w-full border border-black bg-white px-2 py-1 text-black font-medium text-xs resize-none h-16 focus:outline-none"
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setEditingReviewId(null)}
                                  className="bg-white border border-black px-2 py-1 text-[10px] font-black uppercase tracking-tight cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={isUpdating}
                                  className="bg-black text-white px-2 py-1 text-[10px] font-black uppercase tracking-tight border border-black cursor-pointer"
                                >
                                  {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex justify-between items-start mb-2 gap-2">
                                <h4 className="font-black text-sm uppercase tracking-tight text-black line-clamp-1">
                                  {rev.title}
                                </h4>
                                <span className="text-[10px] bg-black text-white px-2 py-0.5 shrink-0 uppercase tracking-tight font-black">
                                  ★ {rev.rating.toFixed(1)}
                                </span>
                              </div>

                              <p className="text-xs text-gray-700 font-medium mb-3 leading-relaxed">
                                {rev.content}
                              </p>

                              <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase pt-2 border-t border-gray-100">
                                <span>By {rev.author || 'Store Guest'}</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {rev.timestamp ? new Date(rev.timestamp).toLocaleDateString() : 'Just now'}
                                </span>
                              </div>

                              {currentUser?.email && rev.email === currentUser.email.trim().toLowerCase() && (
                                <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-dashed border-gray-200">
                                  <button
                                    onClick={() => startEdit(rev)}
                                    className="text-[10px] font-black uppercase text-blue-600 hover:underline cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleReviewDelete(rev.id)}
                                    className="text-[10px] font-black uppercase text-red-600 hover:underline cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </main>

          {/* Share Modal containing link copy + QR code scan */}
          <AnimatePresence>
            {isShareOpen && (
              <motion.div
                className="fixed inset-0 bg-[#FDFBF7]/85 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsShareOpen(false)}
              >
                <motion.div
                  className="bg-white border-4 border-black p-6 w-full max-w-sm shadow-[8px_8px_0px_0px_#000000] relative text-center"
                  initial={{ scale: 0.9, rotate: 2 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0.9, rotate: -2 }}
                  onClick={(e) => e.stopPropagation()}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <button
                    onClick={() => setIsShareOpen(false)}
                    className="absolute top-3 right-3 bg-black text-white p-1.5 hover:bg-gray-800 transition font-black text-xs"
                  >
                    ✕
                  </button>
                  
                  <h3 className="text-xl font-black uppercase tracking-tight mb-4">Share {app.name}</h3>
                  
                  {/* QR Code Container */}
                  <div className="bg-white border-4 border-black p-3 inline-block shadow-[4px_4px_0px_0px_#000000] mb-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`}
                      alt="QR Code"
                      className="w-40 h-40 object-contain mx-auto"
                    />
                    <p className="text-[10px] font-black uppercase tracking-wider mt-2 text-black">Scan to Vibe & Download</p>
                  </div>

                  {/* Copy Link Input */}
                  <div className="flex gap-2 items-center mb-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="w-full bg-gray-50 border-2 border-black px-3 py-1.5 text-xs text-black font-medium select-all focus:outline-none"
                    />
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(shareUrl);
                          setShareSuccess(true);
                          setTimeout(() => setShareSuccess(false), 2000);
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="bg-yellow-300 border-2 border-black px-3 py-1.5 text-black font-black uppercase tracking-tight text-xs shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-shadow shrink-0"
                    >
                      Copy
                    </button>
                  </div>

                  <AnimatePresence>
                    {shareSuccess && (
                      <motion.p
                        className="text-green-600 text-xs font-black uppercase tracking-wider"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        Link Copied!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast Notifications */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                className={`fixed top-4 right-4 z-[100] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000000] font-black uppercase text-xs sm:text-sm tracking-tight ${
                  toastType === 'success'
                    ? 'bg-green-300 text-black'
                    : toastType === 'error'
                    ? 'bg-red-300 text-black'
                    : 'bg-yellow-300 text-black'
                }`}
                initial={{ opacity: 0, y: -20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -20, x: 20 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                <div className="flex items-center gap-2">
                  <span>{toastType === 'success' ? '✅' : toastType === 'error' ? '❌' : 'ℹ️'}</span>
                  <span>{toastMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm Dialog */}
          <AnimatePresence>
            {confirmDialog && (
              <div className="fixed inset-0 bg-[#FDFBF7]/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                <motion.div
                  className="bg-white border-4 border-black p-6 w-full max-w-sm shadow-[8px_8px_0px_0px_#000000] text-center"
                  initial={{ scale: 0.9, rotate: 2 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0.9, rotate: -2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-black">Hold up!</h3>
                  <p className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-tight">
                    {confirmDialog.message}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setConfirmDialog(null)}
                      className="bg-white border-2 border-black px-4 py-2 text-black font-black uppercase tracking-tight text-xs shadow-[2px_2px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-shadow shrink-0 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDialog.onConfirm}
                      className="bg-red-400 border-2 border-black px-4 py-2 text-black font-black uppercase tracking-tight text-xs shadow-[2px_2px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-shadow shrink-0 cursor-pointer"
                    >
                      Delete Vibe
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
