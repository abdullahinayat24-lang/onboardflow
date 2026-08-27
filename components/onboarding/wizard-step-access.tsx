'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlatformAccessLocker } from '@/types';
import { Share2, Globe, FolderGit2, Key, ShieldCheck } from 'lucide-react';

interface WizardStepAccessProps {
  accessData: PlatformAccessLocker;
  onChange: (updated: PlatformAccessLocker) => void;
}

export function WizardStepAccess({ accessData, onChange }: WizardStepAccessProps) {
  const updateField = (field: keyof PlatformAccessLocker, value: string) => {
    onChange({
      ...accessData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
          Step 5 &bull; Platform & Cloud Access
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
          Social Media & Asset Access
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Share your social handles, Google Drive links, or Meta Business permissions so we can seamlessly manage and publish your content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Instagram Handle */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4 space-y-2">
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-pink-500" />
              Instagram Account Handle
            </label>
            <p className="text-[11px] text-zinc-500">
              e.g. @yourbrandname
            </p>
            <Input
              placeholder="@yourbrand"
              value={accessData.instagram_handle || ''}
              onChange={(e) => updateField('instagram_handle', e.target.value)}
              className="text-xs"
            />
          </CardContent>
        </Card>

        {/* Facebook Page URL */}
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4 space-y-2">
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Facebook Page URL
            </label>
            <p className="text-[11px] text-zinc-500">
              e.g. facebook.com/yourbrand
            </p>
            <Input
              placeholder="https://facebook.com/yourpage"
              value={accessData.facebook_page_url || ''}
              onChange={(e) => updateField('facebook_page_url', e.target.value)}
              className="text-xs"
            />
          </CardContent>
        </Card>

        {/* Google Drive / Dropbox Folder */}
        <Card className="border-zinc-200 dark:border-zinc-800 md:col-span-2">
          <CardContent className="p-4 space-y-2">
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-amber-500" />
              Shared Google Drive / Dropbox Folder Link
            </label>
            <p className="text-[11px] text-zinc-500">
              Have a heavy folder of 4K photos, raw footage, or Figma files? Paste the shared link here:
            </p>
            <Input
              placeholder="https://drive.google.com/drive/folders/..."
              value={accessData.google_drive_folder_url || ''}
              onChange={(e) => updateField('google_drive_folder_url', e.target.value)}
              className="text-xs"
            />
          </CardContent>
        </Card>

        {/* Meta Business ID or Special Permissions */}
        <Card className="border-zinc-200 dark:border-zinc-800 md:col-span-2">
          <CardContent className="p-4 space-y-2">
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-600" />
              Login Details, Meta Business ID, or Special Access Notes
            </label>
            <p className="text-[11px] text-zinc-500">
              Include Meta Partner ID, CMS logins, Canva/CapCut permissions, or posting instructions:
            </p>
            <Textarea
              placeholder="e.g. Meta Business ID: 1029384756. Also please request access on Shopify staff account with email hello@agency.com..."
              value={accessData.login_credentials_notes || ''}
              onChange={(e) => updateField('login_credentials_notes', e.target.value)}
              rows={3}
              className="text-xs"
            />
          </CardContent>
        </Card>
      </div>

      <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>All credential notes and links are encrypted in transit and accessible only by your authorized agency team.</span>
      </div>
    </div>
  );
}
