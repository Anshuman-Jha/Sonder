// Resource: https://clerk.com/docs/nextjs/middleware#clerk-middleware
// Updated for Next.js 16 and Clerk v6+

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook/clerk",
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
