import { Bell, MessageSquare, Calendar, AlertTriangle } from "lucide-react";
import { DashboardWidget } from "./dashboard-widget";
import { Badge } from "@/shared/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
}

interface NotificationsWidgetProps {
  notifications?: Notification[];
  loading?: boolean;
}

const getNotificationIcon = (type?: string) => {
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

export function NotificationsWidget({
  notifications = [],
  loading = false,
}: NotificationsWidgetProps) {
  if (loading) {
    return (
      <DashboardWidget title="Recent Notifications">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardWidget>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayNotifications = notifications.slice(0, 5);

  return (
    <DashboardWidget
      title="Recent Notifications"
      actionText="View All Notifications"
      actionHref="/notifications"
    >
      <div className="space-y-3">
        {displayNotifications.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          displayNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex gap-3 p-2 rounded-md transition-colors ${
                !notification.read ? "bg-accent/50" : "hover:bg-muted/50"
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
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))
        )}

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
