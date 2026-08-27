'use client';

import React, { useState, useRef } from 'react';
import { Agency, Upload } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { formatFileSize, formatDateTime } from '@/lib/utils';
import {
  ShieldCheck,
  FileText,
  Upload as UploadIcon,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface WizardStepContractProps {
  token: string;
  agency: Agency;
  uploads: Upload[];
  onUploadSuccess: (newUpload: Upload) => void;
  onDeleteUpload: (uploadId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WizardStepContract({
  token,
  agency,
  uploads,
  onUploadSuccess,
  onDeleteUpload,
  onNext,
  onBack,
}: WizardStepContractProps) {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const brandColor = agency.brand_color || '#3B82F6';
  const contracts = uploads.filter((u) => u.category === 'contract');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 52428800) {
      error('File too large', 'Please upload a contract under 50 MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', token);
    formData.append('category', 'contract');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Contract upload failed');

      onUploadSuccess(data.upload);
      success('Contract Uploaded!', `${file.name} uploaded successfully.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading contract';
      error('Upload Failed', msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Client Agreement & Contract
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Upload your signed Master Services Agreement (MSA), Statement of Work (SOW), or proposal.
        </p>
      </div>

      <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 dark:text-emerald-200">
              <strong className="block font-semibold mb-0.5">Secure Document Storage</strong>
              Documents uploaded here are encrypted and accessible only to {agency.name}&apos;s verified project management team.
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,image/*"
          />

          {contracts.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center cursor-pointer hover:bg-zinc-50/50 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white shadow-xs mb-3"
                style={{ backgroundColor: brandColor }}
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <FileText className="w-6 h-6" />
                )}
              </div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {isUploading ? 'Uploading contract...' : 'Click to upload signed agreement'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">PDF or Word document preferred (Up to 50 MB)</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Signed Agreement Uploaded
              </p>
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {c.filename}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {formatFileSize(c.file_size)} &bull; Uploaded {formatDateTime(c.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteUpload(c.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                    title="Remove and re-upload"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs gap-1.5 w-full mt-2"
              >
                <UploadIcon className="w-3.5 h-3.5" />
                Upload Additional Agreement / Addendum
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
          Next: Review & Submit
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
