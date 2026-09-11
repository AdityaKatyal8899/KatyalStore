'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';

export interface NeoSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: string;
  badge?: string;
}

interface NeoSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: NeoSelectOption[];
  placeholder?: string;
  className?: string;
}

export function NeoSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
}: NeoSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border-3 border-black px-4 py-3 text-left font-black text-xs sm:text-sm uppercase tracking-tight flex items-center justify-between cursor-pointer transition-all ${
          isOpen
            ? 'bg-yellow-200 shadow-[6px_6px_0px_0px_#000000]'
            : 'shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] hover:bg-yellow-50 active:shadow-[2px_2px_0px_0px_#000000]'
        }`}
      >
        <div className="flex items-center gap-3 truncate min-w-0 pr-2">
          {selectedOption?.icon && (
            <div className="w-6 h-6 relative bg-white border border-black p-0.5 flex-shrink-0 shadow-[1px_1px_0px_0px_#000000]">
              <Image
                src={selectedOption.icon || '/placeholder-logo.png'}
                alt=""
                fill
                className="object-contain"
              />
            </div>
          )}

          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption?.badge && (
            <span className="bg-yellow-300 border border-black px-1.5 py-0.2 text-[10px] font-black tracking-wider flex-shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 bg-black text-white p-1 border border-black ml-2"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 2, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 z-50 mt-1 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] max-h-64 overflow-y-auto"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-3 border-b-2 border-black last:border-b-0 cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-yellow-300 font-black'
                      : 'bg-white hover:bg-orange-100 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate min-w-0 pr-2">
                    {option.icon && (
                      <div className="w-6 h-6 relative bg-white border border-black p-0.5 flex-shrink-0 shadow-[1px_1px_0px_0px_#000000]">
                        <Image
                          src={option.icon || '/placeholder-logo.png'}
                          alt=""
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm uppercase tracking-tight text-black truncate">
                        {option.label}
                      </p>
                      {option.subLabel && (
                        <p className="text-[10px] text-gray-700 font-semibold uppercase truncate">
                          {option.subLabel}
                        </p>
                      )}
                    </div>

                    {option.badge && (
                      <span className="bg-white border border-black px-1.5 py-0.2 text-[10px] font-black uppercase text-black ml-2 shadow-[1px_1px_0px_0px_#000000]">
                        {option.badge}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="bg-black text-white p-1 flex-shrink-0 shadow-[1px_1px_0px_0px_#000000]">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
