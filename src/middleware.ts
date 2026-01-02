import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    '/',
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
