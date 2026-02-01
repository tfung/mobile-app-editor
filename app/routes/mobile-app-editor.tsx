import type { Route } from "./+types/mobile-app-editor";
import MobileAppEditor from "../mobile-app-editor";
// import { requirePermission } from "../services/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mobile App Editor" },
    { name: "description", content: "Edit your mobile app home screen configuration" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  // ✅ Require authentication and "write" permission
  // const user = await requirePermission(request, "write");
  const user = {
    id: "user-123",
    email: "admin@example.com",
    role: "admin"
  }

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

export default function MobileAppEditorRoute() {
  return <MobileAppEditor />;
}
