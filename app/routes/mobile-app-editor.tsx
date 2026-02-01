import type { Route } from "./+types/mobile-app-editor";
import { redirect } from "react-router";
import MobileAppEditor from "../mobile-app-editor";
import { requirePermission, getUser } from "../services/auth.server";
import { getLatestConfig, createConfig, updateConfig } from "../services/config.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mobile App Editor" },
    { name: "description", content: "Edit your mobile app home screen configuration" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Check authentication - redirect to login if not authenticated
  const user = await getUser(request);

  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  // Load the latest configuration for this user
  const latestConfig = getLatestConfig(user.id);

  return { user, config: latestConfig };
}

export async function action({ request }: Route.ActionArgs) {
  // ✅ Require authentication and "write" permission
  const user = await requirePermission(request, "write");

  const formData = await request.formData();
  const configData = formData.get("config");
  const configId = formData.get("configId");

  if (!configData) {
    return { success: false, error: "No configuration data provided" };
  }

  try {
    const config = JSON.parse(configData as string);

    let savedConfig;
    if (configId && typeof configId === "string") {
      // Update existing configuration
      savedConfig = updateConfig(configId, user.id, config);
      console.log("✅ Configuration updated:", savedConfig.id);
    } else {
      // Create new configuration
      savedConfig = createConfig(user.id, config);
      console.log("✅ Configuration created:", savedConfig.id);
    }

    return {
      success: true,
      message: "Configuration saved successfully!",
      savedAt: savedConfig.updatedAt,
      configId: savedConfig.id,
    };
  } catch (error) {
    console.error("❌ Error saving configuration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save configuration"
    };
  }
}

export default function MobileAppEditorRoute({ loaderData }: Route.ComponentProps) {
  return <MobileAppEditor user={loaderData?.user} initialConfig={loaderData?.config} />;
}
