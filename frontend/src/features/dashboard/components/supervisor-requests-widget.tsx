import { Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { DashboardWidget } from "./dashboard-widget";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Link } from "react-router-dom";

interface SupervisorRequestsWidgetProps {
  pendingRequests: number;
  supervisedGroups: number;
  loading?: boolean;
}

export function SupervisorRequestsWidget({
  pendingRequests,
  supervisedGroups,
  loading = false,
}: SupervisorRequestsWidgetProps) {
  if (loading) {
    return (
      <DashboardWidget title="Supervision Requests">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget
      title="Supervision Requests"
      actionText="View All"
      actionHref="/supervisor/invitations"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-medium">Pending Requests</p>
              <p className="text-xs text-muted-foreground">Awaiting your response</p>
            </div>
          </div>
          <Badge variant="outline" className="text-warning border-warning">
            {pendingRequests}
          </Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-medium">Supervised Groups</p>
              <p className="text-xs text-muted-foreground">Currently supervising</p>
            </div>
          </div>
          <Badge variant="outline" className="text-success border-success">
            {supervisedGroups}
          </Badge>
        </div>

        {pendingRequests > 0 && (
          <Button size="sm" className="w-full" asChild>
            <Link to="/supervisor/invitations">
              Review Requests
            </Link>
          </Button>
        )}
      </div>
    </DashboardWidget>
  );
}

