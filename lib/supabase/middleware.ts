import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run Supabase Auth for public token routes or api routes
  const path = request.nextUrl.pathname;
  if (
    path.startsWith('/onboard') ||
    path.startsWith('/package') ||
    path.startsWith('/api/cron') ||
    path.startsWith('/_next') ||
    path.includes('/favicon.ico')
  ) {
    return supabaseResponse;
  }

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected agency dashboard routes
  const isDashboardRoute =
    path === '/' ||
    path.startsWith('/clients') ||
    path.startsWith('/templates') ||
    path.startsWith('/settings');

  const isAuthRoute = path.startsWith('/login') || path.startsWith('/signup');

  // If unauthenticated trying to access dashboard, redirect to login
  if (!user && isDashboardRoute) {
    // If Supabase URL is placeholder (development/demo mode without configured Supabase), pass through for local development preview
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If authenticated user visits login/signup, redirect to dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
