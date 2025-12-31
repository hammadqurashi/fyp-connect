import { DashboardWidget } from "./dashboard-widget";
import { Badge } from "@/shared/components/ui/badge";
import { Users, GraduationCap, FolderOpen, Rss, TrendingUp } from "lucide-react";

interface AdminRecentActivityWidgetProps {
  recentActivity?: {
    recentStudents: number;
    recentSupervisors: number;
    recentGroups: number;
    recentPosts: number;
  };
  loading?: boolean;
}

export function AdminRecentActivityWidget({
  recentActivity,
  loading = false,
}: AdminRecentActivityWidgetProps) {
  if (loading || !recentActivity) {
    return (
      <DashboardWidget title="Recent Activity (7 days)">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget title="Recent Activity (7 days)">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm">New Students</span>
          </div>
          <Badge variant="outline">{recentActivity.recentStudents}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-success" />
            <span className="text-sm">New Supervisors</span>
          </div>
          <Badge variant="outline">{recentActivity.recentSupervisors}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-warning" />
            <span className="text-sm">New Groups</span>
          </div>
          <Badge variant="outline">{recentActivity.recentGroups}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rss className="h-4 w-4 text-info" />
            <span className="text-sm">New Posts</span>
          </div>
          <Badge variant="outline">{recentActivity.recentPosts}</Badge>
        </div>
      </div>
    </DashboardWidget>
  );
}

