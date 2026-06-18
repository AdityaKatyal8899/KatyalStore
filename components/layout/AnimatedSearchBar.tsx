'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useScrollY } from '@/lib/hooks/useScrollY';

interface AnimatedSearchBarProps {
  onSearchChange: (query: string) => void;
}

export function AnimatedSearchBar({ onSearchChange }: AnimatedSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [placeholder, setPlaceholder] = useState('Look for your attire');
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollY = useScrollY();
  const isScrolled = scrollY > 100;

  // Switch placeholder every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder((prev) =>
        prev === 'Look for your attire' ? 'Find your vibe' : 'Look for your attire'
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  return (
    <motion.div
      className={
        isScrolled
          ? "fixed top-[15px] right-4 md:right-[calc((100vw-768px)/2+24px)] z-50 flex items-center h-[42px]"
          : "absolute top-8 right-4 md:right-[calc((100vw-768px)/2+24px)] z-40 flex items-center h-[42px]"
      }
      layout
    >
      {/* Expanded search input */}
      {isExpanded && (
        <motion.input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
          className="border-2 border-black bg-white px-4 py-2 text-black placeholder-gray-500 focus:outline-none focus:bg-yellow-100 font-bold mr-2 text-sm sm:text-base shadow-[3px_3px_0px_0px_#000000] h-[42px]"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 200, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Search button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-black text-white p-2 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] transition-shadow shrink-0 cursor-pointer h-[42px] w-[42px] flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Search className="w-4.5 h-4.5" />
      </motion.button>

      {/* Close button when expanded */}
      {isExpanded && (
        <motion.button
          onClick={() => {
            setIsExpanded(false);
            setSearchQuery('');
            onSearchChange('');
          }}
          className="ml-2 bg-yellow-300 text-black font-black p-2 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] transition-shadow shrink-0 cursor-pointer h-[42px] w-[42px] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          ✕
        </motion.button>
      )}
    </motion.div>
  );
}
