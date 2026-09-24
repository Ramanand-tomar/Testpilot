import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);
const isApiRoute = createRouteMatcher(['/api(.*)']);
const isPublicApiRoute = createRouteMatcher([
  '/api/webhooks/clerk(.*)',
  '/api/webhooks/stripe(.*)',
  '/api/webhooks/trigger(.*)',
  '/api/reports(.*)',
  '/report(.*)',
  '/api/cron(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req) || (isApiRoute(req) && !isPublicApiRoute(req))) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|jpg|jpeg|png|woff|woff2|ico|csv|docx|xlsx|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

