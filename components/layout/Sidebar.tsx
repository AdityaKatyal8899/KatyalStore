'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, CloudDownload, User, LogOut, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { InlineLuminanceController } from '@/components/theme/LuminanceSlider';
import Link from 'next/link';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogOut: () => void;
  currentUser?: { name: string; email: string } | null;
}

export function Sidebar({
  isOpen,
  onClose,
  onLogOut,
  currentUser,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'home' | 'downloads' | 'account'>('menu');

  const handleClose = () => {
    setActiveTab('menu');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />

          {/* Sidebar Drawer - Smooth modern slide without bouncy springs */}
          <motion.div
            className="fixed left-0 top-0 h-screen bg-[var(--theme-surface)] text-[var(--theme-text-primary)] border-r-4 border-[var(--theme-border)] z-50 w-84 sm:w-96 max-w-[90vw] overflow-y-auto shadow-[8px_0px_0px_0px_var(--theme-shadow-color)] flex flex-col justify-between"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div>
              {/* Header */}
              <div className="p-6 border-b-4 border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]">
                <div className="flex items-center justify-between mb-4">
                  {activeTab === 'menu' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black uppercase tracking-tight text-[var(--theme-text-primary)]">
                        KatyalStore
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab('menu')}
                      className="flex items-center gap-2 text-sm font-black uppercase text-[var(--theme-text-primary)] hover:underline cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>Back to Menu</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="bg-[var(--theme-surface)] border-2 border-[var(--theme-border)] p-1.5 text-sm font-black px-2.5 cursor-pointer hover:bg-yellow-300 hover:text-black shadow-[2px_2px_0px_0px_var(--theme-shadow-color)] transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {currentUser && (
                  <div className="bg-yellow-300 text-black border-2 border-black p-3.5 shadow-[3px_3px_0px_0px_#000000]">
                    <p className="text-xs font-black uppercase tracking-tight opacity-75">
                      Logged in as
                    </p>
                    <p className="text-base font-black truncate">{currentUser.name}</p>
                    <p className="text-xs font-bold opacity-85 truncate">{currentUser.email}</p>
                  </div>
                )}
              </div>

              {/* Dynamic View Container */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* MAIN MENU TAB */}
                  {activeTab === 'menu' && (
                    <motion.div
                      key="main-menu"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="space-y-5"
                    >
                      {/* Nav Buttons */}
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => setActiveTab('home')}
                          className="w-full flex items-center justify-between bg-[var(--theme-surface-elevated)] text-[var(--theme-text-primary)] border-2 border-[var(--theme-border)] px-4 py-3.5 text-left font-black uppercase tracking-tight text-sm sm:text-base shadow-[3px_3px_0px_0px_var(--theme-shadow-color)] hover:shadow-[4px_4px_0px_0px_var(--theme-shadow-color)] hover:bg-yellow-100 hover:text-black transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-3">
                            <LayoutGrid className="w-5 h-5" />
                            <span>Catalog & Vibe Guide</span>
                          </span>
                          <span className="text-base font-black opacity-60">→</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('downloads')}
                          className="w-full flex items-center justify-between bg-[var(--theme-surface-elevated)] text-[var(--theme-text-primary)] border-2 border-[var(--theme-border)] px-4 py-3.5 text-left font-black uppercase tracking-tight text-sm sm:text-base shadow-[3px_3px_0px_0px_var(--theme-shadow-color)] hover:shadow-[4px_4px_0px_0px_var(--theme-shadow-color)] hover:bg-yellow-100 hover:text-black transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-3">
                            <CloudDownload className="w-5 h-5" />
                            <span>My Downloads</span>
                          </span>
                          <span className="text-base font-black opacity-60">→</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('account')}
                          className="w-full flex items-center justify-between bg-[var(--theme-surface-elevated)] text-[var(--theme-text-primary)] border-2 border-[var(--theme-border)] px-4 py-3.5 text-left font-black uppercase tracking-tight text-sm sm:text-base shadow-[3px_3px_0px_0px_var(--theme-shadow-color)] hover:shadow-[4px_4px_0px_0px_var(--theme-shadow-color)] hover:bg-yellow-100 hover:text-black transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-3">
                            <User className="w-5 h-5" />
                            <span>Account & Owner Hub</span>
                          </span>
                          <span className="text-base font-black opacity-60">→</span>
                        </button>
                      </div>

                      {/* Ambient Luminance Controller */}
                      <div className="pt-2">
                        <InlineLuminanceController />
                      </div>
                    </motion.div>
                  )}

                  {/* HOME / VIBE GUIDE TAB */}
                  {activeTab === 'home' && (
                    <motion.div
                      key="tab-home"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--theme-text-primary)]">
                        Catalog & Vibes
                      </h3>
                      <p className="text-sm font-medium text-[var(--theme-text-secondary)] leading-relaxed">
                        Discover curated utility, streaming, and developer tools designed for speed, security, and reliability.
                      </p>

                      <div className="bg-yellow-100 text-black border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000]">
                        <p className="text-sm font-black uppercase tracking-tight mb-2.5 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          <span>Pro Tips</span>
                        </p>
                        <ul className="text-xs sm:text-sm font-bold space-y-2 leading-snug">
                          <li>• Filter apps by vibes / category tags</li>
                          <li>• Tap any app to read & write live reviews</li>
                          <li>• Switch brightness anytime via the slider</li>
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {/* DOWNLOADS TAB */}
                  {activeTab === 'downloads' && (
                    <motion.div
                      key="tab-downloads"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--theme-text-primary)]">
                        Downloads
                      </h3>

                      <div className="bg-[var(--theme-surface-elevated)] border-2 border-[var(--theme-border)] p-4 shadow-[3px_3px_0px_0px_var(--theme-shadow-color)]">
                        <p className="text-xs font-black uppercase text-[var(--theme-text-secondary)] mb-3">
                          Recent Activity
                        </p>
                        <ul className="space-y-2 text-sm font-bold text-[var(--theme-text-primary)]">
                          <li className="bg-[var(--theme-surface)] border border-[var(--theme-border)] p-2.5 flex items-center justify-between">
                            <span>FetchFlow</span>
                            <span className="text-xs bg-green-300 text-black px-2 py-0.5 border border-black font-black">APK Ready</span>
                          </li>
                          <li className="bg-[var(--theme-surface)] border border-[var(--theme-border)] p-2.5 flex items-center justify-between">
                            <span>CoWatch</span>
                            <span className="text-xs bg-green-300 text-black px-2 py-0.5 border border-black font-black">APK Ready</span>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {/* ACCOUNT TAB */}
                  {activeTab === 'account' && (
                    <motion.div
                      key="tab-account"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--theme-text-primary)]">
                        Account Info
                      </h3>

                      {currentUser && (
                        <div className="bg-[var(--theme-surface-elevated)] border-2 border-[var(--theme-border)] p-4 shadow-[3px_3px_0px_0px_var(--theme-shadow-color)] space-y-3">
                          <div>
                            <span className="text-xs font-black uppercase text-[var(--theme-text-secondary)]">Name</span>
                            <p className="text-base font-black text-[var(--theme-text-primary)]">{currentUser.name}</p>
                          </div>
                          <div>
                            <span className="text-xs font-black uppercase text-[var(--theme-text-secondary)]">Email</span>
                            <p className="text-sm font-bold text-[var(--theme-text-secondary)]">{currentUser.email}</p>
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <Link
                          href="/dashboard"
                          onClick={handleClose}
                          className="w-full bg-yellow-300 text-black border-2 border-black px-4 py-3 font-black uppercase tracking-tight text-sm shadow-[3px_3px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center gap-2 transition-shadow"
                        >
                          <ShieldCheck className="w-4.5 h-4.5" />
                          <span>Open Owner Dashboard</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Section: Log Out */}
            <div className="p-6 border-t-4 border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]">
              <button
                type="button"
                onClick={onLogOut}
                className="w-full flex items-center justify-center gap-2 bg-red-400 border-2 border-black px-4 py-3 text-black font-black uppercase tracking-tight text-sm sm:text-base shadow-[3px_3px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] transition-shadow cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
