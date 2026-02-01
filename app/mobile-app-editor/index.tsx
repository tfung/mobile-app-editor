import { Form } from "react-router";
import { EditorProvider } from "./context/EditorContext";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import type { ConfigResponse } from "./types";

interface User {
  id: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

interface MobileAppEditorProps {
  user?: User | null;
  initialConfig?: ConfigResponse | null;
}

export default function MobileAppEditor({ user, initialConfig }: MobileAppEditorProps) {
  return (
    <EditorProvider initialConfig={initialConfig?.data} configId={initialConfig?.id}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header with user info */}
        {user && (
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <Form method="post" action="/logout">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Sign Out
                </button>
              </Form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-12 p-8">
          <div className="overflow-y-auto pr-4">
            <Editor />
          </div>
          <div className="flex justify-center items-start">
            <Preview />
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}
