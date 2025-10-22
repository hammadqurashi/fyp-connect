import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Users,
  Settings,
  Search,
  Phone,
  Video,
  MoreVertical,
  File,
  Image,
  Download,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import io from "socket.io-client";
import httpService from "@/core/services/local/http-service";

// Mock data
interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: "text" | "file" | "image";
  fileName?: string;
  fileSize?: string;
  isCurrentUser?: boolean;
}

interface GroupMember {
  id: string;
  name: string;
  role: "student" | "supervisor";
  status: "online" | "away" | "offline";
  avatar?: string;
  lastSeen?: Date;
}

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "Dr. Sarah Johnson",
    content:
      "Welcome to our FYP collaboration space! I'm excited to work with you all on this AI ethics project. Please feel free to share your initial thoughts and questions.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: "text",
  },
  {
    id: "2",
    sender: "Alice Johnson",
    content:
      "Thank you Dr. Johnson! I've been reading about bias detection algorithms and I'm particularly interested in exploring fairness metrics for medical diagnosis systems.",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    type: "text",
    isCurrentUser: true,
  },
  {
    id: "3",
    sender: "Bob Smith",
    content:
      "I found some interesting research papers on healthcare AI bias. Let me share them with the group.",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    type: "text",
  },
  {
    id: "4",
    sender: "Bob Smith",
    content: "research-papers-healthcare-ai.pdf",
    timestamp: new Date(Date.now() - 55 * 60 * 1000),
    type: "file",
    fileName: "research-papers-healthcare-ai.pdf",
    fileSize: "2.4 MB",
  },
  {
    id: "5",
    sender: "Carol Williams",
    content:
      "Great resources Bob! I've also created a preliminary project timeline. What do you all think?",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    type: "text",
  },
  {
    id: "6",
    sender: "Carol Williams",
    content: "project-timeline.png",
    timestamp: new Date(Date.now() - 40 * 60 * 1000),
    type: "image",
    fileName: "project-timeline.png",
    fileSize: "856 KB",
  },
  {
    id: "7",
    sender: "Dr. Sarah Johnson",
    content:
      "This looks excellent! I'd like to schedule a meeting next week to discuss the methodology in detail. Could everyone check their availability?",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: "text",
  },
];

const mockGroupMembers: GroupMember[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    role: "supervisor",
    status: "online",
  },
  {
    id: "2",
    name: "Alice Johnson",
    role: "student",
    status: "online",
  },
  {
    id: "3",
    name: "Bob Smith",
    role: "student",
    status: "away",
    lastSeen: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: "4",
    name: "Carol Williams",
    role: "student",
    status: "online",
  },
];

export default function Collaboration() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<any>(null);
  const [groupId, setGroupId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch current user's group
    (async () => {
      const res = await httpService.get<any>("/group/my");
      if (res.success && res.data?.group?._id) {
        const id = res.data.group._id;
        setGroupId(id);
        // Load history
        const history = await httpService.get<any>(`/group/${id}/messages`);
        if (history.success) {
          const items = (history.data?.messages || []).map((m: any) => ({
            id: m._id,
            sender: m.sender,
            content: m.content,
            timestamp: new Date(m.createdAt),
            type: m.type,
            isCurrentUser: false,
          }));
          setMessages((prev) => [...prev, ...items]);
        }
        // Connect socket and join room
        const base = (import.meta as any).env.VITE_APP_BASE_URL || window.location.origin;
        const socket = io(`${base}`);
        socketRef.current = socket;
        socket.emit("join_group", { groupId: id });
        socket.on("group_message", ({ message, ts, senderId }) => {
          setMessages((prev) => [
            ...prev,
            {
              id: String(ts),
              sender: senderId || "Group",
              content: message,
              timestamp: new Date(ts),
              type: "text",
            },
          ]);
        });
      }
    })();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() || selectedFile) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: "Alice Johnson", // Current user
        content: selectedFile ? selectedFile.name : newMessage,
        timestamp: new Date(),
        type: selectedFile
          ? selectedFile.type.startsWith("image/")
            ? "image"
            : "file"
          : "text",
        fileName: selectedFile?.name,
        fileSize: selectedFile
          ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`
          : undefined,
        isCurrentUser: true,
      };

      setMessages((prev) => [...prev, message]);
      if (socketRef.current && groupId && !selectedFile) {
        socketRef.current.emit("group_message", { groupId, message: newMessage, senderId: "me" });
      }
      setNewMessage("");
      setSelectedFile(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar - Group Members */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">AI Ethics Research Group</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Group Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Add Members
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="members" className="flex-1 px-2">
          <TabsList className="grid grid-cols-2 mt-4 ">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="p-0 space-y-3">
            {mockGroupMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(
                      member.status
                    )}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {member.name}
                    </p>
                    <Badge
                      variant={
                        member.role === "supervisor" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.status === "online"
                      ? "Active now"
                      : member.lastSeen
                      ? `Last seen ${formatDistanceToNow(member.lastSeen)} ago`
                      : "Offline"}
                  </p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="files" className="p-0">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  <File className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    research-papers-healthcare-ai.pdf
                  </p>
                  <p className="text-xs text-muted-foreground">
                    2.4 MB • 2 hours ago
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  <Image className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    project-timeline.png
                  </p>
                  <p className="text-xs text-muted-foreground">
                    856 KB • 1 hour ago
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Group Chat</h1>
              <p className="text-sm text-muted-foreground">
                {mockGroupMembers.filter((m) => m.status === "online").length}{" "}
                members online
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.isCurrentUser ? "justify-end" : ""
                }`}
              >
                {!message.isCurrentUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(message.sender)}
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
                        {message.sender}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(message.timestamp)} ago
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
                      <p className="text-sm">{message.content}</p>
                    )}

                    {message.type === "file" && (
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">
                            {message.fileName}
                          </p>
                          <p className="text-xs opacity-70">
                            {message.fileSize}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={
                            message.isCurrentUser
                              ? "text-primary-foreground hover:bg-primary-foreground/10"
                              : ""
                          }
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {message.type === "image" && (
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">
                            {message.fileName}
                          </p>
                          <p className="text-xs opacity-70">
                            {message.fileSize}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={
                            message.isCurrentUser
                              ? "text-primary-foreground hover:bg-primary-foreground/10"
                              : ""
                          }
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {message.isCurrentUser && (
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(message.timestamp)} ago
                      </span>
                    </div>
                  )}
                </div>

                {message.isCurrentUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(message.sender)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-card">
          {selectedFile && (
            <div className="mb-3 p-2 bg-muted rounded-lg flex items-center gap-2">
              <File className="h-4 w-4" />
              <span className="text-sm flex-1">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                ×
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
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && !selectedFile}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
