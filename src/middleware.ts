import { authMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Check if we're in production and should show coming soon page
const isProduction = process.env.NODE_ENV === 'production';
const showComingSoon = process.env.NEXT_PUBLIC_SHOW_COMING_SOON === 'true';

export default authMiddleware({
  beforeAuth: (req: NextRequest) => {
    // In production, redirect to coming soon page (except for the coming soon page itself)
    if (isProduction && showComingSoon && !req.nextUrl.pathname.startsWith('/coming-soon')) {
      return NextResponse.redirect(new URL('/coming-soon', req.url));
    }
  },
  publicRoutes: [
    '/',
    '/coming-soon',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/pricing',
    '/library',
    '/assistant',
    '/write',
    '/chat',
    '/search',
    '/api/webhooks/stripe',
    '/api/writing/(.*)',
    '/api/assistant/(.*)',
    '/api/search/(.*)',
    '/api/chat',
  ],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
