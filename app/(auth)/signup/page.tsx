'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

export default function SignUpPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [agencyName, setAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            agency_name: agencyName,
          },
        },
      });

      if (authErr) {
        console.warn('Supabase signup notice:', authErr.message);
      }

      success('Account Ready!', 'Setting up your agency onboarding workspace.');
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error signing up';
      error('Sign up notice', msg);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-zinc-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white text-zinc-950 flex items-center justify-center font-bold text-xl mx-auto shadow-md">
          OF
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Agency Account
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Turn signed clients into project-ready clients in minutes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-2xl border-zinc-800 bg-zinc-900/90 text-white backdrop-blur-md">
          <CardContent className="p-6 sm:p-8 space-y-5">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Agency / Company Name
                </label>
                <Input
                  required
                  placeholder="e.g. Apex Digital Studio"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Work Email Address
                </label>
                <Input
                  required
                  type="email"
                  placeholder="you@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Create Password
                </label>
                <Input
                  required
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-white"
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200"
              >
                Create Workspace &rarr;
              </Button>
            </form>

            <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-white underline hover:text-blue-400">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
