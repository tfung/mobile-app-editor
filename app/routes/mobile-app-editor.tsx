import type { Route } from "./+types/mobile-app-editor";
import MobileAppEditor from "../mobile-app-editor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mobile App Editor" },
    { name: "description", content: "Edit your mobile app home screen configuration" },
  ];
}

export default function MobileAppEditorRoute() {
  return <MobileAppEditor />;
}
