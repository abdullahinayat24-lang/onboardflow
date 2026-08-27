'use client';

import React from 'react';
import { Upload } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatFileSize, formatDateTime } from '@/lib/utils';
import { FileText, Download, ShieldCheck, Image as ImageIcon, Archive, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadsManagerProps {
  uploads: Upload[];
}

export function UploadsManager({ uploads }: UploadsManagerProps) {
  const contracts = uploads.filter((u) => u.category === 'contract');
  const assets = uploads.filter((u) => u.category !== 'contract');

  const getFileIcon = (filename: string, mime?: string | null) => {
    if (mime?.startsWith('image/') || filename.match(/\.(png|jpg|jpeg|svg|webp|gif)$/i)) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (filename.match(/\.(zip|tar|gz|7z|rar)$/i)) {
      return <Archive className="w-5 h-5 text-amber-500" />;
    }
    if (filename.match(/\.(pdf|doc|docx)$/i)) {
      return <FileText className="w-5 h-5 text-rose-500" />;
    }
    return <File className="w-5 h-5 text-zinc-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Contracts & Agreements Card */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Signed Contracts & Agreements ({contracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {contracts.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-2">
              No signed agreement uploaded by the client yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contracts.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {file.filename}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {formatFileSize(file.file_size)} &bull; {formatDateTime(file.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <a href={file.file_url} target="_blank" rel="noreferrer" download>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Download className="w-4 h-4 text-zinc-600 hover:text-zinc-900" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand Assets & Project Files */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-base flex items-center gap-2">
            <Archive className="w-5 h-5 text-blue-600" />
            Uploaded Brand Assets & Files ({assets.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {assets.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-2">
              No brand assets or files uploaded by the client yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {assets.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(file.filename, file.mime_type)}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {file.filename}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {formatFileSize(file.file_size)} &bull; {file.category}
                      </p>
                    </div>
                  </div>
                  <a href={file.file_url} target="_blank" rel="noreferrer" download>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Download className="w-4 h-4 text-zinc-600 hover:text-zinc-900" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
