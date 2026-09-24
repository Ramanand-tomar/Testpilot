import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  
  if (!clientId) {
    return new Response("GitHub OAuth CLIENT_ID not configured", { status: 500 });
  }

  // Derive redirectUri dynamically if not explicitly specified
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const fallbackRedirectUri = `${proto}://${host}/api/github/callback`;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || fallbackRedirectUri;

  const nonce = crypto.randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("github_oauth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/"
  });

  const state = userId + ":" + nonce;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo read:user",
    state: state,
  });

  redirect("https://github.com/login/oauth/authorize?" + params.toString());
}
