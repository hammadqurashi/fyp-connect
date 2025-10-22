import { Bell, MessageSquare, Calendar, AlertTriangle } from "lucide-react";
import { DashboardWidget } from "./dashboard-widget";
import { Badge } from "@/shared/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

// Mock data
const mockNotifications = [
  {
    id: "1",
    type: "message" as const,
    title: "New group request",
    message: "Alice Johnson wants to join your group",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unread: true,
  },
  {
    id: "2",
    type: "deadline" as const,
    title: "Project proposal due",
    message: "Submission deadline is in 3 days",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    unread: true,
  },
  {
    id: "3",
    type: "announcement" as const,
    title: "New supervisor joined",
    message: "Dr. Sarah Wilson is now available for supervision",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    unread: false,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "message":
      return <MessageSquare className="h-4 w-4" />;
    case "deadline":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case "announcement":
      return <Calendar className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export function NotificationsWidget() {
  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <DashboardWidget
      title="Recent Notifications"
      actionText="View All Notifications"
      actionHref="/notifications"
    >
      <div className="space-y-3">
        {mockNotifications.slice(0, 3).map((notification) => (
          <div
            key={notification.id}
            className={`flex gap-3 p-2 rounded-md transition-colors ${
              notification.unread ? "bg-accent/50" : "hover:bg-muted/50"
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium truncate">
                  {notification.title}
                </h4>
                {notification.unread && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(notification.timestamp, {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}

        {unreadCount > 0 && (
          <div className="text-center pt-2 border-t">
            <Badge variant="secondary" className="text-xs">
              {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
            </Badge>
          </div>
        )}
      </div>
    </DashboardWidget>
  );
}
