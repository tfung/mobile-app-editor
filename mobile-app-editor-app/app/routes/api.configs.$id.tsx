import type { Route } from "./+types/api.configs.$id";
import { requireUser } from "../services/auth.server";
import { getConfigById, updateConfig, validateConfig } from "../services/config.server";
import type { HomeScreenConfig } from "../mobile-app-editor/types";

/**
 * GET /api/configs/:id
 * Load a configuration by ID
 */
export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser(request);

  const { id } = params;
  if (!id) {
    return Response.json({ error: "Configuration ID is required" }, { status: 400 });
  }

  const config = getConfigById(id, user.id);

  if (!config) {
    return Response.json({ error: "Configuration not found" }, { status: 404 });
  }

  return Response.json(config, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * PUT /api/configs/:id
 * Update an existing configuration
 */
export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "PUT") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const user = await requireUser(request);
  const { id } = params;

  if (!id) {
    return Response.json({ error: "Configuration ID is required" }, { status: 400 });
  }

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

    const config = updateConfig(id, user.id, data);

    return Response.json(config, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating configuration:", error);

    if (error instanceof Error && error.message.includes("not found or access denied")) {
      return Response.json({ error: "Configuration not found" }, { status: 404 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update configuration" },
      { status: 500 }
    );
  }
}
