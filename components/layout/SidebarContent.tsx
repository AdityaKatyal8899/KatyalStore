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
          className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white border-4 border-black p-8 w-full max-w-md shadow-[8px_8px_0px_0px_#000000]"
            initial={{ scale: 0.9, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.9, rotate: 2 }}
            onClick={(e) => e.stopPropagation()}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
          >
            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black text-white p-2 hover:bg-gray-800 transition font-black"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              ✕
            </motion.button>

            {section === 'home' && (
              <div>
                <h2 className="text-3xl font-black text-black mb-4 uppercase tracking-tight">
                  Home
                </h2>
                <p className="text-black font-medium mb-4">
                  Browse and discover amazing apps on KatyalStore. Each app is carefully curated to bring you the best experience.
                </p>
                <div className="bg-orange-100 border-2 border-black p-4">
                  <p className="text-sm font-black text-black uppercase tracking-tight mb-2">
                    Quick Actions
                  </p>
                  <ul className="text-sm text-black font-medium space-y-2">
                    <li>• Search for apps using the search bar</li>
                    <li>• Tap an app to see full details</li>
                    <li>• Download apps directly to your device</li>
                  </ul>
                </div>
              </div>
            )}

            {section === 'downloads' && (
              <div>
                <h2 className="text-3xl font-black text-black mb-4 uppercase tracking-tight">
                  Downloads
                </h2>
                <div className="bg-yellow-100 border-2 border-black p-4 mb-4">
                  <p className="text-sm font-black text-black uppercase tracking-tight">
                    No active downloads
                  </p>
                  <p className="text-sm text-black font-medium mt-2">
                    Your completed and in-progress downloads will appear here.
                  </p>
                </div>
                <div className="bg-white border-2 border-black p-4">
                  <p className="text-xs text-black font-bold uppercase tracking-tight">
                    Download History
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-black font-medium">
                    <li className="bg-gray-100 border border-black p-2">CoWatch - Downloaded</li>
                    <li className="bg-gray-100 border border-black p-2">FetchFlow - Downloaded</li>
                  </ul>
                </div>
              </div>
            )}

            {section === 'account' && (
              <div>
                <h2 className="text-3xl font-black text-black mb-4 uppercase tracking-tight">
                  Account
                </h2>
                {currentUser && (
                  <div className="space-y-4">
                    <div className="bg-yellow-100 border-2 border-black p-4">
                      <p className="text-xs text-black font-black mb-2 uppercase tracking-tight">
                        User Information
                      </p>
                      <p className="text-sm font-bold text-black">{currentUser.name}</p>
                      <p className="text-sm text-gray-600">{currentUser.email}</p>
                    </div>

                    <div className="bg-white border-2 border-black p-4">
                      <p className="text-xs text-black font-black mb-3 uppercase tracking-tight">
                        Account Settings
                      </p>
                      <button className="w-full bg-white border-2 border-black px-4 py-2 text-black font-black uppercase tracking-tight text-sm mb-2 hover:shadow-[4px_4px_0px_0px_#000000] transition-shadow">
                        Edit Profile
                      </button>
                      <button className="w-full bg-white border-2 border-black px-4 py-2 text-black font-black uppercase tracking-tight text-sm hover:shadow-[4px_4px_0px_0px_#000000] transition-shadow">
                        Privacy Settings
                      </button>
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
