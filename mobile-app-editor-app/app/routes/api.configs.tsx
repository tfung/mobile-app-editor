import type { Route } from "./+types/api.configs";
import { requireUser } from "../services/auth.server";
import { getAllConfigs, createConfig, validateConfig } from "../services/config.server";
import type { HomeScreenConfig } from "../mobile-app-editor/types";

/**
 * GET /api/configs
 * List all configurations for the authenticated user
 */
export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const configs = getAllConfigs(user.id);

  return Response.json(configs, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * POST /api/configs
 * Create a new configuration
 */
export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = await requireUser(request);

  try {
    const body = await request.json();
    const { data } = body as { data: HomeScreenConfig };

    if (!data) {
      return Response.json({ error: "Missing configuration data" }, { status: 400 });
    }

    // Validate configuration structure
    if (!validateConfig(data)) {
      return Response.json({ error: "Invalid configuration format" }, { status: 400 });
    }

    const config = createConfig(user.id, data);

    return Response.json(config, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating configuration:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create configuration" },
      { status: 500 }
    );
  }
}
