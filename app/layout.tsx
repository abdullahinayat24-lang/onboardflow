import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';

const geistSans = Geist({
  variable: '--font-font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OnboardFlow — Turn Signed Clients into Project-Ready Clients',
  description:
    'Automated client onboarding for agencies and freelancers. Branded links, smart questionnaires, asset uploads, AI project brief generation, and zero manual chasing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
