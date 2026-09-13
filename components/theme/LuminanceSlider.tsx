'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';
import {
  applyLuminance,
  getSavedLuminance,
  getTierForPercentage,
  THEME_TIERS,
} from '@/lib/theme/luminance';

interface LuminanceSliderProps {
  compact?: boolean;
  className?: string;
}

export function LuminanceSlider({ compact = false, className = '' }: LuminanceSliderProps) {
  const [luminance, setLuminance] = useState<number>(100);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const initial = getSavedLuminance();
    setLuminance(initial);
    applyLuminance(initial);
  }, []);

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleChange = (val: number) => {
    setLuminance(val);
    applyLuminance(val);
  };

  const currentTier = getTierForPercentage(luminance);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--theme-surface)] text-[var(--theme-text-primary)] border-2 border-[var(--theme-border)] shadow-[3px_3px_0px_0px_var(--theme-shadow-color)] hover:shadow-[4px_4px_0px_0px_var(--theme-shadow-color)] transition-shadow font-black uppercase text-xs cursor-pointer select-none"
        title="Adjust ambient lightness / theme"
      >
        <span className="text-sm">{currentTier.icon}</span>
        <span className="hidden sm:inline">{luminance}%</span>
        <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--theme-text-primary)] opacity-80" />
      </motion.button>

      {/* Floating Control Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 bg-[var(--theme-surface)] text-[var(--theme-text-primary)] border-4 border-[var(--theme-border)] p-4 shadow-[6px_6px_0px_0px_var(--theme-shadow-color)] select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[var(--theme-border)] mb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[var(--theme-text-primary)]" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Store Lightness
                </span>
              </div>
              <span className="bg-yellow-300 text-black border-2 border-black text-[10px] font-black px-2 py-0.5 uppercase shadow-[1px_1px_0px_0px_#000000]">
                {currentTier.icon} {currentTier.label} ({luminance}%)
              </span>
            </div>

            {/* Slider Track */}
            <div className="my-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1 text-[var(--theme-text-secondary)]">
                <span className="flex items-center gap-1">
                  <span>🌑</span> 0% Void
                </span>
                <span className="flex items-center gap-1">
                  100% Day <span>☀️</span>
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={luminance}
                onChange={(e) => handleChange(parseInt(e.target.value, 10))}
                className="luminance-slider w-full"
                aria-label="Lightness Slider"
              />
            </div>

            {/* Quick Presets */}
            <div className="mt-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-[var(--theme-text-secondary)] mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Quick Moods</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {THEME_TIERS.map((tier) => {
                  const isActive = Math.abs(luminance - tier.percentage) < 12;
                  return (
                    <button
                      key={tier.percentage}
                      type="button"
                      onClick={() => handleChange(tier.percentage)}
                      className={`flex flex-col items-center justify-center p-1.5 text-center border-2 border-[var(--theme-border)] text-[10px] font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_0px_var(--theme-shadow-color)] scale-105'
                          : 'bg-[var(--theme-surface-elevated)] text-[var(--theme-text-primary)] hover:bg-yellow-100 hover:text-black'
                      }`}
                    >
                      <span className="text-sm">{tier.icon}</span>
                      <span className="text-[9px] mt-0.5">{tier.percentage}%</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset / Default CTA */}
            <div className="mt-4 pt-2.5 border-t-2 border-[var(--theme-border)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleChange(100)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset (100% Day)
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-[var(--theme-text-primary)] text-[var(--theme-bg)] px-2.5 py-1 text-[10px] font-black uppercase tracking-tight border-2 border-[var(--theme-border)] cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Inline version for Sidebar or Settings drawers
 */
export function InlineLuminanceController({ className = '' }: { className?: string }) {
  const [luminance, setLuminance] = useState<number>(100);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initial = getSavedLuminance();
    setLuminance(initial);
  }, []);

  const handleChange = (val: number) => {
    setLuminance(val);
    applyLuminance(val);
  };

  const currentTier = getTierForPercentage(luminance);

  if (!mounted) return null;

  return (
    <div className={`p-4 bg-[var(--theme-surface)] border-2 border-[var(--theme-border)] shadow-[3px_3px_0px_0px_var(--theme-shadow-color)] ${className}`}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-sm font-black uppercase tracking-tight text-[var(--theme-text-primary)] flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Theme Lightness
        </span>
        <span className="bg-yellow-300 text-black border-2 border-black text-xs font-black px-2 py-0.5 uppercase shadow-[1px_1px_0px_0px_#000000]">
          {currentTier.icon} {luminance}%
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={luminance}
        onChange={(e) => handleChange(parseInt(e.target.value, 10))}
        className="luminance-slider w-full my-2.5"
        aria-label="Lightness Slider"
      />

      <div className="grid grid-cols-5 gap-1.5 mt-2">
        {THEME_TIERS.map((tier) => (
          <button
            key={tier.percentage}
            type="button"
            onClick={() => handleChange(tier.percentage)}
            className={`py-1.5 px-1 text-center border-2 border-[var(--theme-border)] text-[11px] font-black cursor-pointer transition-all ${
              Math.abs(luminance - tier.percentage) < 12
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_0px_var(--theme-shadow-color)]'
                : 'bg-[var(--theme-surface-elevated)] text-[var(--theme-text-primary)] hover:bg-yellow-100 hover:text-black'
            }`}
          >
            <span className="text-sm block">{tier.icon}</span>
            <span className="mt-0.5 block">{tier.percentage}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
