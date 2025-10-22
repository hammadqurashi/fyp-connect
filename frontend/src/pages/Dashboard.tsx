import { GroupStatusWidget } from "@/features/dashboard/components/group-status-widget";
import { SupervisorMatchWidget } from "@/features/dashboard/components/supervisor-match-widget";
import { NotificationsWidget } from "@/features/dashboard/components/notifications-widget";
import { SupervisorFeedWidget } from "@/features/dashboard/components/supervisor-feed-widget";
import { Button } from "@/shared/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, John!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your final year project
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary/80">Project Progress</p>
              <p className="text-2xl font-bold text-primary">68%</p>
            </div>
            <div className="text-primary/60">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-lg p-4 border border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-success/80">Group Members</p>
              <p className="text-2xl font-bold text-success">3/4</p>
            </div>
            <div className="text-success/60">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-lg p-4 border border-warning/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-warning/80">Days to Deadline</p>
              <p className="text-2xl font-bold text-warning">45</p>
            </div>
            <div className="text-warning/60">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-info/10 to-info/5 rounded-lg p-4 border border-info/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-info/80">Supervisor Match</p>
              <p className="text-2xl font-bold text-info">92%</p>
            </div>
            <div className="text-info/60">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <GroupStatusWidget />
        <SupervisorMatchWidget />
        <NotificationsWidget />
      </div>

      {/* Supervisor Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SupervisorFeedWidget />
        </div>
        <div className="space-y-4">
          {/* Quick Links */}
          <div className="bg-gradient-to-br from-accent/50 to-background rounded-lg p-4 border">
            <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <a href="/group-formation">Create New Group</a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <a href="/supervisors">Browse Supervisors</a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <a href="/guidelines">View Guidelines</a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <a href="/collaboration">Open Chat</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
