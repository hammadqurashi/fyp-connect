import { DashboardWidget } from "./dashboard-widget";
import { Badge } from "@/shared/components/ui/badge";
import { Users, CheckCircle, XCircle, GraduationCap } from "lucide-react";

interface AdminGroupStatsWidgetProps {
  groupStats?: {
    totalGroups: number;
    formedGroups: number;
    groupsWithSupervisor: number;
    groupsWithoutSupervisor: number;
  };
  loading?: boolean;
}

export function AdminGroupStatsWidget({
  groupStats,
  loading = false,
}: AdminGroupStatsWidgetProps) {
  if (loading || !groupStats) {
    return (
      <DashboardWidget title="Group Statistics">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget title="Group Statistics">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Total Groups</span>
          </div>
          <Badge variant="outline">{groupStats.totalGroups}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Formed</span>
            </div>
            <Badge variant="secondary">{groupStats.formedGroups}</Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>With Supervisor</span>
            </div>
            <Badge variant="secondary">{groupStats.groupsWithSupervisor}</Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <span>Without Supervisor</span>
            </div>
            <Badge variant="outline">{groupStats.groupsWithoutSupervisor}</Badge>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}

