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
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return new Response("GitHub OAuth not configured", { status: 500 });
  }

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
