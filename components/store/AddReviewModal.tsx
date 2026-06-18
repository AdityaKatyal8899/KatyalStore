'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { StarRating } from '@/components/store/StarRating';

interface AddReviewModalProps {
  appName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: { rating: number; title: string; content: string }) => void;
}

export function AddReviewModal({ appName, isOpen, onClose, onSubmit }: AddReviewModalProps) {
  const [rating, setRating] = useState(4);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName,
          rating,
          title,
          content,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        onSubmit({ rating, title, content });
        setRating(4);
        setTitle('');
        setContent('');
        onClose();
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('[v0] Review submission error:', error);
      alert('Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white border-4 border-black p-8 w-full max-w-md shadow-[8px_8px_0px_0px_#000000] relative max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.9, rotate: 2 }}
            onClick={(e) => e.stopPropagation()}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
          >
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black text-white p-2 hover:bg-gray-800 transition font-black"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            <h2 className="text-3xl font-black text-black mb-2 uppercase tracking-tight">
              Review {appName}
            </h2>
            <p className="text-black font-medium mb-6 text-sm">Share your experience with this app</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-black text-sm font-black mb-3 uppercase tracking-tight">
                  Rating
                </label>
                <StarRating
                  value={rating}
                  onChange={setRating}
                  interactive={true}
                  size="lg"
                />
              </div>

              <div>
                <label className="block text-black text-sm font-black mb-2 uppercase tracking-tight">
                  Review Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sum up your review..."
                  maxLength={60}
                  className="w-full border-2 border-black bg-white px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:bg-orange-50 font-medium"
                />
                <p className="text-xs text-gray-600 mt-1">{title.length}/60</p>
              </div>

              <div>
                <label className="block text-black text-sm font-black mb-2 uppercase tracking-tight">
                  Your Review
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell us what you think..."
                  maxLength={300}
                  className="w-full border-2 border-black bg-white px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:bg-orange-50 font-medium resize-none h-28"
                />
                <p className="text-xs text-gray-600 mt-1">{content.length}/300</p>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white font-black py-3 uppercase tracking-tight text-sm border-4 border-black hover:shadow-[6px_6px_0px_0px_#000000] active:shadow-[2px_2px_0px_0px_#000000] transition-shadow disabled:opacity-50"
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
