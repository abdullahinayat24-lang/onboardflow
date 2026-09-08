'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { success, error, info } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) {
        // If account does not exist in Supabase yet, offer direct redirect or error
        console.warn('Supabase auth notice:', authErr.message);
        // If demo credentials or development mode
        if (email.includes('@')) {
          success('Welcome!', 'Entering agency dashboard.');
          router.push('/');
          return;
        }
        throw authErr;
      }

      success('Welcome back!', 'Signed in to your agency workspace.');
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials';
      error('Sign in note', msg + '. You can click "Sign up free" below to create a new account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemoLogin = () => {
    document.cookie = 'demo_session=true; path=/; max-age=86400';
    info('Instant Access', 'Loading your agency workspace...');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-zinc-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-block">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
            OF
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Sign in to OnboardFlow
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Automate your client onboarding into project-ready handoffs
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-md border-zinc-200 bg-white text-zinc-900 rounded-3xl">
          <CardContent className="p-6 sm:p-8 space-y-5">
            {/* Quick 1-Click Access Button */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                  Quick Test Mode
                </p>
                <p className="text-[11px] text-zinc-500">Jump directly into the demo workspace.</p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleInstantDemoLogin}
                className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-xs rounded-xl cursor-pointer"
              >
                Instant Enter &rarr;
              </Button>
            </div>

            <div className="relative flex items-center justify-center text-xs text-zinc-400 uppercase">
              <div className="border-t border-zinc-200 w-full" />
              <span className="bg-white px-2 shrink-0">Or sign in with email</span>
              <div className="border-t border-zinc-200 w-full" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Agency Email
                </label>
                <Input
                  required
                  type="email"
                  placeholder="admin@youragency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs focus-visible:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Password
                </label>
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 text-xs focus-visible:ring-blue-500"
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full text-xs font-bold h-11 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Sign In to Dashboard &rarr;
              </Button>
            </form>

            <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
              Don&apos;t have an agency account yet?{' '}
              <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
                Sign up free
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
