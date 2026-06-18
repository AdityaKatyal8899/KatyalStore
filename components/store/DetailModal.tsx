'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { App } from '@/lib/appData';
import { X, Share2, MessageSquarePlus } from 'lucide-react';
import { DownloadButton } from '@/components/shared/DownloadButton';
import { AddReviewModal } from '@/components/store/AddReviewModal';
import Image from 'next/image';
import { useState } from 'react';

interface DetailModalProps {
  app: App | null;
  onClose: () => void;
}

export function DetailModal({ app, onClose }: DetailModalProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!app) return null;

  const handleShare = async () => {
    const downloadUrl = `https://katyalstore.app/download/${app.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: app.name,
          text: app.teaser,
          url: downloadUrl,
        });
      } catch (error) {
        console.log('[v0] Share cancelled:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(downloadUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (error) {
        console.error('[v0] Failed to copy link:', error);
      }
    }
  };

  return (
    <AnimatePresence>
      {app && (
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
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black text-white p-2 hover:bg-gray-800 transition font-black"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* App icon */}
            <div className="bg-black p-4 flex items-center justify-center mb-6 w-20 h-20 relative">
              <Image 
                src={app.icon} 
                alt={app.name}
                fill
                className="object-contain p-2"
              />
            </div>

            {/* App name */}
            <h2 className="text-3xl font-black text-black mb-2 uppercase tracking-tight">{app.name}</h2>

            {/* Category and size */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-black text-white bg-black px-2 py-1 uppercase tracking-tight">
                {app.category}
              </span>
              <span className="text-xs font-black text-black bg-orange-200 px-2 py-1 uppercase tracking-tight">{app.size}</span>
            </div>

            {/* Description */}
            <p className="text-black text-base leading-relaxed mb-8 font-medium border-l-4 border-black pl-4">
              {app.fullDescription}
            </p>

            {/* Additional info */}
            <div className="bg-orange-100 border-2 border-black p-4 mb-6">
              <p className="text-xs text-black font-black mb-2 uppercase tracking-tight">Version</p>
              <p className="text-black font-black text-lg">1.0.0</p>
            </div>

            {/* Download button */}
            <DownloadButton appName={app.name} />

            {/* Share success message */}
            {shareSuccess && (
              <motion.div
                className="bg-green-100 border-2 border-black p-3 mt-4 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-xs font-black text-black uppercase">Link copied!</p>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <motion.button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-white border-2 border-black px-3 py-2 text-black font-black uppercase tracking-tight text-xs hover:shadow-[4px_4px_0px_0px_#000000] transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </motion.button>

              <motion.button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center justify-center gap-2 bg-white border-2 border-black px-3 py-2 text-black font-black uppercase tracking-tight text-xs hover:shadow-[4px_4px_0px_0px_#000000] transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageSquarePlus className="w-4 h-4" />
                Review
              </motion.button>
            </div>

            {/* Rating/feedback */}
            <p className="text-center text-black text-xs mt-4 font-bold">
              4.8 RATING FROM 2,340 REVIEWS
            </p>

            {/* Add Review Modal */}
            <AddReviewModal
              appName={app.name}
              isOpen={showReviewModal}
              onClose={() => setShowReviewModal(false)}
              onSubmit={(review) => {
                console.log('[v0] Review submitted:', review);
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
