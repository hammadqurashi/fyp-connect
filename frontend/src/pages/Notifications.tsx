import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import notificationService from "@/core/services/api/notification-service";
import { useToast } from "@/shared/components/ui/use-toast";

interface Notification {
  id: string;
  type: "message" | "deadline" | "announcement" | "system";
  title: string;
  message: string;
  timestamp: Date;
  unread: boolean;
  priority: "low" | "medium" | "high";
  category: string;
  actionUrl?: string;
}

// Fallback sample
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "New Group Request",
    message:
      "Alice Johnson has requested to join your AI Research Group. You can review their profile and accept or decline the request.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unread: true,
    priority: "high",
    category: "Group Management",
    actionUrl: "/group-formation",
  },
  {
    id: "2",
    type: "deadline",
    title: "Project Proposal Deadline Approaching",
    message:
      "Your project proposal is due in 3 days (January 30, 2024). Make sure to submit all required documents through the portal.",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    unread: true,
    priority: "high",
    category: "Deadlines",
  },
  {
    id: "3",
    type: "announcement",
    title: "New Supervisor Available",
    message:
      "Dr. Sarah Wilson has joined our platform and is now accepting students for supervision. Her research focuses on Machine Learning and Computer Vision.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    unread: false,
    priority: "medium",
    category: "Platform Updates",
    actionUrl: "/supervisors",
  },
  {
    id: "4",
    type: "system",
    title: "Profile Update Required",
    message:
      "Please update your profile with current skills and interests to improve supervisor matching accuracy.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    unread: false,
    priority: "low",
    category: "Profile",
  },
  {
    id: "5",
    type: "message",
    title: "Supervisor Response Received",
    message:
      "Prof. Michael Chen has responded to your supervision request. Check your messages for details about the next steps.",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    unread: false,
    priority: "medium",
    category: "Supervisor Communications",
    actionUrl: "/collaboration",
  },
  {
    id: "6",
    type: "deadline",
    title: "Weekly Progress Report Due",
    message:
      "Submit your weekly progress report by Friday. Include project milestones, challenges, and next steps.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    unread: false,
    priority: "medium",
    category: "Progress Tracking",
  },
  {
    id: "7",
    type: "announcement",
    title: "Platform Maintenance Notice",
    message:
      "The platform will undergo scheduled maintenance on Sunday, February 4th from 2:00 AM to 4:00 AM. All services will be temporarily unavailable.",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    unread: false,
    priority: "low",
    category: "Platform Updates",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const res = await notificationService.listMine();
      if (res.success) {
        const items = (res.data?.notifications || []).map((n: any) => ({
          id: n._id,
          type: (n.meta?.type || "announcement") as Notification["type"],
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt),
          unread: !n.read,
          priority: (n.meta?.priority || "low") as Notification["priority"],
          category: n.meta?.category || "General",
          actionUrl: n.meta?.actionUrl,
        }));
        setNotifications(items);
      } else if (res.msg) {
        toast({
          title: "Failed to load notifications",
          description: res.msg,
          variant: "destructive",
        });
      }
    })();
  }, []);

  const categories = Array.from(new Set(notifications.map((n) => n.category)));
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = async (id: string) => {
    const res = await notificationService.markRead(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, unread: false }
            : notification
        )
      );
    } else if (res.msg) {
      toast({
        title: "Failed to mark as read",
        description: res.msg,
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const baseClass = "h-5 w-5";
    const colorClass =
      priority === "high"
        ? "text-red-600"
        : priority === "medium"
        ? "text-orange-600"
        : "text-muted-foreground";

    switch (type) {
      case "message":
        return <MessageSquare className={`${baseClass} ${colorClass}`} />;
      case "deadline":
        return <AlertTriangle className={`${baseClass} ${colorClass}`} />;
      case "announcement":
        return <Info className={`${baseClass} ${colorClass}`} />;
      case "system":
        return <Bell className={`${baseClass} ${colorClass}`} />;
      default:
        return <Bell className={`${baseClass} ${colorClass}`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-orange-500 bg-orange-50";
      case "low":
        return "border-l-gray-300 bg-gray-50";
      default:
        return "border-l-border";
    }
  };

  const filteredNotifications = notifications
    .filter((notification) => {
      if (filter === "unread") return notification.unread;
      if (filter === "read") return !notification.unread;
      return true;
    })
    .filter(
      (notification) =>
        categoryFilter === "" ||
        categoryFilter === "all" ||
        notification.category === categoryFilter
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with important announcements and deadlines
          </p>
        </div>

        <div className="flex gap-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await notificationService.markAllRead();
                markAllAsRead();
              }}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-primary">{unreadCount}</p>
              </div>
              <Badge
                variant="default"
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {notifications.filter((n) => n.priority === "high").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    notifications.filter(
                      (n) =>
                        Date.now() - n.timestamp.getTime() <=
                        7 * 24 * 60 * 60 * 1000
                    ).length
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={filter} onValueChange={setFilter} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread{" "}
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`border-l-4 transition-all duration-200 ${getPriorityColor(
              notification.priority
            )} ${notification.unread ? "shadow-md" : "hover:shadow-sm"}`}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(
                    notification.type,
                    notification.priority
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-medium ${
                            notification.unread
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(notification.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {notification.category}
                        </Badge>
                        <Badge
                          variant={
                            notification.priority === "high"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {notification.priority} priority
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {notification.unread && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}

                      {notification.actionUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={notification.actionUrl}>View</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
          <p className="text-muted-foreground">
            {filter === "unread"
              ? "All caught up! No unread notifications."
              : "No notifications match your current filters."}
          </p>
        </div>
      )}
    </div>
  );
}
