import { NextRequest, NextResponse } from 'next/server';
import { validateAppSumoCode } from '@/lib/billing/plans';
import { localStore } from '@/lib/store';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, email } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Please enter a valid AppSumo license key' }, { status: 400 });
    }

    const verification = validateAppSumoCode(code);
    if (!verification.valid) {
      return NextResponse.json({ error: 'Invalid or expired AppSumo code' }, { status: 400 });
    }

    // Attach to local store agency
    localStore.agency.subscription = verification.subscription;

    // Try Supabase update if connected
    try {
      const admin = createAdminClient();
      await admin
        .from('agencies')
        .update({
          subscription: verification.subscription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', localStore.agency.id);
    } catch {
      // Offline fallback
    }

    return NextResponse.json({
      success: true,
      message: `🎉 AppSumo License Activated! You now have ${verification.tier === 'appsumo_tier2' ? 'Unlimited Lifetime' : 'Lifetime'} Agency Access.`,
      tier: verification.tier,
      subscription: verification.subscription,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error redeeming code';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
