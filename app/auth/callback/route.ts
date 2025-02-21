import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMailTmAccount, loginMailTm } from "@/lib/mail-tm/client";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      try {
        // Try to find or create a Mail.tm account for this GitHub user
        const username = `gh_${user.id}`;
        const password = user.email || username; // Using email as password or fallback to username

        try {
          // Try to log in first
          const loginData = await loginMailTm(`${username}@mail.tm`, password);
          if (loginData.token) {
            const expires = new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toUTCString();
            cookieStore.set("mail_tm_token", loginData.token, {
              path: "/",
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
            cookieStore.set(
              "mail_tm_account",
              JSON.stringify({
                id: loginData.account.id,
                email: `${username}@mail.tm`,
              }),
              {
                path: "/",
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
              }
            );
          }
        } catch (loginError) {
          // If login fails, try to create an account
          await createMailTmAccount(username, password, "mail.tm");
          // Then try logging in again
          const loginData = await loginMailTm(`${username}@mail.tm`, password);
          if (loginData.token) {
            const expires = new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toUTCString();
            cookieStore.set("mail_tm_token", loginData.token, {
              path: "/",
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
            cookieStore.set(
              "mail_tm_account",
              JSON.stringify({
                id: loginData.account.id,
                email: `${username}@mail.tm`,
              }),
              {
                path: "/",
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
              }
            );
          }
        }
      } catch (e) {
        console.error("Error setting up Mail.tm account:", e);
      }
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
