'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Upload,
  PlusCircle,
  Sparkles,
  ArrowLeft,
  LogOut,
  RefreshCw,
  FileArchive,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FolderSync,
  Image as ImageIcon,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
} from 'lucide-react';
import { OwnerGatekeeper } from '@/components/dashboard/OwnerGatekeeper';
import { FileUploadZone } from '@/components/dashboard/FileUploadZone';
import { ScreenshotUploadZone } from '@/components/dashboard/ScreenshotUploadZone';
import { NeoSelect } from '@/components/ui/NeoSelect';
import { App } from '@/lib/appData';

export default function OwnerDashboardPage() {
  const router = useRouter();

  // Authentication states
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [ownerUser, setOwnerUser] = useState<{ name: string; email: string } | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'update' | 'publish' | 'inventory'>('update');

  // Apps inventory
  const [apps, setApps] = useState<App[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [stats, setStats] = useState({ totalDownloads: 0, totalReviews: 0 });

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDeleteApp, setConfirmDeleteApp] = useState<App | null>(null);

  // Lightbox Preview Modal for Dashboard Catalog
  const [previewLightbox, setPreviewLightbox] = useState<{
    appName: string;
    screenshots: string[];
    activeIdx: number;
  } | null>(null);

  // --- FORM STATES: PUSH UPDATE ---
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [updateFileName, setUpdateFileName] = useState<string>('');
  const [updateFileSize, setUpdateFileSize] = useState<string>('');
  const [updateVersion, setUpdateVersion] = useState<string>('');
  const [updateReleaseNotes, setUpdateReleaseNotes] = useState<string>('');
  const [updateScreenshots, setUpdateScreenshots] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateProgress, setUpdateProgress] = useState<number>(0);

  // --- FORM STATES: PUBLISH NEW APP ---
  const [newName, setNewName] = useState<string>('');
  const [newId, setNewId] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Developer Tools');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [newTeaser, setNewTeaser] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newVersion, setNewVersion] = useState<string>('v1.0.0');
  const [newReleaseNotes, setNewReleaseNotes] = useState<string>('Initial store release');
  const [newScreenshots, setNewScreenshots] = useState<string[]>([]);
  
  // Icon file or URL
  const [newIconFile, setNewIconFile] = useState<File | null>(null);
  const [newIconUrl, setNewIconUrl] = useState<string>('/placeholder-logo.png');

  // APK file
  const [newApkFile, setNewApkFile] = useState<File | null>(null);
  const [newApkFileName, setNewApkFileName] = useState<string>('');
  const [newApkFileSize, setNewApkFileSize] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<number>(0);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Check stored owner session on mount
  useEffect(() => {
    const saved = localStorage.getItem('katyalstore_owner');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOwnerUser(parsed);
        setIsOwnerAuthenticated(true);
      } catch (e) {
        console.error('Error loading stored owner user:', e);
      }
    }
  }, []);

  // Fetch applications list
  const fetchApps = async () => {
    setIsLoadingApps(true);
    try {
      const res = await fetch('/api/admin/apps');
      if (res.ok) {
        const data = await res.json();
        setApps(data);
        if (data.length > 0 && !selectedAppId) {
          setSelectedAppId(data[0].id || data[0].appId);
        }
      }
      
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (e) {
      console.error('[KatyalStore Dashboard] Error loading apps:', e);
      showToast('Failed to load apps list', 'error');
    } finally {
      setIsLoadingApps(false);
    }
  };

  useEffect(() => {
    if (isOwnerAuthenticated) {
      fetchApps();
    }
  }, [isOwnerAuthenticated]);

  // Sync screenshots when selectedAppId changes
  useEffect(() => {
    const chosen = apps.find((a) => (a.id || (a as any).appId) === selectedAppId);
    if (chosen) {
      setUpdateScreenshots(chosen.screenshots || []);
    }
  }, [selectedAppId, apps]);

  // Lightbox keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewLightbox) return;
      if (e.key === 'Escape') {
        setPreviewLightbox(null);
      } else if (e.key === 'ArrowRight') {
        setPreviewLightbox((prev) =>
          prev
            ? {
                ...prev,
                activeIdx: prev.activeIdx < prev.screenshots.length - 1 ? prev.activeIdx + 1 : 0,
              }
            : null
        );
      } else if (e.key === 'ArrowLeft') {
        setPreviewLightbox((prev) =>
          prev
            ? {
                ...prev,
                activeIdx: prev.activeIdx > 0 ? prev.activeIdx - 1 : prev.screenshots.length - 1,
              }
            : null
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewLightbox]);

  const handleAuthenticated = (user: { name: string; email: string }) => {
    setOwnerUser(user);
    setIsOwnerAuthenticated(true);
    localStorage.setItem('katyalstore_owner', JSON.stringify(user));
    showToast(`Welcome to Owner Dashboard, ${user.name}!`, 'success');
  };

  const handleLogOut = () => {
    setIsOwnerAuthenticated(false);
    setOwnerUser(null);
    localStorage.removeItem('katyalstore_owner');
    router.push('/');
  };

  // Helper to upload file (either direct S3 presigned or server multipart)
  const uploadFileToStorage = async (
    file: File,
    onProgress: (pct: number) => void,
    meta?: { appId?: string; appName?: string; version?: string; folder?: string; type?: string }
  ): Promise<{ fileName: string; s3Key: string; size: string; iconUrl?: string }> => {
    onProgress(15);

    const isImage = file.type.startsWith('image/') || /\.(png|jpg|jpeg|webp|svg)$/i.test(file.name);
    const targetType = meta?.type || (isImage ? 'icon' : 'apk');
    const targetAppId = meta?.appId || meta?.appName || selectedAppId || 'general';
    const targetVersion = meta?.version || updateVersion || 'v1.0.0';

    // 1. First attempt direct S3 Presigned URL upload
    try {
      const qParams = new URLSearchParams({
        fileName: file.name,
        appId: targetAppId,
        version: targetVersion,
        type: targetType,
        contentType: file.type || (isImage ? 'image/png' : 'application/vnd.android.package-archive'),
      });

      const presignRes = await fetch(`/api/admin/upload?${qParams.toString()}`);
      if (presignRes.ok) {
        const { uploadUrl, key, fileName, s3Url } = await presignRes.json();
        if (uploadUrl) {
          onProgress(40);
          const s3UploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || (isImage ? 'image/png' : 'application/vnd.android.package-archive'),
            },
            body: file,
          });

          if (s3UploadRes.ok) {
            onProgress(100);
            const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
            return {
              fileName,
              s3Key: key,
              size: sizeMb,
              iconUrl: isImage ? s3Url : undefined,
            };
          }
        }
      }
    } catch (s3PresignError) {
      console.warn('[Dashboard Upload] S3 Direct Presigned PUT failed, falling back to server upload:', s3PresignError);
    }

    // 2. Fallback to server-side multipart upload
    onProgress(50);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customName', file.name);
    formData.append('appId', targetAppId);
    formData.append('version', targetVersion);
    formData.append('type', targetType);

    const uploadRes = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    onProgress(90);
    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      throw new Error(errorData.error || 'File upload failed');
    }

    const uploadData = await uploadRes.json();
    onProgress(100);
    return {
      fileName: uploadData.fileName,
      s3Key: uploadData.key || uploadData.s3Key,
      size: uploadData.size,
      iconUrl: uploadData.url || uploadData.iconUrl,
    };
  };

  // --- SUBMIT: PUSH AN UPDATE ---
  const handlePushUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) {
      showToast('Please select an application to update', 'error');
      return;
    }

    if (!updateFile && !updateVersion && !updateReleaseNotes) {
      showToast('Please select a new APK file or update version details', 'error');
      return;
    }

    setIsUpdating(true);
    setUpdateProgress(10);

    try {
      let finalFileName = updateFileName;
      let finalS3Key = updateFileName;
      let finalSize = updateFileSize;

      // If a new APK file is attached, upload it to S3 under app/version/apk/ !
      if (updateFile) {
        const uploadResult = await uploadFileToStorage(updateFile, (pct) => setUpdateProgress(pct), {
          appId: selectedAppId,
          version: updateVersion || 'v1.0.0',
          type: 'apk',
        });
        finalFileName = uploadResult.fileName;
        finalS3Key = uploadResult.s3Key;
        finalSize = uploadResult.size;
      }

      // Update application in MongoDB
      const payload: Record<string, any> = {
        id: selectedAppId,
        ownerEmail: ownerUser?.email,
        screenshots: updateScreenshots,
      };

      if (updateFile) {
        payload.fileName = finalFileName;
        payload.s3Key = finalS3Key;
        payload.size = finalSize;
      }

      if (updateVersion.trim()) {
        payload.version = updateVersion.trim();
      }

      if (updateReleaseNotes.trim()) {
        payload.releaseNotes = updateReleaseNotes.trim();
      }

      const res = await fetch('/api/admin/apps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(`🎉 Version update successfully pushed for '${selectedAppId}'!`, 'success');
        setUpdateFile(null);
        setUpdateFileName('');
        setUpdateFileSize('');
        setUpdateVersion('');
        setUpdateReleaseNotes('');
        await fetchApps();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to update app', 'error');
      }
    } catch (err: any) {
      console.error('[KatyalStore] Update error:', err);
      showToast(err.message || 'Error pushing app update', 'error');
    } finally {
      setIsUpdating(false);
      setUpdateProgress(0);
    }
  };

  // --- SUBMIT: PUBLISH NEW APPLICATION ---
  const handlePublishNewApp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newTeaser.trim() || !newDescription.trim() || !newApkFile) {
      showToast('Please complete all required fields and upload an APK file', 'error');
      return;
    }

    setIsPublishing(true);
    setPublishProgress(10);

    try {
      const appSlug = (newId || newName.toLowerCase().replace(/[^a-z0-9]/g, '-')).trim();

      // 1. Upload Icon if custom icon file provided
      let finalIconUrl = newIconUrl;
      if (newIconFile) {
        const iconUpload = await uploadFileToStorage(newIconFile, () => {}, {
          appId: appSlug,
          version: newVersion || 'v1.0.0',
          type: 'icon',
        });
        finalIconUrl = iconUpload.iconUrl || `/icons/${iconUpload.fileName}`;
      }

      // 2. Upload APK installer to S3 under appSlug/version/apk/
      const apkUpload = await uploadFileToStorage(newApkFile, (pct) => setPublishProgress(pct), {
        appId: appSlug,
        version: newVersion || 'v1.0.0',
        type: 'apk',
      });

      // 3. Register Application Document in MongoDB
      const payload = {
        name: newName.trim(),
        id: appSlug,
        category: (customCategory.trim() || newCategory).trim(),
        teaser: newTeaser.trim(),
        fullDescription: newDescription.trim(),
        version: newVersion.trim() || 'v1.0.0',
        releaseNotes: newReleaseNotes.trim(),
        icon: finalIconUrl,
        screenshots: newScreenshots,
        fileName: apkUpload.fileName,
        s3Key: apkUpload.s3Key,
        size: apkUpload.size,
        ownerEmail: ownerUser?.email,
      };

      const res = await fetch('/api/admin/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(`✨ '${newName}' is now live on KatyalStore catalog!`, 'success');
        // Reset form
        setNewName('');
        setNewId('');
        setNewTeaser('');
        setNewDescription('');
        setNewVersion('v1.0.0');
        setNewReleaseNotes('Initial store release');
        setNewIconFile(null);
        setNewIconUrl('/placeholder-logo.png');
        setNewApkFile(null);
        setNewApkFileName('');
        setNewApkFileSize('');
        await fetchApps();
        setActiveTab('inventory');
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to publish new app', 'error');
      }
    } catch (err: any) {
      console.error('[KatyalStore] Publish error:', err);
      showToast(err.message || 'Error publishing application', 'error');
    } finally {
      setIsPublishing(false);
      setPublishProgress(0);
    }
  };

  // --- DELETE APPLICATION ---
  const handleDeleteApp = async (appId: string) => {
    try {
      const res = await fetch(`/api/admin/apps?id=${encodeURIComponent(appId)}&ownerEmail=${encodeURIComponent(ownerUser?.email || '')}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast(`Application '${appId}' removed from catalog`, 'success');
        setConfirmDeleteApp(null);
        await fetchApps();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to delete app', 'error');
      }
    } catch (e) {
      console.error('Delete error:', e);
      showToast('Error removing application', 'error');
    }
  };

  const selectedApp = apps.find((a) => (a.id || (a as any).appId) === selectedAppId);

  return (
    <>
      {/* Protect Route with Owner Gatekeeper */}
      {!isOwnerAuthenticated && (
        <OwnerGatekeeper onAuthenticated={handleAuthenticated} />
      )}

      {isOwnerAuthenticated && (
        <div className="min-h-screen bg-[#FDFBF7] text-black pb-32">
          {/* Top Owner Header */}
          <header className="border-b-4 border-black bg-white sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black hover:opacity-80"
                >
                  Katyal<span className="bg-yellow-300 px-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">Store</span>
                </Link>
                <span className="bg-black text-yellow-300 font-black px-2 py-0.5 text-xs uppercase tracking-wider">
                  Owner Dashboard
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-yellow-100 border-2 border-black px-3 py-1 text-xs font-black uppercase">
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>{ownerUser?.name || 'Store Owner'}</span>
                </div>

                <Link
                  href="/"
                  className="bg-white border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-tight hover:shadow-[3px_3px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-shadow flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Store Catalog</span>
                </Link>

                <button
                  onClick={handleLogOut}
                  className="bg-red-400 border-2 border-black px-3 py-1.5 text-xs font-black uppercase tracking-tight hover:shadow-[3px_3px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
            {/* Live Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000000]">
                <p className="text-xs font-black uppercase tracking-wider text-gray-600">📦 Total Live Apps</p>
                <p className="text-3xl font-black uppercase mt-1">{apps.length} Apps</p>
              </div>
              <div className="bg-green-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000000]">
                <p className="text-xs font-black uppercase tracking-wider text-black">📥 Global Downloads</p>
                <p className="text-3xl font-black uppercase mt-1">{stats.totalDownloads}</p>
              </div>
              <div className="bg-blue-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000000]">
                <p className="text-xs font-black uppercase tracking-wider text-black">💬 Community Reviews</p>
                <p className="text-3xl font-black uppercase mt-1">{stats.totalReviews}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b-4 border-black pb-0 mb-8">
              <button
                onClick={() => setActiveTab('update')}
                className={`px-5 py-3 font-black text-xs sm:text-sm uppercase tracking-tight border-t-4 border-l-4 border-r-4 border-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'update'
                    ? 'bg-yellow-300 -mb-1 pb-4 shadow-[4px_-4px_0px_0px_#000000]'
                    : 'bg-white hover:bg-yellow-100'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>1. Push an Update</span>
              </button>

              <button
                onClick={() => setActiveTab('publish')}
                className={`px-5 py-3 font-black text-xs sm:text-sm uppercase tracking-tight border-t-4 border-l-4 border-r-4 border-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'publish'
                    ? 'bg-yellow-300 -mb-1 pb-4 shadow-[4px_-4px_0px_0px_#000000]'
                    : 'bg-white hover:bg-yellow-100'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>2. Publish New Application</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-5 py-3 font-black text-xs sm:text-sm uppercase tracking-tight border-t-4 border-l-4 border-r-4 border-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-yellow-300 -mb-1 pb-4 shadow-[4px_-4px_0px_0px_#000000]'
                    : 'bg-white hover:bg-yellow-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>3. Catalog & Inventory</span>
              </button>
            </div>

            {/* Tab Panels with Smooth Transitions */}
            <AnimatePresence mode="wait">
              {/* TAB 1: PUSH AN UPDATE */}
              {activeTab === 'update' && (
                <motion.div
                  key="tab-update"
                  initial={{ opacity: 0, y: 15, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.99 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                >
                  {/* Left Form: Version Upload Details */}
                  <div className="lg:col-span-7 bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000]">
                    <div className="border-b-4 border-black pb-4 mb-6">
                      <span className="bg-yellow-300 border-2 border-black px-2 py-0.5 text-[11px] font-black uppercase tracking-wider">
                        Dynamic Deployment
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-2">
                        Push Application Update
                      </h2>
                      <p className="text-xs font-bold uppercase tracking-tight text-gray-600 mt-1">
                        Upload the new version APK. The file name and size are auto-detected and linked to S3.
                      </p>
                    </div>

                    <form onSubmit={handlePushUpdate} className="space-y-6">
                      {/* App Selector */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider mb-2">
                          Select Application to Update *
                        </label>
                        <NeoSelect
                          value={selectedAppId}
                          onChange={(val) => {
                            setSelectedAppId(val);
                            const chosen = apps.find((a) => (a.id || (a as any).appId) === val);
                            if (chosen?.version) {
                              setUpdateVersion(chosen.version);
                            }
                          }}
                          options={apps.map((app) => ({
                            value: app.id || (app as any).appId,
                            label: app.name,
                            subLabel: `${app.category} • ${(app as any).downloadsCount || 0} Downloads`,
                            icon: app.icon,
                            badge: app.version || 'v1.0.0',
                          }))}
                          placeholder="Select an application..."
                        />
                      </div>

                      {/* Drag-and-drop APK upload zone */}
                      <FileUploadZone
                        label="Upload New Version APK"
                        accept=".apk,application/vnd.android.package-archive"
                        fileType="apk"
                        selectedFile={updateFile}
                        onFileSelect={(file, meta) => {
                          setUpdateFile(file);
                          setUpdateFileName(meta.fileName);
                          setUpdateFileSize(meta.size);
                          if (meta.detectedVersion) {
                            setUpdateVersion(meta.detectedVersion);
                          }
                        }}
                        isUploading={isUpdating}
                        uploadProgress={updateProgress}
                      />

                      {/* Version String Input */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider mb-1">
                            Release Version String
                          </label>
                          <input
                            type="text"
                            value={updateVersion}
                            onChange={(e) => setUpdateVersion(e.target.value)}
                            placeholder="e.g. v1.0.2"
                            className="w-full bg-white border-2 border-black px-4 py-2.5 font-bold text-sm focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider mb-1">
                            Target S3 Filename (Auto-Picked)
                          </label>
                          <input
                            type="text"
                            disabled
                            value={updateFileName || selectedApp?.fileName || selectedApp?.s3Key || 'Auto-detected on drop'}
                            className="w-full bg-gray-100 border-2 border-black px-4 py-2.5 font-mono text-xs font-bold text-gray-700 shadow-[2px_2px_0px_0px_#000000]"
                          />
                        </div>
                      </div>

                      {/* Release Notes */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider mb-1">
                          Changelog / Release Highlights (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={updateReleaseNotes}
                          onChange={(e) => setUpdateReleaseNotes(e.target.value)}
                          placeholder="What's new in this release? (e.g. Fixed audio latency, optimized UI...)"
                          className="w-full bg-white border-2 border-black px-4 py-2.5 font-bold text-sm focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000]"
                        />
                      </div>

                      {/* Screenshots Showcase Manager */}
                      <div className="bg-yellow-50 border-2 border-black p-4 shadow-[2px_2px_0px_0px_#000000]">
                        <ScreenshotUploadZone
                          screenshots={updateScreenshots}
                          onChange={setUpdateScreenshots}
                          appId={selectedAppId}
                          version={updateVersion || 'v1.0.0'}
                        />
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={isUpdating || isLoadingApps}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-black text-white font-black py-4 px-6 uppercase tracking-tight text-sm border-4 border-black hover:bg-yellow-300 hover:text-black hover:shadow-[6px_6px_0px_0px_#000000] active:shadow-[2px_2px_0px_0px_#000000] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isUpdating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Uploading & Deploying to S3 ({updateProgress}%)...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Deploy Version Update to KatyalStore</span>
                          </>
                        )}
                      </motion.button>
                    </form>
                  </div>

                  {/* Right Side: Selected App Current Live State */}
                  <div className="lg:col-span-5 space-y-6">
                    {selectedApp && (
                      <div className="bg-yellow-300 border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000000]">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                            Currently Live
                          </span>
                          <span className="bg-white border border-black px-2 py-0.5 text-[10px] font-black uppercase">
                            {selectedApp.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-white border-3 border-black w-16 h-16 relative p-2 shadow-[2px_2px_0px_0px_#000000]">
                            <Image
                              src={selectedApp.icon || '/placeholder-logo.png'}
                              alt={selectedApp.name || 'App icon'}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">
                              {selectedApp.name}
                            </h3>
                            <p className="text-xs font-black uppercase text-gray-800">
                              Version: <span className="bg-white border border-black px-1.5 py-0.5">{selectedApp.version || 'v1.0.0'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="bg-white border-2 border-black p-4 space-y-2 text-xs font-bold">
                          <div className="flex justify-between border-b border-gray-200 pb-1">
                            <span className="text-gray-600 uppercase">S3 Key / File:</span>
                            <span className="font-mono text-black truncate max-w-[200px]" title={selectedApp.fileName || selectedApp.s3Key}>
                              {selectedApp.fileName || selectedApp.s3Key || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-200 pb-1">
                            <span className="text-gray-600 uppercase">Installer Size:</span>
                            <span className="text-black font-black">{selectedApp.size}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-200 pb-1">
                            <span className="text-gray-600 uppercase">Total Downloads:</span>
                            <span className="bg-green-300 border border-black px-1.5 py-0.2 font-black">{selectedApp.downloadsCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 uppercase">User Rating:</span>
                            <span className="bg-yellow-200 border border-black px-1.5 py-0.2 font-black">★ {(selectedApp.averageRating || 5.0).toFixed(1)} ({selectedApp.reviewsCount || 0} reviews)</span>
                          </div>
                        </div>

                        {/* Live Screenshots Mini Gallery in Selected App Panel */}
                        {selectedApp.screenshots && selectedApp.screenshots.length > 0 && (
                          <div className="mt-4 pt-3 border-t-2 border-black">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-black uppercase text-black flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5 text-black" />
                                <span>Attached Screenshots ({selectedApp.screenshots.length})</span>
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewLightbox({
                                    appName: selectedApp.name,
                                    screenshots: selectedApp.screenshots || [],
                                    activeIdx: 0,
                                  })
                                }
                                className="text-[10px] font-black uppercase bg-white hover:bg-yellow-100 border border-black px-1.5 py-0.5 flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                              >
                                <Maximize2 className="w-2.5 h-2.5" />
                                <span>View HD</span>
                              </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-black">
                              {selectedApp.screenshots.map((sUrl, sIdx) => (
                                <motion.div
                                  key={`${sUrl}-${sIdx}`}
                                  onClick={() =>
                                    setPreviewLightbox({
                                      appName: selectedApp.name,
                                      screenshots: selectedApp.screenshots || [],
                                      activeIdx: sIdx,
                                    })
                                  }
                                  className="group relative flex-shrink-0 w-14 aspect-[9/16] bg-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-pointer overflow-hidden"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <Image
                                    src={sUrl}
                                    alt={`${selectedApp.name} screenshot ${sIdx + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Maximize2 className="w-3 h-3 text-white" />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t-2 border-black flex justify-between items-center">
                          <Link
                            href={`/app/${selectedApp.id || (selectedApp as any).appId}`}
                            target="_blank"
                            className="bg-white border-2 border-black px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 hover:shadow-[2px_2px_0px_0px_#000000]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Public Page</span>
                          </Link>
                        </div>
                      </div>
                    )}

                    <div className="bg-orange-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000000]">
                      <h4 className="text-sm font-black uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-black" />
                        Automatic File Name Binding
                      </h4>
                      <p className="text-xs font-bold leading-relaxed text-gray-800 uppercase">
                        Whenever you drag and drop any APK file, its filename is parsed in real time. The S3 download links on the user-facing store will automatically serve this exact installer without needing hardcoded paths!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: PUBLISH NEW APPLICATION */}
              {activeTab === 'publish' && (
                <motion.div
                  key="tab-publish"
                  initial={{ opacity: 0, y: 15, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.99 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000000] max-w-4xl"
                >
                  <div className="border-b-4 border-black pb-4 mb-6">
                    <span className="bg-green-400 border-2 border-black px-2 py-0.5 text-[11px] font-black uppercase tracking-wider">
                      New Catalog Entry
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-2">
                      Publish New Application
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-tight text-gray-600 mt-1">
                      Onboard a brand new app to KatyalStore. APK files are uploaded directly to the S3 bucket.
                    </p>
                  </div>

                  <form onSubmit={handlePublishNewApp} className="space-y-6">
                    {/* Basic Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider mb-1">
                          Application Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => {
                            setNewName(e.target.value);
                            if (!newId || newId === newName.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
                              setNewId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                            }
                          }}
                          placeholder="e.g. EchoPlay"
                          className="w-full bg-white border-2 border-black px-4 py-2.5 font-bold text-sm focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider mb-1">
                          App URL Slug / ID *
                        </label>
                        <input
                          type="text"
                          required
                          value={newId}
                          onChange={(e) => setNewId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))}
                          placeholder="e.g. echoplay"
                          className="w-full bg-white border-2 border-black px-4 py-2.5 font-bold font-mono text-sm focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000]"
                        />
                        <span className="text-[10px] font-bold text-gray-500 uppercase mt-0.5 block">
                          Direct URL will be /app/{newId || 'app-id'}
                        </span>
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider mb-2">
                          Category *
                        </label>
                        <NeoSelect
                          value={newCategory}
                          onChange={(val) => setNewCategory(val)}
                          options={[
                            { value: 'Developer Tools', label: 'Developer Tools' },
                            { value: 'Streaming / Social', label: 'Streaming / Social' },
                            { value: 'Entertainment', label: 'Entertainment' },
                            { value: 'Productivity', label: 'Productivity' },
                            { value: 'Music & Audio', label: 'Music & Audio' },
                            { value: 'Gaming', label: 'Gaming' },
                            { value: 'Custom', label: 'Custom Category...' },
                          ]}
                        />
                      </div>

                      {newCategory === 'Custom' && (
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider mb-1">
                            Enter Custom Category Name
                          </label>
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder="e.g. AI & Utilities"
                            className="w-full bg-white border-2 border-black px-4 py-2.5 font-bold text-sm focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000]"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider mb-1">
                          Initial Version String
                        </label>
                        <input
                          type="text"
                          value={newVersion}
                          onChange={(e) => setNewVersion(e.target.value)}
                          placeholder="v1.0.0"
                          className="w-full bg-white border-2 border-black px-4 py-2.5 font-bold text-sm focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000]"
                        />
                      </div>
                    </div>

                    {/* Teaser Quote */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider mb-1">
                        Teaser / Tagline (Punchy Quote) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTeaser}
                        onChange={(e) => setNewTeaser(e.target.value)}
                        placeholder="e.g. Stop watching anime alone in the dark while crying."
                        className="w-full bg-white border-2 border-black px-4 py-2.5 font-bold text-sm focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000]"
                      />
                    </div>

                    {/* Full Description */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider mb-1">
                        Full App Description *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Comprehensive overview of features, use cases, and why users should download..."
                        className="w-full bg-white border-2 border-black px-4 py-2.5 font-bold text-sm focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000]"
                      />
                    </div>

                    {/* Icon & APK Upload Zones */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <FileUploadZone
                        label="Application Icon Image"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        fileType="icon"
                        selectedFile={newIconFile}
                        onFileSelect={(file) => {
                          setNewIconFile(file);
                        }}
                      />

                      <FileUploadZone
                        label="Application APK Installer *"
                        accept=".apk,application/vnd.android.package-archive"
                        fileType="apk"
                        selectedFile={newApkFile}
                        onFileSelect={(file, meta) => {
                          setNewApkFile(file);
                          setNewApkFileName(meta.fileName);
                          setNewApkFileSize(meta.size);
                          if (meta.detectedVersion) {
                            setNewVersion(meta.detectedVersion);
                          }
                        }}
                        isUploading={isPublishing}
                        uploadProgress={publishProgress}
                      />
                    </div>

                    {/* Screenshots Upload Zone */}
                    <div className="bg-yellow-50 border-2 border-black p-4 shadow-[2px_2px_0px_0px_#000000]">
                      <ScreenshotUploadZone
                        screenshots={newScreenshots}
                        onChange={setNewScreenshots}
                        appId={(newId || newName.toLowerCase().replace(/[^a-z0-9]/g, '-')).trim() || 'new-app'}
                        version={newVersion || 'v1.0.0'}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t-2 border-black">
                      <motion.button
                        type="submit"
                        disabled={isPublishing || !newApkFile}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-black text-white font-black py-4 px-6 uppercase tracking-tight text-sm border-4 border-black hover:bg-green-400 hover:text-black hover:shadow-[6px_6px_0px_0px_#000000] active:shadow-[2px_2px_0px_0px_#000000] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isPublishing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Publishing to Public Page......({publishProgress}%)...</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" />
                            <span>Publish Application to Live Store</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 3: CATALOG & S3 INVENTORY */}
              {activeTab === 'inventory' && (
                <motion.div
                  key="tab-inventory"
                  initial={{ opacity: 0, y: 15, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.99 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000000]">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight">
                        Store Catalog Inventory
                      </h3>
                      <p className="text-xs font-bold text-gray-600 uppercase">
                        All live applications and their associated AWS S3 keys
                      </p>
                    </div>
                    <motion.button
                      onClick={fetchApps}
                      disabled={isLoadingApps}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="bg-yellow-300 border-2 border-black px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 hover:shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                    >
                      <FolderSync className={`w-3.5 h-3.5 ${isLoadingApps ? 'animate-spin' : ''}`} />
                      <span>Sync Inventory</span>
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {apps.map((app) => (
                      <motion.div
                        key={app.id || (app as any).appId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#000000] transition-shadow flex flex-col justify-between"
                      >
                        <div>
                          {/* Top Meta */}
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-white border-2 border-black w-14 h-14 relative p-1.5 flex-shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                                <Image
                                  src={app.icon || '/placeholder-logo.png'}
                                  alt={app.name || 'App icon'}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div>
                                <h4 className="text-xl font-black uppercase tracking-tight">
                                  {app.name}
                                </h4>
                                <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">
                                  {app.category}
                                </span>
                              </div>
                            </div>

                            <span className="bg-yellow-300 border-2 border-black px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000]">
                              {app.version || 'v1.0.0'}
                            </span>
                          </div>

                          {/* S3 Details */}
                          <div className="bg-orange-50 border-2 border-black p-3 text-xs font-bold space-y-1.5 mb-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600 uppercase">S3 File Key:</span>
                              <span className="font-mono text-black truncate max-w-[180px]" title={app.fileName || app.s3Key}>
                                {app.fileName || app.s3Key || 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 uppercase">Size:</span>
                              <span className="font-black text-black">{app.size}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 uppercase">Downloads:</span>
                              <span className="bg-green-300 border border-black px-1.5 text-[10px] font-black">{app.downloadsCount || 0}</span>
                            </div>
                          </div>

                          <p className="text-xs font-medium text-gray-700 line-clamp-2 mb-4">
                            {app.teaser}
                          </p>

                          {/* Screenshot Display Panel for Catalog Board */}
                          <div className="bg-yellow-50/80 border-2 border-black p-3 mb-4 shadow-[2px_2px_0px_0px_#000000]">
                            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-black/20">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-yellow-300 border border-black p-1 shadow-[1px_1px_0px_0px_#000000]">
                                  <ImageIcon className="w-3.5 h-3.5 text-black" />
                                </span>
                                <span className="text-xs font-black uppercase tracking-tight text-black">
                                  App Screenshots ({app.screenshots?.length || 0})
                                </span>
                              </div>

                              {app.screenshots && app.screenshots.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewLightbox({
                                      appName: app.name,
                                      screenshots: app.screenshots || [],
                                      activeIdx: 0,
                                    })
                                  }
                                  className="text-[10px] font-black uppercase bg-white hover:bg-yellow-200 border border-black px-2 py-0.5 flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                                >
                                  <Maximize2 className="w-2.5 h-2.5" />
                                  <span>View Lightbox</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAppId(app.id || (app as any).appId);
                                    setUpdateVersion(app.version || 'v1.0.0');
                                    setActiveTab('update');
                                  }}
                                  className="text-[10px] font-black uppercase bg-yellow-300 hover:bg-yellow-400 border border-black px-2 py-0.5 flex items-center gap-1 shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Upload</span>
                                </button>
                              )}
                            </div>

                            {app.screenshots && app.screenshots.length > 0 ? (
                              <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-black">
                                {app.screenshots.map((url, sIdx) => (
                                  <motion.div
                                    key={`${url}-${sIdx}`}
                                    onClick={() =>
                                      setPreviewLightbox({
                                        appName: app.name,
                                        screenshots: app.screenshots || [],
                                        activeIdx: sIdx,
                                      })
                                    }
                                    className="group relative flex-shrink-0 w-16 sm:w-20 aspect-[9/16] bg-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] cursor-pointer overflow-hidden transition-all"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={`Click to preview screenshot #${sIdx + 1} in HD`}
                                  >
                                    <Image
                                      src={url}
                                      alt={`${app.name} screenshot ${sIdx + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-black text-white px-1 text-[8px] font-black uppercase border border-black">
                                      #{sIdx + 1}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-white/90 border border-dashed border-gray-400 p-3 text-center flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-left">
                                  <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-[11px] font-bold text-gray-600 uppercase">
                                    No in-app screenshots attached
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAppId(app.id || (app as any).appId);
                                    setUpdateVersion(app.version || 'v1.0.0');
                                    setActiveTab('update');
                                  }}
                                  className="text-[10px] font-black uppercase bg-yellow-300 hover:bg-yellow-400 border border-black px-2.5 py-1 shadow-[1px_1px_0px_0px_#000000] cursor-pointer whitespace-nowrap"
                                >
                                  Upload Now
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Triggers */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t-2 border-black">
                          <motion.button
                            onClick={() => {
                              setSelectedAppId(app.id || (app as any).appId);
                              setUpdateVersion(app.version || 'v1.0.0');
                              setActiveTab('update');
                            }}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="bg-yellow-300 border-2 border-black px-3 py-1.5 text-xs font-black uppercase hover:shadow-[3px_3px_0px_0px_#000000] transition-shadow cursor-pointer flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Push Update</span>
                          </motion.button>

                          <div className="flex items-center gap-2">
                            <Link
                              href={`/app/${app.id || (app as any).appId}`}
                              target="_blank"
                              className="bg-white border-2 border-black p-1.5 text-black hover:bg-gray-100 transition shadow-[2px_2px_0px_0px_#000000]"
                              title="Preview App Store Page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => setConfirmDeleteApp(app)}
                              className="bg-red-400 border-2 border-black p-1.5 text-black hover:bg-red-500 transition shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                              title="Delete App from Catalog"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </main>

          {/* Delete Confirmation Dialog Modal */}
          <AnimatePresence>
            {confirmDeleteApp && (
              <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white border-4 border-black p-6 w-full max-w-sm shadow-[8px_8px_0px_0px_#000000]"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                >
                  <div className="w-12 h-12 bg-red-400 border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_#000000]">
                    <AlertTriangle className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                    Remove Application?
                  </h3>
                  <p className="text-xs font-bold uppercase text-gray-700 mb-6">
                    Are you sure you want to remove &quot;{confirmDeleteApp.name}&quot; from the public KatyalStore catalog? This action is permanent.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmDeleteApp(null)}
                      className="flex-1 bg-white border-2 border-black py-2 font-black uppercase text-xs hover:shadow-[3px_3px_0px_0px_#000000]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteApp(confirmDeleteApp.id || (confirmDeleteApp as any).appId)}
                      className="flex-1 bg-red-400 border-2 border-black py-2 font-black uppercase text-xs hover:shadow-[3px_3px_0px_0px_#000000]"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lightbox Fullscreen Modal for Dashboard Catalog */}
          <AnimatePresence>
            {previewLightbox && (
              <motion.div
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewLightbox(null)}
              >
                <motion.div
                  className="relative max-w-4xl w-full max-h-[90vh] bg-white border-4 border-black p-4 sm:p-6 shadow-[10px_10px_0px_0px_#000000] flex flex-col"
                  initial={{ scale: 0.9, rotate: -1 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0.9, rotate: 1 }}
                  onClick={(e) => e.stopPropagation()}
                  transition={{ type: 'spring', stiffness: 350 }}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
                    <div className="flex items-center gap-2">
                      <span className="bg-yellow-300 border border-black px-2 py-0.5 text-xs font-black uppercase">
                        {previewLightbox.appName}
                      </span>
                      <span className="text-xs font-bold text-gray-700 uppercase">
                        Screenshot #{previewLightbox.activeIdx + 1} of {previewLightbox.screenshots.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewLightbox(null)}
                      className="bg-red-400 border-2 border-black p-1.5 hover:bg-red-500 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                      title="Close (Esc)"
                    >
                      <X className="w-4 h-4 text-black" />
                    </button>
                  </div>

                  {/* Main Image View */}
                  <div className="relative w-full h-[55vh] sm:h-[65vh] bg-black border-2 border-black flex items-center justify-center overflow-hidden">
                    <Image
                      src={previewLightbox.screenshots[previewLightbox.activeIdx]}
                      alt={`${previewLightbox.appName} screenshot full view`}
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>

                  {/* Navigation Controls */}
                  {previewLightbox.screenshots.length > 1 && (
                    <div className="flex items-center justify-between pt-3 mt-3 border-t-2 border-black">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewLightbox((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  activeIdx:
                                    prev.activeIdx > 0 ? prev.activeIdx - 1 : prev.screenshots.length - 1,
                                }
                              : null
                          )
                        }
                        className="bg-white border-2 border-black px-4 py-2 font-black uppercase text-xs flex items-center gap-1 hover:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <div className="flex gap-1.5">
                        {previewLightbox.screenshots.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() =>
                              setPreviewLightbox((prev) => (prev ? { ...prev, activeIdx: dotIdx } : null))
                            }
                            className={`w-3 h-3 border border-black transition-colors cursor-pointer ${
                              dotIdx === previewLightbox.activeIdx ? 'bg-yellow-300' : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                            title={`Go to screenshot #${dotIdx + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPreviewLightbox((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  activeIdx:
                                    prev.activeIdx < prev.screenshots.length - 1 ? prev.activeIdx + 1 : 0,
                                }
                              : null
                          )
                        }
                        className="bg-white border-2 border-black px-4 py-2 font-black uppercase text-xs flex items-center gap-1 hover:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Neo-brutalist Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 border-4 border-black px-6 py-3 font-black text-xs md:text-sm uppercase tracking-tight shadow-[6px_6px_0px_0px_#000000] flex items-center gap-2 ${
                  toast.type === 'success'
                    ? 'bg-green-400 text-black'
                    : toast.type === 'error'
                    ? 'bg-red-400 text-black'
                    : 'bg-yellow-300 text-black'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
