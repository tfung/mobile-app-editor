import { Editor } from "./editor";
import { Preview } from "./preview";

export default function MobileAppEditor() {
  return (
    <div className="h-screen grid grid-cols-2 gap-0">
      <Editor />
      <Preview />
    </div>
  );
}
