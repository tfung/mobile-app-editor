import { requireUserId, getUserId } from "./session.server";

/**
 * Simple user type for demo purposes
 * In production, you'd fetch this from a database
 */
export interface User {
  id: string;
  email: string;
}

/**
 * Mock user database
 * In production, replace this with actual database queries
 */
const MOCK_USERS: Record<string, User> = {
  "user-1": {
    id: "user-1",
    email: "user-1@example.com",
  },
  "user-2": {
    id: "user-2",
    email: "user-2@example.com",
  },
  "user-3": {
    id: "user-3",
    email: "user-3@example.com",
  },
};

/**
 * Get user by ID
 * In production, this would query your database
 */
export async function getUserById(id: string): Promise<User | null> {
  return MOCK_USERS[id] || null;
}

/**
 * Verify user credentials
 * In production, this would check against hashed passwords in your database
 */
export async function verifyLogin(
  email: string,
  password: string
): Promise<User | null> {
  // DEMO ONLY - In production, use bcrypt to compare hashed passwords
  const user = Object.values(MOCK_USERS).find((u) => u.email === email);

  // For demo, accept any password for existing users
  if (user && password) {
    return user;
  }

  return null;
}

/**
 * Require authentication and return the user
 */
export async function requireUser(request: Request): Promise<User> {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  return user;
}

/**
 * Get the current user (optional)
 */
export async function getUser(request: Request): Promise<User | null> {
  const userId = await getUserId(request);
  if (!userId) return null;

  return getUserById(userId);
}
