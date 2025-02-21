import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const mailTmToken = request.cookies.get("mail_tm_token")?.value;
  const path = request.nextUrl.pathname;

  // Verify GitHub auth session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes require either GitHub auth or Mail.tm token
  if (path.startsWith("/dashboard")) {
    if (!mailTmToken && !session) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (path.startsWith("/auth/") && (mailTmToken || session)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
