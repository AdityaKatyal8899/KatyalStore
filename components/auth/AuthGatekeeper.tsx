'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AuthGatekeeperProps {
  onAuthenticated: (userData: { name: string; email: string }) => void;
}

export function AuthGatekeeper({ onAuthenticated }: AuthGatekeeperProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onAuthenticated(data.user);
        setIsVisible(false);
      } else {
        setError(data.error || 'Failed to authenticate');
      }
    } catch (err) {
      console.error('[KatyalStore] Auth error:', err);
      setError('Connection failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-[#FDFBF7]/80 backdrop-blur-md flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white border-4 border-black p-8 w-full max-w-sm shadow-[8px_8px_0px_0px_#000000]"
            initial={{ scale: 0.9, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.9, rotate: 2 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 400 }}
          >
            <h1 className="text-4xl font-black text-black mb-1">KatyalStore</h1>
            <p className="text-black text-sm font-bold mb-8 uppercase tracking-tight">Enter the store</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-black text-sm font-black mb-2 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full bg-white border-2 border-black px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:bg-yellow-100 font-medium transition"
                />
              </div>

              <div>
                <label className="block text-black text-sm font-black mb-2 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-white border-2 border-black px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:bg-yellow-100 font-medium transition"
                />
              </div>

              {error && (
                <motion.p
                  className="text-black text-sm font-bold bg-red-300 border-2 border-black p-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white font-black py-3 uppercase tracking-tight text-sm border-4 border-black hover:shadow-[6px_6px_0px_0px_#000000] active:shadow-[2px_2px_0px_0px_#000000] transition-shadow disabled:opacity-55"
              >
                {isSubmitting ? 'Entering Store...' : 'Enter Store'}
              </button>
            </form>

            <p className="text-black text-xs text-center mt-6 font-bold">
              DISCOVER AMAZING APPS
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
