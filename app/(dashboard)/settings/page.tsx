'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/dashboard/header';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Tabs } from '@/components/ui/tabs';
import {
  Palette,
  Mail,
  Save,
  Sparkles,
  Check,
  Globe,
  Bell,
  Eye,
  Share2,
  CreditCard,
  MessageSquare,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';

export default function SettingsPage() {
  const { success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState('branding');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Branding state
  const [agencyName, setAgencyName] = useState('I Digital Fun');
  const [slug, setSlug] = useState('i-digital-fun');
  const [logoUrl, setLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#3B82F6');
  const [website, setWebsite] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Webhooks & Integrations
  const [whatsappWebhookUrl, setWhatsappWebhookUrl] = useState('');
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [genericWebhookUrl, setGenericWebhookUrl] = useState('');
  const [stripePaymentLink, setStripePaymentLink] = useState('https://buy.stripe.com/demo_checkout_link');
  const [isSavingIntegrations, setIsSavingIntegrations] = useState(false);

  // Reminder settings state
  const [daysBeforeReminder, setDaysBeforeReminder] = useState(3);
  const [maxReminders, setMaxReminders] = useState(3);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [customMessage, setCustomMessage] = useState(
    'We are excited to kick off your project! Please take a quick moment to finish your onboarding checklist.'
  );
  const [isSavingReminders, setIsSavingReminders] = useState(false);

  // Load existing agency data on mount
  useEffect(() => {
    async function loadAgency() {
      try {
        const res = await fetch('/api/settings/agency');
        if (res.ok) {
          const data = await res.json();
          if (data.agency) {
            setAgencyName(data.agency.name || 'I Digital Fun');
            setSlug(data.agency.slug || 'i-digital-fun');
            setLogoUrl(data.agency.logo_url || '');
            setBrandColor(data.agency.brand_color || '#3B82F6');
            setWebsite(data.agency.website || '');
            setSupportEmail(data.agency.support_email || '');
            setWhatsappWebhookUrl(data.agency.whatsapp_webhook_url || '');
            setSlackWebhookUrl(data.agency.slack_webhook_url || '');
            setGenericWebhookUrl(data.agency.webhook_url || '');
            setStripePaymentLink(data.agency.stripe_payment_link || 'https://buy.stripe.com/demo_checkout_link');
          }
        }
      } catch (e) {
        console.warn('Failed to load agency data:', e);
      }
    }
    loadAgency();
  }, []);

  const presetColors = [
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Indigo', hex: '#6366F1' },
    { name: 'Purple', hex: '#8B5CF6' },
    { name: 'Rose', hex: '#F43F5E' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Amber', hex: '#F59E0B' },
    { name: 'Zinc', hex: '#18181B' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    info('Uploading Logo', 'Processing image file...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'asset');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      if (data.file_url) {
        setLogoUrl(data.file_url);
        success('Logo Uploaded! 🎉', 'Your agency logo has been attached.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading file';
      error('Upload Failed', msg);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBranding(true);

    try {
      const res = await fetch('/api/settings/agency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agencyName,
          slug: slug || undefined,
          logo_url: logoUrl || undefined,
          brand_color: brandColor,
          website: website || undefined,
          support_email: supportEmail || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update branding');

      success('Branding Saved!', 'Your agency logo, name, and colors are now active on all client pages.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving';
      error('Failed to save', msg);
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleSaveIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingIntegrations(true);

    try {
      const res = await fetch('/api/settings/agency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_webhook_url: whatsappWebhookUrl || null,
          slack_webhook_url: slackWebhookUrl || null,
          webhook_url: genericWebhookUrl || null,
          stripe_payment_link: stripePaymentLink || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update integrations');

      success('Integrations Saved!', 'Instant WhatsApp, Slack, and Stripe links updated.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving';
      error('Failed to save', msg);
    } finally {
      setIsSavingIntegrations(false);
    }
  };

  const handleSaveReminders = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingReminders(true);

    try {
      const res = await fetch('/api/settings/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days_before_reminder: Number(daysBeforeReminder),
          max_reminders: Number(maxReminders),
          enabled: remindersEnabled,
          custom_message: customMessage || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update reminder settings');

      success('Reminder Settings Saved!', 'Automated email nudges will fire according to schedule.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving';
      error('Failed to save', msg);
    } finally {
      setIsSavingReminders(false);
    }
  };

  const tabs = [
    {
      id: 'branding',
      label: 'Agency Branding & Logo',
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: 'integrations',
      label: 'WhatsApp, Slack & Stripe',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'reminders',
      label: 'Automated Email Reminders',
      icon: <Bell className="w-4 h-4" />,
    },
  ];

  return (
    <div>
      <Header
        title="Agency Settings"
        description="Configure your agency branding, upload your logo, set colors, and manage alerts"
      />

      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'branding' && (
          <form onSubmit={handleSaveBranding} className="space-y-6">
            <Card className="shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Branding &amp; Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Agency Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      required
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="e.g. I Digital Fun"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Agency Slug / Subdomain
                    </label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="i-digital-fun"
                    />
                  </div>
                </div>

                {/* Logo Uploader / URL Field */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Agency Logo
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      isLoading={isUploadingLogo}
                      className="text-xs gap-1.5 cursor-pointer shrink-0"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                      Upload Logo File (PNG, SVG, JPG)
                    </Button>
                    <span className="text-xs text-zinc-400">or paste direct image URL below:</span>
                  </div>
                  <div className="mt-2">
                    <Input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://yourdomain.com/logo.png"
                    />
                  </div>
                </div>

                {/* Brand Color Picker */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Primary Brand Color (Used across client onboarding)
                  </label>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {presetColors.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setBrandColor(color.hex)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all shadow-xs cursor-pointer ${
                          brandColor.toLowerCase() === color.hex.toLowerCase()
                            ? 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-zinc-100 scale-105'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {brandColor.toLowerCase() === color.hex.toLowerCase() && (
                          <Check className="w-4 h-4 stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-700 shrink-0 shadow-xs"
                      style={{ backgroundColor: brandColor }}
                    />
                    <Input
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      placeholder="#3B82F6"
                      className="w-36 font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Agency Website
                    </label>
                    <Input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://idigitalfun.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Client Support Email
                    </label>
                    <Input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="support@idigitalfun.com"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="submit" isLoading={isSavingBranding} className="text-xs gap-1.5 cursor-pointer">
                  <Save className="w-3.5 h-3.5" />
                  Save Branding Settings
                </Button>
              </CardFooter>
            </Card>

            {/* Live Client Header Preview Card */}
            <Card className="shadow-xs border-zinc-200 dark:border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Live Preview: Client Onboarding Header
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs"
                        style={{ backgroundColor: brandColor }}
                      >
                        {logoUrl ? (
                          <img src={logoUrl} alt={agencyName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          agencyName.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{agencyName}</p>
                        <p className="text-[10px] text-zinc-400">Project Onboarding</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="text-xs font-semibold text-white pointer-events-none"
                      style={{ backgroundColor: brandColor }}
                    >
                      Continue &rarr;
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {activeTab === 'integrations' && (
          <form onSubmit={handleSaveIntegrations} className="space-y-6">
            <Card className="shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  Instant Webhook &amp; WhatsApp Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    WhatsApp Webhook URL (Zapier / Make / Twilio relay)
                  </label>
                  <Input
                    type="url"
                    value={whatsappWebhookUrl}
                    onChange={(e) => setWhatsappWebhookUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Triggers an instant WhatsApp alert to your phone when a client completes onboarding.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Slack Channel Incoming Webhook URL
                  </label>
                  <Input
                    type="url"
                    value={slackWebhookUrl}
                    onChange={(e) => setSlackWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Posts new client AI briefs directly into your team&apos;s Slack channel.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Stripe Payment Link (For Retainers &amp; Deposits)
                  </label>
                  <Input
                    type="url"
                    value={stripePaymentLink}
                    onChange={(e) => setStripePaymentLink(e.target.value)}
                    placeholder="https://buy.stripe.com/..."
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Used during the optional onboarding payment step for upfront invoice or deposit collection.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="submit" isLoading={isSavingIntegrations} className="text-xs gap-1.5 cursor-pointer">
                  <Save className="w-3.5 h-3.5" />
                  Save Integrations
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}

        {activeTab === 'reminders' && (
          <form onSubmit={handleSaveReminders} className="space-y-6">
            <Card className="shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Automated Client Reminders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Enable Automated Email Reminders
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Automatically nudge clients who haven&apos;t finished onboarding after X days.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={remindersEnabled}
                    onChange={(e) => setRemindersEnabled(e.target.checked)}
                    className="w-5 h-5 rounded text-zinc-900 focus:ring-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Days Before Sending Reminder
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={daysBeforeReminder}
                      onChange={(e) => setDaysBeforeReminder(Number(e.target.value))}
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Days of inactivity before sending a gentle reminder email.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Maximum Reminders Per Client
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={maxReminders}
                      onChange={(e) => setMaxReminders(Number(e.target.value))}
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Maximum number of reminder nudges before stopping.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Custom Reminder Message (Optional)
                  </label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Custom email text..."
                    className="min-h-[90px] text-xs"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="submit" isLoading={isSavingReminders} className="text-xs gap-1.5 cursor-pointer">
                  <Save className="w-3.5 h-3.5" />
                  Save Reminder Settings
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
