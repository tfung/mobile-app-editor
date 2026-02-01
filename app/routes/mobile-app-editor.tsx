import type { Route } from "./+types/mobile-app-editor";
import { redirect } from "react-router";
import MobileAppEditor from "../mobile-app-editor";
import { requirePermission, getUser } from "../services/auth.server";
import { getAllConfigs, createConfig } from "../services/config.server";

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

  // Get all configurations for dropdown
  const allConfigs = getAllConfigs(user.id);

  // Always load the latest configuration
  const currentConfig = allConfigs.length > 0 ? allConfigs[0] : null;

  return { user, config: currentConfig, allConfigs };
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

    // Always create a new configuration version (never update)
    const savedConfig = createConfig(user.id, config);
    console.log("✅ New configuration version created:", savedConfig.id);

    return {
      success: true,
      message: "New configuration version saved!",
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
  return <MobileAppEditor user={loaderData?.user} initialConfig={loaderData?.config} allConfigs={loaderData?.allConfigs} />;
}
