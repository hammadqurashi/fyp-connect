import { useState, useRef } from "react";
import { Send, Paperclip, File, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ResizableTextarea } from "@/shared/components/ui/resizable-textarea";
import { useCollaboration } from "../hooks/use-collaboration";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isConnected } = useCollaboration();

  const handleSend = async () => {
    if ((!message.trim() && !selectedFile) || !isConnected) return;

    try {
      await sendMessage(message, selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="p-4 border-t bg-card">
      {selectedFile && (
        <div className="mb-3 p-2 bg-muted rounded-lg flex items-center gap-2">
          <File className="h-4 w-4" />
          <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={!isConnected}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <ResizableTextarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1"
          disabled={!isConnected}
        />

        <Button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedFile) || !isConnected}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

