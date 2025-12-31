import { FileText, Heart, MessageCircle, TrendingUp } from "lucide-react";
import { DashboardWidget } from "./dashboard-widget";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";

interface SupervisorPostsStatsWidgetProps {
  stats: {
    totalPosts: number;
    activePosts: number;
    totalLikes: number;
    totalComments: number;
    totalEngagement: number;
    avgEngagementPerPost: number;
  };
  loading?: boolean;
}

export function SupervisorPostsStatsWidget({
  stats,
  loading = false,
}: SupervisorPostsStatsWidgetProps) {
  if (loading) {
    return (
      <DashboardWidget title="Posts Statistics">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardWidget>
    );
  }

  const engagementRate =
    stats.totalPosts > 0
      ? Math.round((stats.totalEngagement / (stats.totalPosts * 10)) * 100)
      : 0;

  return (
    <DashboardWidget title="Posts Statistics" actionText="View All" actionHref="/supervisor/posts">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Posts</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalPosts}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activePosts} active
            </p>
          </div>

          <div className="p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Engagement</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalEngagement}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.avgEngagementPerPost} avg/post
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Engagement Rate</span>
            <span className="font-medium">{engagementRate}%</span>
          </div>
          <Progress value={engagementRate} className="h-2" />
        </div>

        <div className="flex items-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">{stats.totalLikes}</span>
            <span className="text-xs text-muted-foreground">Likes</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{stats.totalComments}</span>
            <span className="text-xs text-muted-foreground">Comments</span>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}

