import { EditorProvider } from "./context/EditorContext";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";

export default function MobileAppEditor() {
  return (
    <EditorProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 grid grid-cols-2 gap-12 p-8">
        <div className="overflow-y-auto pr-4">
          <Editor />
        </div>
        <div className="flex justify-center items-start">
          <Preview />
        </div>
      </div>
    </EditorProvider>
  );
}
