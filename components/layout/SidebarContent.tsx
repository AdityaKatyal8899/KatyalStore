'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface SidebarContentProps {
  section: 'home' | 'downloads' | 'account' | null;
  onClose: () => void;
  currentUser?: { name: string; email: string } | null;
}

export function SidebarContent({ section, onClose, currentUser }: SidebarContentProps) {
  return (
    <AnimatePresence>
      {section && (
        <motion.div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)] border-4 border-[var(--theme-border)] p-8 w-full max-w-md shadow-[8px_8px_0px_0px_var(--theme-shadow-color)] relative"
            initial={{ scale: 0.9, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.9, rotate: 2 }}
            onClick={(e) => e.stopPropagation()}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
          >
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 bg-[var(--theme-surface-elevated)] text-[var(--theme-text-primary)] border-2 border-[var(--theme-border)] p-2 hover:bg-yellow-300 hover:text-black transition font-black cursor-pointer shadow-[2px_2px_0px_0px_var(--theme-shadow-color)]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              ✕
            </motion.button>

            {section === 'home' && (
              <div>
                <h2 className="text-3xl font-black mb-4 uppercase tracking-tight text-[var(--theme-text-primary)]">
                  Home
                </h2>
                <p className="font-medium mb-4 text-[var(--theme-text-secondary)]">
                  Browse and discover amazing apps on KatyalStore. Each app is carefully curated to bring you the best experience.
                </p>
                <div className="bg-orange-100/90 text-black border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000]">
                  <p className="text-sm font-black uppercase tracking-tight mb-2">
                    Quick Actions
                  </p>
                  <ul className="text-sm font-bold space-y-2">
                    <li>• Search for apps using the search bar</li>
                    <li>• Tap an app to see full details & reviews</li>
                    <li>• Adjust brightness anytime using the Lightness Slider</li>
                  </ul>
                </div>
              </div>
            )}

            {section === 'downloads' && (
              <div>
                <h2 className="text-3xl font-black mb-4 uppercase tracking-tight text-[var(--theme-text-primary)]">
                  Downloads
                </h2>
                <div className="bg-yellow-100 text-black border-2 border-black p-4 mb-4 shadow-[3px_3px_0px_0px_#000000]">
                  <p className="text-sm font-black uppercase tracking-tight">
                    No active downloads
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Your completed and in-progress downloads will appear here.
                  </p>
                </div>
                <div className="bg-[var(--theme-surface-elevated)] border-2 border-[var(--theme-border)] p-4">
                  <p className="text-xs font-bold uppercase tracking-tight text-[var(--theme-text-primary)]">
                    Download History
                  </p>
                  <ul className="mt-3 space-y-2 text-sm font-medium text-[var(--theme-text-secondary)]">
                    <li className="bg-[var(--theme-surface)] border border-[var(--theme-border)] p-2">CoWatch - Downloaded</li>
                    <li className="bg-[var(--theme-surface)] border border-[var(--theme-border)] p-2">FetchFlow - Downloaded</li>
                  </ul>
                </div>
              </div>
            )}

            {section === 'account' && (
              <div>
                <h2 className="text-3xl font-black mb-4 uppercase tracking-tight text-[var(--theme-text-primary)]">
                  Account
                </h2>
                {currentUser && (
                  <div className="space-y-4">
                    <div className="bg-yellow-300 text-black border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000]">
                      <p className="text-xs font-black mb-1 uppercase tracking-tight">
                        User Information
                      </p>
                      <p className="text-base font-black">{currentUser.name}</p>
                      <p className="text-xs font-bold opacity-85">{currentUser.email}</p>
                    </div>

                    <div className="bg-[var(--theme-surface-elevated)] border-2 border-[var(--theme-border)] p-4 shadow-[3px_3px_0px_0px_var(--theme-shadow-color)]">
                      <p className="text-xs font-black mb-3 uppercase tracking-tight text-[var(--theme-text-primary)]">
                        Store Management
                      </p>
                      <a
                        href="/dashboard"
                        className="w-full bg-yellow-300 border-2 border-black px-4 py-2.5 text-black font-black uppercase tracking-tight text-sm hover:shadow-[4px_4px_0px_0px_#000000] transition-shadow flex items-center justify-center gap-2 block text-center"
                      >
                        👑 Owner Dashboard
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
