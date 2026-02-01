import { Form, useActionData, useSearchParams } from "react-router";
import type { Route } from "./+types/login";
import { verifyLogin } from "../services/auth.server";
import { createUserSession, getUserId } from "../services/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) {
    // Already logged in, redirect to editor
    return new Response(null, {
      status: 302,
      headers: { Location: "/" },
    });
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo") || "/";
  const remember = formData.get("remember") === "on";

  if (typeof email !== "string" || typeof password !== "string") {
    return {
      error: "Invalid form data",
    };
  }

  if (!email || !password) {
    return {
      error: "Email and password are required",
    };
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return {
      error: "Invalid email or password",
    };
  }

  return createUserSession({
    request,
    userId: user.id,
    remember,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  });
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access the Mobile App Editor</p>
          </div>

          {/* Demo Credentials Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</p>
            <div className="text-sm text-blue-800 space-y-1">
              <p>📧 <strong>admin@example.com</strong> (any password) - Full access</p>
              <p>📧 <strong>editor@example.com</strong> (any password) - Read/write</p>
              <p>📧 <strong>viewer@example.com</strong> (any password) - Read only</p>
            </div>
          </div>

          {actionData?.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{actionData.error}</p>
            </div>
          )}

          <Form method="post" className="space-y-6">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter any password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Sign In
            </button>
          </Form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          This is a demo. In production, use real authentication with hashed passwords.
        </p>
      </div>
    </div>
  );
}
