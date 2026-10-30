import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { type NextRequest } from "next/server";

const handleIntl = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // First, handle internationalization
  const intlResponse = handleIntl(request);

  // Then, refresh Supabase auth session and enforce route protections
  return await updateSession(request, intlResponse);
}

export const config = {
  matcher: [
    "/",
    "/(en|hi|mr)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
