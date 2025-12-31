import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StatsCard } from "@/features/dashboard/components/stats-card";
import { StudentGroupStatusWidget } from "@/features/dashboard/components/student-group-status-widget";
import { SupervisorPostsStatsWidget } from "@/features/dashboard/components/supervisor-posts-stats-widget";
import { SupervisorRequestsWidget } from "@/features/dashboard/components/supervisor-requests-widget";
import { StudentDashboardHeader } from "@/features/dashboard/components/student-dashboard-header";
import { SupervisorDashboardHeader } from "@/features/dashboard/components/supervisor-dashboard-header";
import { QuickLinksWidget } from "@/features/dashboard/components/quick-links-widget";
import { SupervisorFeedWidget } from "@/features/dashboard/components/supervisor-feed-widget";
import { NotificationsWidget } from "@/features/dashboard/components/notifications-widget";
import { SupervisorMatchWidget } from "@/features/dashboard/components/supervisor-match-widget";
import { TrendingUp, Users, Calendar, Target } from "lucide-react";
import studentService from "@/core/services/api/student-service";
import supervisorService from "@/core/services/api/supervisor-service";
import { useToast } from "@/shared/components/ui/use-toast";
import { Card, CardContent } from "@/shared/components/ui/card";

export default function Dashboard() {
  const user = useSelector((state: any) => state.auth.user);
  const role = user?.role;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!role) return;

      setLoading(true);
      try {
        let res;
        if (role === "student") {
          res = await studentService.getDashboard();
        } else if (role === "supervisor") {
          res = await supervisorService.getDashboard();
        } else {
          return;
        }

        if (res.success && res.data) {
          setDashboardData(res.data);
        } else {
          toast({
            title: "Error",
            description: res.msg || "Failed to load dashboard",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [role, toast]);

  if (!role) {
    return null;
  }

  // Student Dashboard
  if (role === "student") {
    const group = dashboardData?.group;
    const groupStats = dashboardData?.groupStats || {
      memberCount: 0,
      maxMembers: 4,
      hasSupervisor: false,
      isFormed: false,
    };
    const topSupervisors = dashboardData?.topSupervisors || [];
    const recentNotifications = dashboardData?.recentNotifications || [];
    const recentPosts = dashboardData?.recentPosts || [];

    return (
      <div className="space-y-6">
        <StudentDashboardHeader
          firstName={dashboardData?.user?.firstName || "Student"}
          lastName={dashboardData?.user?.lastName || ""}
        />

        {/* Main Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <StudentGroupStatusWidget
            group={group}
            stats={groupStats}
            loading={loading}
          />
          <SupervisorMatchWidget
            supervisors={topSupervisors}
            loading={loading}
          />
          <NotificationsWidget
            notifications={recentNotifications}
            loading={loading}
          />
        </div>

        {/* Supervisor Feed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SupervisorFeedWidget posts={recentPosts} loading={loading} />
          </div>
          <div className="space-y-4">
            <QuickLinksWidget role="student" />
          </div>
        </div>
      </div>
    );
  }

  // Supervisor Dashboard
  if (role === "supervisor") {
    const stats = dashboardData?.stats || {
      totalPosts: 0,
      activePosts: 0,
      totalLikes: 0,
      totalComments: 0,
      totalEngagement: 0,
      avgEngagementPerPost: 0,
      pendingRequests: 0,
      supervisedGroups: 0,
      unreadNotifications: 0,
    };
    const recentNotifications = dashboardData?.recentNotifications || [];

    return (
      <div className="space-y-6">
        <SupervisorDashboardHeader
          firstName={dashboardData?.user?.firstName || "Supervisor"}
          lastName={dashboardData?.user?.lastName || ""}
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Posts"
            value={stats.totalPosts || 0}
            icon={<TrendingUp className="h-8 w-8" />}
            gradient="primary"
          />
          <StatsCard
            title="Total Engagement"
            value={stats.totalEngagement || 0}
            icon={<Users className="h-8 w-8" />}
            gradient="success"
          />
          <StatsCard
            title="Pending Requests"
            value={stats.pendingRequests || 0}
            icon={<Calendar className="h-8 w-8" />}
            gradient="warning"
          />
          <StatsCard
            title="Supervised Groups"
            value={stats.supervisedGroups || 0}
            icon={<Target className="h-8 w-8" />}
            gradient="info"
          />
        </div>

        {/* Main Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <SupervisorPostsStatsWidget stats={stats} loading={loading} />
          <SupervisorRequestsWidget
            pendingRequests={stats.pendingRequests || 0}
            supervisedGroups={stats.supervisedGroups || 0}
            loading={loading}
          />
          <NotificationsWidget
            notifications={recentNotifications}
            loading={loading}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {dashboardData?.topPost && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Top Performing Post</h3>
                  <div className="space-y-2">
                    <p className="font-medium">{dashboardData.topPost.title}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{dashboardData.topPost.likesCount} likes</span>
                      <span>{dashboardData.topPost.commentsCount} comments</span>
                      <span>{dashboardData.topPost.totalEngagement} total</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="space-y-4">
            <QuickLinksWidget role="supervisor" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
