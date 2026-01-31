import { EditorProvider } from "./context/EditorContext";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";

export default function MobileAppEditor() {
  return (
    <EditorProvider>
      <div className="min-h-screen grid grid-cols-2 gap-8 p-8">
        <div className="overflow-y-auto">
          <Editor />
        </div>
        <div className="flex justify-center">
          <Preview />
        </div>
      </div>
    </EditorProvider>
  );
}
