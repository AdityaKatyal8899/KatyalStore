'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, onChange, interactive = true, size = 'md' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>(value.toString());

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleStarClick = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newValue = index + percent;
    const roundedValue = Math.round(newValue * 2) / 2;

    onChange(Math.max(0, Math.min(5, roundedValue)));
    setInputValue(roundedValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange(Math.max(0, Math.min(5, num)));
    }
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const fillPercentage = Math.max(0, Math.min(1, displayValue - index));

          return (
            <motion.div
              key={index}
              className={`relative ${sizeClasses[size]} ${interactive ? 'cursor-pointer' : ''}`}
              onClick={interactive ? (e) => handleStarClick(index, e as any) : undefined}
              onMouseEnter={interactive ? () => setHoverValue(index + 1) : undefined}
              onMouseLeave={interactive ? () => setHoverValue(null) : undefined}
              whileHover={interactive ? { scale: 1.1 } : {}}
            >
              <Star
                className={`${sizeClasses[size]} absolute text-gray-300 border border-black`}
                strokeWidth={2}
              />

              <motion.div
                className="absolute overflow-hidden"
                style={{ width: `${fillPercentage * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${fillPercentage * 100}%` }}
                transition={{ duration: 0.2 }}
              >
                <Star
                  className={`${sizeClasses[size]} text-black fill-black border border-black`}
                  strokeWidth={2}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {interactive && (
        <input
          type="number"
          min="0"
          max="5"
          step="0.5"
          value={inputValue}
          onChange={handleInputChange}
          className="w-16 border-2 border-black bg-white px-2 py-1 text-black font-bold text-center focus:outline-none focus:bg-orange-50"
        />
      )}

      {!interactive && (
        <span className="text-sm font-bold text-black">{value.toFixed(1)}/5</span>
      )}
    </div>
  );
}
