import { createCookieSessionStorage } from "react-router";

// Session configuration
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set in environment variables");
}

// Create session storage with HTTP-only cookies
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true, // Prevent XSS attacks
    path: "/",
    sameSite: "lax", // CSRF protection
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

// Session key for user ID
const USER_SESSION_KEY = "userId";

/**
 * Get the session from the request
 */
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

/**
 * Get the user ID from the session
 */
export async function getUserId(request: Request): Promise<string | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

/**
 * Require a user to be authenticated
 * Throws a 401 response if not authenticated
 */
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<string> {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw new Response("Unauthorized", {
      status: 401,
      statusText: "You must be logged in to access this resource",
      headers: {
        "WWW-Authenticate": `Bearer realm="/login?${searchParams}"`,
      },
    });
  }
  return userId;
}

/**
 * Create a new session with the user ID
 */
export async function createUserSession({
  request,
  userId,
  remember = false,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember?: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);

  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 30 // 30 days
          : undefined, // Session cookie (deleted when browser closes)
      }),
      Location: redirectTo,
    },
  });
}

/**
 * Destroy the user session (logout)
 */
export async function logout(request: Request) {
  const session = await getSession(request);
  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
      Location: "/",
    },
  });
}
