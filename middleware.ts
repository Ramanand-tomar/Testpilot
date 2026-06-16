import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);
const isApiRoute = createRouteMatcher(['/api(.*)']);
const isPublicApiRoute = createRouteMatcher(['/api/webhooks/clerk(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req) || (isApiRoute(req) && !isPublicApiRoute(req))) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|jpg|jpeg|png|woff|woff2|ico|csv|docx|xlsx|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
