'use client';

import React, { useState, useRef } from 'react';
import { Agency, Upload } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { formatFileSize } from '@/lib/utils';
import {
  Upload as UploadIcon,
  Archive,
  Image as ImageIcon,
  FileText,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface WizardStepUploadsProps {
  token: string;
  agency: Agency;
  uploads: Upload[];
  onUploadSuccess: (newUpload: Upload) => void;
  onDeleteUpload: (uploadId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WizardStepUploads({
  token,
  agency,
  uploads,
  onUploadSuccess,
  onDeleteUpload,
  onNext,
  onBack,
}: WizardStepUploadsProps) {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [category, setCategory] = useState<'asset' | 'brand' | 'other'>('brand');

  const brandColor = agency.brand_color || '#3B82F6';
  const assetUploads = uploads.filter((u) => u.category !== 'contract');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // 50MB size limit check
    if (file.size > 52428800) {
      error('File too large', 'Please upload a file under 50 MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', token);
    formData.append('category', category);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onUploadSuccess(data.upload);
      success('File uploaded!', `${file.name} uploaded successfully.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading file';
      error('Upload Failed', msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Brand Assets & Project Files
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Upload logos (PNG, SVG), brand style guides, design references, or relevant documents.
        </p>
      </div>

      {/* Category selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-zinc-500">Asset Category:</span>
        {(['brand', 'asset', 'other'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
              category === cat
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            {cat === 'brand' ? 'Brand / Logo' : cat === 'asset' ? 'Media / Assets' : 'Other File'}
          </button>
        ))}
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/50 scale-[1.01]'
            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.zip,.doc,.docx,.svg"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: brandColor }}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadIcon className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {isUploading ? 'Uploading file...' : 'Click to upload or drag & drop files here'}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Supports SVG, PNG, JPG, PDF, Word, and ZIP archives (Up to 50 MB)
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Attached Files ({assetUploads.length})
        </h3>

        {assetUploads.length === 0 ? (
          <p className="text-xs text-zinc-400 italic py-2">No files attached yet.</p>
        ) : (
          <div className="space-y-2">
            {assetUploads.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {file.filename}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {formatFileSize(file.file_size)} &bull; {file.category}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteUpload(file.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="text-xs gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>

        <Button
          onClick={onNext}
          className="text-xs gap-1.5 font-semibold text-white px-6"
          style={{ backgroundColor: brandColor }}
        >
          Next: Contract Upload
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
