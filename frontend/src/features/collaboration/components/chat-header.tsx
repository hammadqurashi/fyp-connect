import { GroupMember } from "../types";

interface ChatHeaderProps {
  groupName: string;
  members: GroupMember[];
}

export function ChatHeader({ groupName, members }: ChatHeaderProps) {
  const onlineCount = members.filter((m) => m.status === "online").length;

  return (
    <div className="p-4 border-b bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Group Chat</h1>
          <p className="text-sm text-muted-foreground">
            {onlineCount} {onlineCount === 1 ? "member" : "members"} online
          </p>
        </div>
      </div>
    </div>
  );
}

