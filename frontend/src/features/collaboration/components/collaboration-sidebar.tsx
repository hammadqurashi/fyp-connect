import {
  Users,
  Settings,
  MoreVertical,
  File,
  Download,
  Image,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
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
import { GroupMember, GroupFile } from "../types";

interface CollaborationSidebarProps {
  groupName: string;
  members: GroupMember[];
  files: GroupFile[];
  onDownloadFile: (fileUrl: string) => void;
}

export function CollaborationSidebar({
  groupName,
  members,
  files,
  onDownloadFile,
}: CollaborationSidebarProps) {
  const getStatusColor = (status?: string) => {
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-80 border-r bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold truncate">{groupName}</h2>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="members" className="flex-1 px-2">
        <TabsList className="grid grid-cols-2 mt-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="p-0 space-y-3">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
            >
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={member.profileImg} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(member.firstName, member.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(
                    member.status || "offline"
                  )}`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">
                    {member.firstName} {member.lastName}
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
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No files shared yet
              </p>
            ) : (
              files.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    {file.fileType?.startsWith("image/") ||
                    file.fileName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                      <Image className="h-4 w-4 text-primary" />
                    ) : (
                      <File className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.fileSize)} •{" "}
                      {formatDistanceToNow(file.createdAt)} ago
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownloadFile(file.fileUrl)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
