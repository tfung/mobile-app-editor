import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    // index("routes/home.tsx"),
    // route("mobile-app-editor", "routes/mobile-app-editor.tsx")
    index("routes/mobile-app-editor.tsx"),
    route("home", "routes/home.tsx")
] satisfies RouteConfig;
