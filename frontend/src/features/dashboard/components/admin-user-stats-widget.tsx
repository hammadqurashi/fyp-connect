import { DashboardWidget } from "./dashboard-widget";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Users, UserCheck, UserX } from "lucide-react";

interface AdminUserStatsWidgetProps {
  userStats?: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    totalSupervisors: number;
    activeSupervisors: number;
    inactiveSupervisors: number;
    totalAdmins: number;
    totalUsers: number;
  };
  loading?: boolean;
}

export function AdminUserStatsWidget({
  userStats,
  loading = false,
}: AdminUserStatsWidgetProps) {
  if (loading || !userStats) {
    return (
      <DashboardWidget title="User Statistics">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardWidget>
    );
  }

  const studentActivePercentage =
    userStats.totalStudents > 0
      ? Math.round(
          (userStats.activeStudents / userStats.totalStudents) * 100
        )
      : 0;

  const supervisorActivePercentage =
    userStats.totalSupervisors > 0
      ? Math.round(
          (userStats.activeSupervisors / userStats.totalSupervisors) * 100
        )
      : 0;

  return (
    <DashboardWidget title="User Statistics" actionText="Manage Users" actionHref="/admin/students">
      <div className="space-y-4">
        {/* Students */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Students</span>
            </div>
            <Badge variant="outline">{userStats.totalStudents}</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active</span>
              <span className="font-medium">
                {userStats.activeStudents} / {userStats.totalStudents}
              </span>
            </div>
            <Progress value={studentActivePercentage} className="h-2" />
          </div>
          {userStats.inactiveStudents > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserX className="h-3 w-3" />
              <span>{userStats.inactiveStudents} inactive</span>
            </div>
          )}
        </div>

        {/* Supervisors */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Supervisors</span>
            </div>
            <Badge variant="outline">{userStats.totalSupervisors}</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active</span>
              <span className="font-medium">
                {userStats.activeSupervisors} / {userStats.totalSupervisors}
              </span>
            </div>
            <Progress value={supervisorActivePercentage} className="h-2" />
          </div>
          {userStats.inactiveSupervisors > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserX className="h-3 w-3" />
              <span>{userStats.inactiveSupervisors} inactive</span>
            </div>
          )}
        </div>

        {/* Total Users */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Users</span>
            <Badge variant="secondary">{userStats.totalUsers}</Badge>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}

