import React, { useEffect, useState } from "react";
import { BtnLink } from "../components/ui/btn-link";
import { Bell } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { useSelector } from "react-redux";
import notificationService from "@/core/services/api/notification-service";

const NotificationsBell = () => {
  const user = useSelector((state: any) => state.auth.user);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      notificationService.listMine().then((res) => {
        if (!res.success) return;
        if (!Array.isArray(res.data?.notifications)) return;

        const unreadNotifications = res.data.notifications.reduce(
          (sum, n) => (sum += !n.read ? 1 : 0),
          0
        );

        setUnreadCount(unreadNotifications);
      });
    }
  }, [user]);

  if (!user) {
    return <></>;
  }

  return (
    <BtnLink
      to={user.role === "admin" ? "admin/notifications" : "/notifications"}
      variant="ghost"
      size="sm"
      className="relative"
    >
      <Bell className="h-5 w-5" />
      {!!unreadCount && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
        >
          {unreadCount}
        </Badge>
      )}
    </BtnLink>
  );
};

export default NotificationsBell;
