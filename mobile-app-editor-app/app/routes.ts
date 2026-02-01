import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/mobile-app-editor.tsx"),  // Editor at root "/"
    route("/login", "routes/login.tsx"),
    route("/logout", "routes/logout.tsx"),

    // REST API endpoints
    route("/api/configs", "routes/api.configs.tsx"),
    route("/api/configs/:id", "routes/api.configs.$id.tsx"),
] satisfies RouteConfig;
