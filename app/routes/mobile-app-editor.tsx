import type { Route } from "./+types/mobile-app-editor";
import { redirect } from "react-router";
import MobileAppEditor from "../mobile-app-editor";
import { requirePermission, requireUser } from "../services/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mobile App Editor" },
    { name: "description", content: "Edit your mobile app home screen configuration" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Require authentication - redirect to login if not authenticated
  try {
    const user = await requireUser(request);
    return { user };
  } catch (error) {
    // User not authenticated, redirect to login
    const url = new URL(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }
}

export async function action({ request }: Route.ActionArgs) {
  // ✅ Require authentication and "write" permission
  const user = await requirePermission(request, "write");

  const formData = await request.formData();
  const configData = formData.get("config");

  if (!configData) {
    return { success: false, error: "No configuration data provided" };
  }

  try {
    const config = JSON.parse(configData as string);

    console.log("=== Configuration Save Request ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("User:", user.email, `(${user.role})`);
    console.log("Configuration Data:", JSON.stringify(config, null, 2));
    console.log("================================");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: "Configuration saved successfully!",
      savedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error parsing configuration:", error);
    return { success: false, error: "Invalid configuration format" };
  }
}

export default function MobileAppEditorRoute({ loaderData }: Route.ComponentProps) {
  return <MobileAppEditor user={loaderData?.user} />;
}
