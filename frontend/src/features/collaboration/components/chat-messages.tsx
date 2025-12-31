import { useRef, useEffect } from "react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { File, Image as ImageIcon, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ChatMessage } from "../types";
import { AppConfig } from "@/core/config";

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (message: ChatMessage) => {
    if (message.fileUrl) {
      window.open(`${AppConfig.baseUrl}${message.fileUrl}`, "_blank");
    }
  };

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex gap-3 ${
              message.isCurrentUser ? "justify-end" : ""
            }`}
          >
            {!message.isCurrentUser && (
              <Avatar className="w-8 h-8">
                <AvatarImage src={message.sender.profileImg} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(
                    message.sender.firstName,
                    message.sender.lastName
                  )}
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={`max-w-[70%] ${
                message.isCurrentUser ? "order-first" : ""
              }`}
            >
              {!message.isCurrentUser && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {message.sender.firstName} {message.sender.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(message.createdAt)} ago
                  </span>
                </div>
              )}

              <div
                className={`rounded-lg p-3 ${
                  message.isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.type === "text" && (
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}

                {message.type === "file" && (
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">{message.fileName}</p>
                      {message.fileSize && (
                        <p className="text-xs opacity-70">
                          {formatFileSize(message.fileSize)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        message.isCurrentUser
                          ? "text-primary-foreground hover:bg-primary-foreground/10"
                          : ""
                      }
                      onClick={() => handleDownload(message)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {message.type === "image" && (
                  <div className="space-y-2">
                    {message.fileUrl && (
                      <img
                        src={`${AppConfig.baseUrl}${message.fileUrl}`}
                        alt={message.fileName || "Image"}
                        className="max-w-full rounded-lg"
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">
                          {message.fileName}
                        </p>
                        {message.fileSize && (
                          <p className="text-xs opacity-70">
                            {formatFileSize(message.fileSize)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={
                          message.isCurrentUser
                            ? "text-primary-foreground hover:bg-primary-foreground/10"
                            : ""
                        }
                        onClick={() => handleDownload(message)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {message.isCurrentUser && (
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(message.createdAt)} ago
                  </span>
                </div>
              )}
            </div>

            {message.isCurrentUser && (
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(
                    message.sender.firstName,
                    message.sender.lastName
                  )}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
