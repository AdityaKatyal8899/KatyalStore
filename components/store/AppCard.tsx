'use client';

import { motion } from 'framer-motion';
import { App } from '@/lib/appData';
import { useState } from 'react';
import Image from 'next/image';

interface AppCardProps {
  app: App;
  onClick: (app: App) => void;
}

export function AppCard({ app, onClick }: AppCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      onClick={() => {
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          onClick(app);
        }
      }}
      className="bg-white border-4 border-black cursor-pointer text-left shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] transition-shadow group p-6"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Horizontal layout: Icon + Content */}
      <div className="flex gap-4 items-start">
        {/* Icon block with white background */}
        <div className="bg-white border-2 border-black p-2 flex items-center justify-center flex-shrink-0 w-16 h-16 relative shadow-[2px_2px_0px_0px_#000000]">
          <Image 
            src={app.icon} 
            alt={app.name}
            fill
            className="object-contain p-1"
          />
        </div>

        {/* Content section */}
        <div className="flex-1 min-w-0">
          {/* App name */}
          <h3 className="text-lg font-black text-black mb-1 uppercase tracking-tight">
            {app.name}
          </h3>

          {/* Teaser text + see more link */}
          <p className="text-sm text-black font-medium mb-2">
            {app.teaser}{' '}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="underline font-black text-black hover:bg-yellow-200"
            >
              see more...
            </button>
          </p>

          {/* Expandable full description */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isExpanded ? 'auto' : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-black mb-2 border-t-2 border-black pt-2 mt-2">
              {app.fullDescription}
            </p>
          </motion.div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs font-black text-black uppercase tracking-tight mt-2">
            <span className="bg-black text-white px-2 py-1">{app.category}</span>
            <span className="bg-yellow-300 text-black px-2 py-1">{app.size}</span>
            {(app as any).downloadsCount !== undefined && (
              <span className="bg-green-300 text-black px-2 py-1 border border-black shadow-[1px_1px_0px_0px_#000000]">
                {(app as any).downloadsCount} Downloads
              </span>
            )}
            {(app as any).reviewsCount !== undefined && (
              <span className="bg-blue-300 text-black px-2 py-1 border border-black shadow-[1px_1px_0px_0px_#000000]">
                {(app as any).reviewsCount} Reviews
              </span>
            )}
            {(app as any).averageRating !== undefined && (app as any).reviewsCount > 0 && (
              <span className="bg-yellow-300 text-black px-2 py-1 border border-black shadow-[1px_1px_0px_0px_#000000]">
                ★ {(app as any).averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
