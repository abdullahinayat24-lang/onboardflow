import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Pass through public routes, token access, api routes, and static assets
  if (
    path.startsWith('/onboard') ||
    path.startsWith('/package') ||
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.includes('/favicon.ico') ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for session cookies (Supabase Auth token cookie or demo session)
  const allCookies = request.cookies.getAll();
  const hasSupabaseAuth = allCookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token') && c.value
  );
  const hasDemoSession = request.cookies.get('demo_session')?.value === 'true';
  const isAuthenticated = hasSupabaseAuth || hasDemoSession;

  const isDashboardRoute =
    path === '/' ||
    path.startsWith('/clients') ||
    path.startsWith('/templates') ||
    path.startsWith('/settings');

  const isAuthRoute = path === '/login' || path === '/signup';

  // If unauthenticated trying to access protected dashboard routes, redirect to /login
  if (!isAuthenticated && isDashboardRoute) {
    // If running in development / test mode with fallback store, pass through
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If already authenticated visiting /login or /signup, redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
