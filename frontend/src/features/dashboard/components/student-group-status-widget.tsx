import { Users, UserPlus, CheckCircle, AlertCircle } from "lucide-react";
import { DashboardWidget } from "./dashboard-widget";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Link } from "react-router-dom";

interface StudentGroupStatusWidgetProps {
  group: any;
  stats: {
    memberCount: number;
    maxMembers: number;
    hasSupervisor: boolean;
    isFormed: boolean;
  };
  loading?: boolean;
}

export function StudentGroupStatusWidget({
  group,
  stats,
  loading = false,
}: StudentGroupStatusWidgetProps) {
  if (loading) {
    return (
      <DashboardWidget title="Group Formation">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardWidget>
    );
  }

  if (!group) {
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
            <Button size="sm" asChild>
              <Link to="/group-formation">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Group
              </Link>
            </Button>
          </div>
        </div>
      </DashboardWidget>
    );
  }

  const allMembers = [
    group.createdBy,
    ...(group.members || []),
  ].filter(Boolean);

  return (
    <DashboardWidget
      title="Your Group"
      actionText="View Details"
      actionHref="/group-formation"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">{group.name || "Unnamed Group"}</h3>
            <p className="text-xs text-muted-foreground">
              {stats.memberCount}/{stats.maxMembers} members
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              stats.isFormed
                ? "text-success border-success"
                : "text-warning border-warning"
            }
          >
            {stats.isFormed ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Formed
              </>
            ) : (
              <>
                <AlertCircle className="mr-1 h-3 w-3" />
                In Progress
              </>
            )}
          </Badge>
        </div>

        {group.supervisor && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <Avatar className="w-6 h-6">
              <AvatarImage src={group.supervisor.profileImg} />
              <AvatarFallback className="text-xs">
                {group.supervisor.firstName?.[0]}
                {group.supervisor.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {group.supervisor.firstName} {group.supervisor.lastName}
              </p>
              <p className="text-xs text-muted-foreground">Supervisor</p>
            </div>
          </div>
        )}

        <div className="flex -space-x-2">
          {allMembers.slice(0, 4).map((member: any, index: number) => (
            <Avatar
              key={member._id || index}
              className="w-8 h-8 border-2 border-background"
            >
              <AvatarImage src={member.profileImg} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {member.firstName?.[0]}
                {member.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          ))}
          {stats.memberCount < stats.maxMembers && (
            <div className="w-8 h-8 border-2 border-background rounded-full bg-muted flex items-center justify-center">
              <UserPlus className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </DashboardWidget>
  );
}

