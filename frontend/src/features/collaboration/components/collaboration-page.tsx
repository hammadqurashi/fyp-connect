import {
  CollaborationProvider,
  useCollaborationContext,
} from "../context/collaboration-context";
import { CollaborationSidebar } from "./collaboration-sidebar";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { NoGroupView } from "./no-group-view";
import httpService from "@/core/services/local/http-service";
import { AppConfig } from "@/core/config";

function CollaborationContent() {
  const { state, loadFiles, isConnected } = useCollaborationContext();

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
        <p className="text-muted-foreground">Loading collaboration...</p>
      </div>
    );
  }

  if (!state.hasGroup || !state.group) {
    return <NoGroupView />;
  }

  const handleDownloadFile = async (fileUrl: string) => {
    try {
      window.open(`${AppConfig.baseUrl}${fileUrl}`, "_blank");
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      <CollaborationSidebar
        groupName={state.group.name}
        members={state.members}
        files={state.files}
        onDownloadFile={handleDownloadFile}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader groupName={state.group.name} members={state.members} />

        <ChatMessages messages={state.messages} />

        <ChatInput />
      </div>
    </div>
  );
}

export default function CollaborationPage() {
  return (
    <CollaborationProvider>
      <CollaborationContent />
    </CollaborationProvider>
  );
}
