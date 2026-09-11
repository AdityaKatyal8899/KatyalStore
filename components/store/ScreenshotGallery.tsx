'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import Image from 'next/image';

interface ScreenshotGalleryProps {
  screenshots?: string[];
  appName?: string;
}

export function ScreenshotGallery({ screenshots = [], appName = 'App' }: ScreenshotGalleryProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIdx === null) return;

      if (e.key === 'Escape') {
        setActiveIdx(null);
      } else if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev !== null && prev < screenshots.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : screenshots.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, screenshots.length]);

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_#000000] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-3">
        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="bg-yellow-300 border-2 border-black p-1 shadow-[2px_2px_0px_0px_#000000]">
            <ImageIcon className="w-4 h-4 text-black" />
          </span>
          <span>In-App Screenshots</span>
        </h3>
        <span className="bg-orange-200 border border-black px-2 py-0.5 text-xs font-black uppercase tracking-tight">
          {screenshots.length} {screenshots.length === 1 ? 'Preview' : 'Previews'}
        </span>
      </div>

      <p className="text-xs text-gray-700 font-bold uppercase tracking-tight mb-4">
        Click any screenshot to expand in high-definition lightbox
      </p>

      {/* Horizontal Scrollable Gallery Showcase */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-black">
        {screenshots.map((url, idx) => (
          <motion.div
            key={`${url}-${idx}`}
            onClick={() => setActiveIdx(idx)}
            className="group relative flex-shrink-0 w-44 sm:w-52 aspect-[9/16] bg-[#FDFBF7] border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#000000] cursor-pointer transition-all snap-start overflow-hidden"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Image
              src={url}
              alt={`${appName} screenshot ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-yellow-300 border-2 border-black px-2.5 py-1 text-xs font-black uppercase tracking-tight flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000]">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Zoom</span>
              </div>
            </div>

            {/* Index badge */}
            <div className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase border border-black shadow-[1px_1px_0px_0px_#000000]">
              #{idx + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Fullscreen Modal */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIdx(null)}
          >
            {/* Modal Container */}
            <motion.div
              className="relative max-w-4xl max-h-[90vh] bg-white border-4 border-black p-4 sm:p-6 shadow-[10px_10px_0px_0px_#000000] flex flex-col"
              initial={{ scale: 0.9, rotate: -1 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.9, rotate: 1 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: 'spring', stiffness: 350 }}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-300 border border-black px-2 py-0.5 text-xs font-black uppercase">
                    {appName}
                  </span>
                  <span className="text-xs font-bold text-gray-700 uppercase">
                    Screenshot #{activeIdx + 1} of {screenshots.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveIdx(null)}
                  className="bg-red-400 border-2 border-black p-1.5 hover:bg-red-500 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>

              {/* Main Image View */}
              <div className="relative w-full h-[60vh] sm:h-[70vh] bg-black border-2 border-black flex items-center justify-center overflow-hidden">
                <Image
                  src={screenshots[activeIdx]}
                  alt={`${appName} screenshot full view`}
                  fill
                  className="object-contain p-2"
                  priority
                />
              </div>

              {/* Navigation Controls */}
              {screenshots.length > 1 && (
                <div className="flex items-center justify-between pt-3 mt-3 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : screenshots.length - 1))
                    }
                    className="bg-white border-2 border-black px-4 py-2 font-black uppercase text-xs flex items-center gap-1 hover:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex gap-1.5">
                    {screenshots.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setActiveIdx(dotIdx)}
                        className={`w-3 h-3 border border-black transition-colors ${
                          dotIdx === activeIdx ? 'bg-yellow-300' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                        title={`Go to screenshot #${dotIdx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveIdx((prev) => (prev !== null && prev < screenshots.length - 1 ? prev + 1 : 0))
                    }
                    className="bg-white border-2 border-black px-4 py-2 font-black uppercase text-xs flex items-center gap-1 hover:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
