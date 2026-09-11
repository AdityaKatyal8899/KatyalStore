
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';
import Link from 'next/link';

interface OwnerGatekeeperProps {
  onAuthenticated: (ownerData: { name: string; email: string }) => void;
}

export function OwnerGatekeeper({ onAuthenticated }: OwnerGatekeeperProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your owner email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (codeSent && !code.trim()) {
      setError('Please enter the 6-digit security code');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = codeSent
        ? { email: email.trim(), name: name.trim() || 'Store Owner', code: code.trim() }
        : { email: email.trim(), name: name.trim() || 'Store Owner' };

      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.codeSent) {
          setCodeSent(true);
        } else {
          onAuthenticated(data.user);
          setIsVisible(false);
        }
      } else {
        setError(data.error || 'Access denied or verification failed');
      }
    } catch (err) {
      console.error('[KatyalStore Owner Gatekeeper] Auth error:', err);
      setError('Server connection failed. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-[#FDFBF7] border-4 border-black p-6 sm:p-8 w-full max-w-md shadow-[10px_10px_0px_0px_#000000] relative"
            initial={{ scale: 0.9, rotate: -1 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.9, rotate: 1 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 350 }}
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b-4 border-black">
              <div className="flex items-center gap-2">
                <span className="bg-yellow-300 border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_#000000]">
                  <ShieldCheck className="w-5 h-5 text-black" />
                </span>
                <span className="font-black uppercase tracking-tight text-sm text-black">
                  Store Management
                </span>
              </div>
              <span className="bg-red-400 border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase text-black tracking-wider">
                Owner Only
              </span>
            </div>

            <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-1">
              Owner Portal
            </h1>
            <p className="text-black text-xs font-bold mb-6 uppercase tracking-tight text-gray-700">
              {codeSent
                ? 'Check your inbox for the 6-digit access code'
                : 'Enter your owner email to unlock administration rights'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!codeSent ? (
                <>
                  <div>
                    <label className="block text-black text-xs font-black mb-1 uppercase tracking-wider">
                      Owner Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Example Name"
                      className="w-full bg-white border-2 border-black px-4 py-2.5 text-black placeholder-gray-400 focus:outline-none focus:bg-yellow-100 font-bold text-sm transition"
                    />
                  </div>

                  <div>
                    <label className="block text-black text-xs font-black mb-1 uppercase tracking-wider">
                      Owner Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full bg-white border-2 border-black px-4 py-2.5 text-black placeholder-gray-400 focus:outline-none focus:bg-yellow-100 font-bold text-sm transition"
                        autoFocus
                      />
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="bg-yellow-100 border-2 border-black p-3 text-xs font-bold text-black flex items-center justify-between">
                    <span className="truncate">Email: {email}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCodeSent(false);
                        setCode('');
                        setError('');
                      }}
                      className="text-[10px] font-black underline uppercase text-black ml-2 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-black text-xs font-black mb-1 uppercase tracking-wider">
                      Enter 6-Digit OTP Passcode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full bg-white border-3 border-black px-4 py-3 text-black focus:outline-none focus:bg-yellow-200 font-black text-center tracking-[8px] text-2xl transition"
                      autoFocus
                    />
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  className="bg-red-300 border-2 border-black p-3 text-xs font-black text-black uppercase tracking-tight"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  ⚠️ {error}
                </motion.div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white font-black py-3 px-4 uppercase tracking-tight text-sm border-4 border-black hover:bg-yellow-300 hover:text-black hover:shadow-[6px_6px_0px_0px_#000000] active:shadow-[2px_2px_0px_0px_#000000] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Authenticating...'
                  ) : codeSent ? (
                    <>
                      <KeyRound className="w-4 h-4" /> Verify Passcode & Enter
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" /> Send Access Code
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/"
                    className="text-xs font-black uppercase text-black hover:underline inline-flex items-center gap-1"
                  >
                    ← Back to KatyalStore Main Catalog
                  </Link>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
