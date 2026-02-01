import { requireUserId, getUserId } from "./session.server";

/**
 * Simple user type for demo purposes
 * In production, you'd fetch this from a database
 */
export interface User {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

/**
 * Mock user database
 * In production, replace this with actual database queries
 */
const MOCK_USERS: Record<string, User> = {
  "user-1": {
    id: "user-1",
    email: "admin@example.com",
    role: "admin",
  },
  "user-2": {
    id: "user-2",
    email: "editor@example.com",
    role: "editor",
  },
  "user-3": {
    id: "user-3",
    email: "viewer@example.com",
    role: "viewer",
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

/**
 * Check if user has permission
 */
export function hasPermission(user: User, permission: string): boolean {
  // Simple role-based permissions
  const permissions: Record<string, string[]> = {
    admin: ["read", "write", "delete", "manage"],
    editor: ["read", "write"],
    viewer: ["read"],
  };

  return permissions[user.role]?.includes(permission) || false;
}

/**
 * Require a specific permission
 */
export async function requirePermission(
  request: Request,
  permission: string
): Promise<User> {
  const user = await requireUser(request);

  if (!hasPermission(user, permission)) {
    throw new Response("Forbidden", {
      status: 403,
      statusText: `You don't have permission to ${permission}`,
    });
  }

  return user;
}
