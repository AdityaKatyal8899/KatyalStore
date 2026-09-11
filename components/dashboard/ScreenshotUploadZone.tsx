'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, X, Plus, Sparkles, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface ScreenshotUploadZoneProps {
  screenshots: string[];
  onChange: (screenshots: string[]) => void;
  appId?: string;
  version?: string;
  onUploadFile?: (file: File) => Promise<string>;
}

export function ScreenshotUploadZone({
  screenshots,
  onChange,
  appId,
  version,
  onUploadFile,
}: ScreenshotUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/') || /\.(png|jpg|jpeg|webp|svg)$/i.test(file.name)
    );

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    for (const file of validFiles) {
      try {
        if (onUploadFile) {
          const url = await onUploadFile(file);
          if (url) newUrls.push(url);
        } else {
          // Default upload via /api/admin/upload with app/version hierarchy
          const formData = new FormData();
          formData.append('file', file);
          if (appId) formData.append('appId', appId);
          if (version) formData.append('version', version);
          formData.append('folder', 'screenshots');
          formData.append('type', 'screenshots');
          formData.append('customName', `screenshot-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);

          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            const url = data.url || data.s3Url || data.iconUrl || `/screenshots/${data.fileName}`;
            if (url) newUrls.push(url);
          }
        }
      } catch (err) {
        console.error('Error uploading screenshot:', err);
      }
    }

    if (newUrls.length > 0) {
      onChange([...screenshots, ...newUrls]);
    }
    setIsUploading(false);
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = screenshots.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-black" />
          <span>App UI Screenshots Showcase</span>
        </label>
        <span className="bg-yellow-300 border border-black px-2 py-0.5 text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000000]">
          {screenshots.length} {screenshots.length === 1 ? 'Screenshot' : 'Screenshots'}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
        className="hidden"
      />

      {/* Grid of uploaded screenshots + Add More box */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <AnimatePresence>
          {screenshots.map((url, index) => (
            <motion.div
              key={`${url}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative bg-white border-3 border-black aspect-[9/16] sm:aspect-[3/4] shadow-[3px_3px_0px_0px_#000000] overflow-hidden"
            >
              <Image
                src={url}
                alt={`Screenshot ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Index pill */}
              <div className="absolute top-1.5 left-1.5 bg-black text-white px-1.5 py-0.5 text-[10px] font-black uppercase border border-black shadow-[1px_1px_0px_0px_#000000]">
                #{index + 1}
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1.5 right-1.5 bg-red-400 border-2 border-black p-1 text-black hover:bg-red-500 shadow-[2px_2px_0px_0px_#000000] transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                title="Remove screenshot"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Upload Trigger Tile */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          className={`border-3 border-dashed border-black aspect-[9/16] sm:aspect-[3/4] p-3 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragOver
              ? 'bg-yellow-200 border-solid shadow-[4px_4px_0px_0px_#000000]'
              : 'bg-white hover:bg-yellow-50 hover:shadow-[3px_3px_0px_0px_#000000]'
          }`}
        >
          {isUploading ? (
            <div className="space-y-2">
              <RefreshCw className="w-6 h-6 text-black animate-spin mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-tight text-black">
                Uploading...
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-9 h-9 mx-auto bg-yellow-300 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                <Plus className="w-5 h-5 text-black" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-tight text-black">
                Add Screenshots
              </p>
              <p className="text-[9px] font-bold text-gray-500 uppercase">
                PNG, JPG, WEBP
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
