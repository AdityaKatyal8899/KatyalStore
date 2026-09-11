'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, FileArchive, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { formatExactSize } from '@/lib/appData';

interface FileUploadZoneProps {
  label: string;
  accept: string;
  fileType: 'apk' | 'icon';
  selectedFile: File | null;
  onFileSelect: (file: File | null, meta: { fileName: string; size: string; detectedVersion?: string }) => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function FileUploadZone({
  label,
  accept,
  fileType,
  selectedFile,
  onFileSelect,
  isUploading = false,
  uploadProgress = 0,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const extractVersion = (filename: string): string | undefined => {
    const match = filename.match(/[vV]?(\d+\.\d+(\.\d+)?)/);
    if (match) {
      return match[0].startsWith('v') || match[0].startsWith('V')
        ? match[0]
        : `v${match[0]}`;
    }
    return undefined;
  };

  const handleProcessFile = (file: File) => {
    const size = formatExactSize(file.size);
    const detectedVersion = extractVersion(file.name);

    onFileSelect(file, {
      fileName: file.name,
      size,
      detectedVersion,
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null, { fileName: '', size: '' });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
          {fileType === 'apk' ? <FileArchive className="w-4 h-4 text-black" /> : <ImageIcon className="w-4 h-4 text-black" />}
          {label}
        </label>
        {fileType === 'apk' && (
          <span className="text-[10px] font-black uppercase bg-yellow-300 border border-black px-1.5 py-0.5 shadow-[1px_1px_0px_0px_#000000]">
            ⚡ Auto-Picks File Name
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-3 border-dashed border-black p-5 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'bg-yellow-200 border-solid shadow-[4px_4px_0px_0px_#000000]'
            : selectedFile
            ? 'bg-orange-50 border-solid shadow-[3px_3px_0px_0px_#000000]'
            : 'bg-white hover:bg-yellow-50 hover:shadow-[3px_3px_0px_0px_#000000]'
        }`}
      >
        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 space-y-2"
            >
              <div className="w-12 h-12 mx-auto bg-yellow-300 border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000000]">
                <UploadCloud className="w-6 h-6 text-black" />
              </div>
              <p className="text-xs sm:text-sm font-black uppercase tracking-tight text-black">
                Drag & Drop {fileType === 'apk' ? 'APK Installer' : 'Icon Image'} here or <span className="underline decoration-2">Browse</span>
              </p>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                {fileType === 'apk'
                  ? 'Supports .apk and raw release binary files'
                  : 'Supports PNG, JPG, WEBP, or SVG icons'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_#000000]">
                <div className="flex items-center gap-3 min-w-0 text-left">
                  <div className="bg-green-400 border border-black p-2 flex-shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                    <CheckCircle2 className="w-5 h-5 text-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-black text-black truncate uppercase tracking-tight">
                      {selectedFile.name}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="bg-yellow-300 border border-black px-1.5 py-0.5 text-[10px] font-black uppercase tracking-tight">
                        {formatExactSize(selectedFile.size)}
                      </span>
                      {extractVersion(selectedFile.name) && (
                        <span className="bg-blue-300 border border-black px-1.5 py-0.5 text-[10px] font-black uppercase tracking-tight flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Detected {extractVersion(selectedFile.name)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 bg-red-400 border border-black hover:bg-red-500 text-black font-black ml-2 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar during upload */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase text-black">
                    <span>Uploading to AWS S3...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 border-2 border-black h-3 overflow-hidden">
                    <motion.div
                      className="bg-green-400 h-full border-r border-black"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.2 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
