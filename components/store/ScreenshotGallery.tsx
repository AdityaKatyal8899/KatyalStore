'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
} from 'lucide-react';
import Image from 'next/image';

interface ScreenshotGalleryProps {
  screenshots?: string[];
  appName?: string;
}

export function ScreenshotGallery({ screenshots = [], appName = 'App' }: ScreenshotGalleryProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom and pan whenever screenshot changes or closes
  useEffect(() => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, [activeIdx]);

  // Keyboard navigation & zoom shortcuts for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIdx === null) return;

      if (e.key === 'Escape') {
        setActiveIdx(null);
      } else if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev !== null && prev < screenshots.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : screenshots.length - 1));
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel((prev) => Math.min(3, +(prev + 0.5).toFixed(1)));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoomLevel((prev) => {
          const next = Math.max(1, +(prev - 0.5).toFixed(1));
          if (next === 1) setPan({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setZoomLevel(1);
        setPan({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, screenshots.length]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(3, +(prev + 0.5).toFixed(1)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(1));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleZoom = () => {
    if (zoomLevel > 1) {
      handleResetZoom();
    } else {
      setZoomLevel(2);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (activeIdx === null) return;
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)] border-4 border-[var(--theme-border)] p-6 md:p-8 shadow-[8px_8px_0px_0px_var(--theme-shadow-color)] relative transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b-2 border-[var(--theme-border)] pb-3">
        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <span className="bg-yellow-300 border-2 border-black p-1 shadow-[2px_2px_0px_0px_#000000]">
            <ImageIcon className="w-4 h-4 text-black" />
          </span>
          <span>In-App Screenshots</span>
        </h3>
        <span className="bg-yellow-300 text-black border-2 border-black px-2 py-0.5 text-xs font-black uppercase tracking-tight shadow-[1px_1px_0px_0px_#000000]">
          {screenshots.length} {screenshots.length === 1 ? 'Preview' : 'Previews'}
        </span>
      </div>

      <p className="text-xs text-[var(--theme-text-secondary)] font-bold uppercase tracking-tight mb-4">
        Click any screenshot to expand in high-definition zoomable lightbox
      </p>

      {/* Horizontal Scrollable Gallery Showcase */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
        {screenshots.map((url, idx) => (
          <motion.div
            key={`${url}-${idx}`}
            onClick={() => setActiveIdx(idx)}
            className="group relative flex-shrink-0 w-44 sm:w-52 aspect-[9/16] bg-[var(--theme-surface-elevated)] border-4 border-[var(--theme-border)] shadow-[4px_4px_0px_0px_var(--theme-shadow-color)] hover:shadow-[7px_7px_0px_0px_var(--theme-shadow-color)] cursor-pointer transition-all snap-start overflow-hidden"
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
              <div className="bg-yellow-300 text-black border-2 border-black px-2.5 py-1 text-xs font-black uppercase tracking-tight flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000]">
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
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIdx(null)}
          >
            {/* Modal Container */}
            <motion.div
              className="relative w-full max-w-5xl max-h-[92vh] bg-[var(--theme-surface)] text-[var(--theme-text-primary)] border-4 border-[var(--theme-border)] p-4 sm:p-6 shadow-[10px_10px_0px_0px_var(--theme-shadow-color)] flex flex-col"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[var(--theme-border)] gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-300 text-black border-2 border-black px-2 py-0.5 text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000000]">
                    {appName}
                  </span>
                  <span className="text-xs font-bold text-[var(--theme-text-secondary)] uppercase">
                    Preview #{activeIdx + 1} of {screenshots.length}
                  </span>
                </div>

                {/* Interactive Zoom Controls */}
                <div className="flex items-center gap-1.5 bg-[var(--theme-surface-elevated)] border-2 border-[var(--theme-border)] p-1 shadow-[2px_2px_0px_0px_var(--theme-shadow-color)]">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="p-1 text-[var(--theme-text-primary)] hover:bg-yellow-300 hover:text-black border border-[var(--theme-border)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit cursor-pointer"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[10px] font-black uppercase px-1.5 min-w-[42px] text-center text-[var(--theme-text-primary)]">
                    {Math.round(zoomLevel * 100)}%
                  </span>

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="p-1 text-[var(--theme-text-primary)] hover:bg-yellow-300 hover:text-black border border-[var(--theme-border)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit cursor-pointer"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  {zoomLevel > 1 && (
                    <button
                      type="button"
                      onClick={handleResetZoom}
                      className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-300 text-black text-[10px] font-black uppercase border border-black cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                      title="Reset Zoom (0 / R)"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>1:1</span>
                    </button>
                  )}
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

              {/* Main Image View Container with Pan & Zoom */}
              <div
                ref={containerRef}
                onWheel={handleWheel}
                className="relative w-full h-[55vh] sm:h-[65vh] bg-black/95 border-2 border-[var(--theme-border)] flex items-center justify-center overflow-hidden select-none"
                style={{
                  cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
                }}
              >
                <motion.div
                  className="relative w-full h-full flex items-center justify-center"
                  animate={{
                    scale: zoomLevel,
                    x: pan.x,
                    y: pan.y,
                  }}
                  drag={zoomLevel > 1}
                  dragConstraints={containerRef}
                  dragElastic={0.1}
                  onDragEnd={(_, info) => {
                    setPan((prev) => ({
                      x: prev.x + info.offset.x,
                      y: prev.y + info.offset.y,
                    }));
                  }}
                  onClick={toggleZoom}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <Image
                    src={screenshots[activeIdx]}
                    alt={`${appName} screenshot full view`}
                    fill
                    className="object-contain p-2 pointer-events-none"
                    priority
                  />
                </motion.div>

                {/* Helper overlay hint when zoomed in */}
                {zoomLevel > 1 ? (
                  <div className="absolute bottom-3 left-3 bg-black/80 text-white border border-white/20 px-2 py-1 text-[10px] font-black uppercase flex items-center gap-1.5 pointer-events-none backdrop-blur-xs">
                    <Move className="w-3 h-3 text-yellow-400" />
                    <span>Drag to Pan • Click to Reset</span>
                  </div>
                ) : (
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white border border-white/20 px-2 py-1 text-[10px] font-black uppercase pointer-events-none backdrop-blur-xs opacity-75">
                    Click / Scroll to Zoom
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              {screenshots.length > 1 && (
                <div className="flex items-center justify-between pt-3 mt-3 border-t-2 border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : screenshots.length - 1))
                    }
                    className="bg-[var(--theme-surface-elevated)] text-[var(--theme-text-primary)] border-2 border-[var(--theme-border)] px-4 py-2 font-black uppercase text-xs flex items-center gap-1 hover:bg-yellow-300 hover:text-black shadow-[2px_2px_0px_0px_var(--theme-shadow-color)] cursor-pointer transition-colors"
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
                        className={`w-3.5 h-3.5 border-2 border-[var(--theme-border)] transition-all cursor-pointer ${
                          dotIdx === activeIdx
                            ? 'bg-yellow-300 scale-110 shadow-[1px_1px_0px_0px_var(--theme-shadow-color)]'
                            : 'bg-[var(--theme-surface-elevated)] hover:bg-yellow-100'
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
                    className="bg-[var(--theme-surface-elevated)] text-[var(--theme-text-primary)] border-2 border-[var(--theme-border)] px-4 py-2 font-black uppercase text-xs flex items-center gap-1 hover:bg-yellow-300 hover:text-black shadow-[2px_2px_0px_0px_var(--theme-shadow-color)] cursor-pointer transition-colors"
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
