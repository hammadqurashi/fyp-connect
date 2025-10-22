import { GraduationCap, Sparkles, TrendingUp } from "lucide-react";
import { DashboardWidget } from "./dashboard-widget";
import { Progress } from "@/shared/components/ui/progress";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";

// Mock data
const mockMatches = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    department: "Computer Science",
    matchPercentage: 92,
    avatar: "/placeholder-avatar-prof1.jpg",
  },
  {
    id: "2",
    name: "Prof. Michael Chen",
    department: "Data Science",
    matchPercentage: 87,
    avatar: "/placeholder-avatar-prof2.jpg",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    department: "AI Research",
    matchPercentage: 81,
    avatar: "/placeholder-avatar-prof3.jpg",
  },
];

export function SupervisorMatchWidget() {
  const topMatch = mockMatches[0];
  const averageMatch = Math.round(
    mockMatches.reduce((acc, match) => acc + match.matchPercentage, 0) /
      mockMatches.length
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
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={topMatch.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {topMatch.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium truncate">
                  {topMatch.name}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Best Match
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {topMatch.department}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {topMatch.matchPercentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Match Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Match Quality</span>
            <span className="font-medium">{averageMatch}%</span>
          </div>
          <Progress value={averageMatch} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">
              {mockMatches.length}
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary">
              {topMatch.matchPercentage}%
            </div>
            <div className="text-xs text-muted-foreground">Best Match</div>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}
