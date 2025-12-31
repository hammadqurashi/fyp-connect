import { DashboardWidget } from "./dashboard-widget";
import { Badge } from "@/shared/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface AdminSupervisionStatsWidgetProps {
  supervisionStats?: {
    pendingRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
    totalRequests: number;
  };
  loading?: boolean;
}

export function AdminSupervisionStatsWidget({
  supervisionStats,
  loading = false,
}: AdminSupervisionStatsWidgetProps) {
  if (loading || !supervisionStats) {
    return (
      <DashboardWidget title="Supervision Requests">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget title="Supervision Requests">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-sm">Pending</span>
          </div>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            {supervisionStats.pendingRequests}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-sm">Accepted</span>
          </div>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            {supervisionStats.acceptedRequests}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm">Rejected</span>
          </div>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            {supervisionStats.rejectedRequests}
          </Badge>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Requests</span>
            <Badge variant="secondary">{supervisionStats.totalRequests}</Badge>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}

