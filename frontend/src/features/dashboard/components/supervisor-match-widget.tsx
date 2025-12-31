import { Sparkles } from "lucide-react";
import { DashboardWidget } from "./dashboard-widget";
import { Progress } from "@/shared/components/ui/progress";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";

interface SupervisorMatchWidgetProps {
  supervisors?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImg?: string;
    department?: string;
    title?: string;
    matchPercentage: number;
  }>;
  loading?: boolean;
}

export function SupervisorMatchWidget({
  supervisors = [],
  loading = false,
}: SupervisorMatchWidgetProps) {
  if (loading) {
    return (
      <DashboardWidget title="Supervisor Matches">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardWidget>
    );
  }

  if (supervisors.length === 0) {
    return (
      <DashboardWidget
        title="Supervisor Matches"
        actionText="Browse Supervisors"
        actionHref="/supervisors"
      >
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            No supervisors available yet
          </p>
        </div>
      </DashboardWidget>
    );
  }

  const topMatch = supervisors[0];
  const averageMatch = Math.round(
    supervisors.reduce((acc, match) => acc + match.matchPercentage, 0) /
      supervisors.length
  );

  return (
    <DashboardWidget
      title="Supervisor Matches"
      actionText="View All Matches"
      actionHref="/supervisors"
      trend="up"
      trendValue={`${averageMatch}% avg match`}
    >
      <div className="space-y-4">
        {/* Top Match */}
        {topMatch && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={topMatch.profileImg} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {topMatch.firstName?.[0]}
                  {topMatch.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium truncate">
                    {topMatch.firstName} {topMatch.lastName}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Best Match
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {topMatch.department || topMatch.title || "Supervisor"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {topMatch.matchPercentage}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Match Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Average Match</span>
            <span className="font-medium">{averageMatch}%</span>
          </div>
          <Progress value={averageMatch} className="h-2" />
        </div>

        {/* Top 5 Supervisors List */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Top Matches:</p>
          {supervisors.slice(0, 5).map((supervisor, index) => (
            <div
              key={supervisor.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={supervisor.profileImg} />
                  <AvatarFallback className="text-xs">
                    {supervisor.firstName?.[0]}
                    {supervisor.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {supervisor.firstName} {supervisor.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {supervisor.department || supervisor.title}
                  </p>
                </div>
              </div>
              <div className="text-xs font-semibold text-primary">
                {supervisor.matchPercentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardWidget>
  );
}
