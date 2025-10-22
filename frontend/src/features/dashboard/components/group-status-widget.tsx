import { Users, UserPlus, CheckCircle } from "lucide-react";
import { DashboardWidget } from "./dashboard-widget";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

// Mock data
const mockGroup = {
  id: "1",
  name: "AI Research Group",
  memberCount: 3,
  maxMembers: 4,
  status: "active" as const,
};

export function GroupStatusWidget() {
  const hasGroup = true; // Mock condition

  if (!hasGroup) {
    return (
      <DashboardWidget title="Group Formation">
        <div className="text-center py-6 space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You haven't joined or created a group yet
            </p>
            <Button size="sm" className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget
      title="Your Group"
      actionText="View Group Details"
      actionHref="/group-formation"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">{mockGroup.name}</h3>
            <p className="text-xs text-muted-foreground">
              {mockGroup.memberCount}/{mockGroup.maxMembers} members
            </p>
          </div>
          <Badge variant="outline" className="text-success border-success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </Badge>
        </div>

        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <Avatar key={i} className="w-8 h-8 border-2 border-background">
              <AvatarImage src={`/placeholder-avatar-${i}.jpg`} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                U{i}
              </AvatarFallback>
            </Avatar>
          ))}
          {mockGroup.memberCount < mockGroup.maxMembers && (
            <div className="w-8 h-8 border-2 border-background rounded-full bg-muted flex items-center justify-center">
              <UserPlus className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </DashboardWidget>
  );
}
