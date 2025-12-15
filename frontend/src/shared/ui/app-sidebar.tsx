import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Rss,
  Bell,
  MessageSquare,
  Settings,
  BookOpen,
  UserPlus,
  Search,
  Edit3,
  Shield,
  UserCircle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Badge } from "@/shared/components/ui/badge";

// Student navigation items
const studentNavigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Group Formation",
    url: "/group-formation",
    icon: Users,
    badge: null,
  },
  {
    title: "Find Supervisors",
    url: "/supervisors",
    icon: GraduationCap,
    badge: null,
  },
  {
    title: "Supervisor Feed",
    url: "/supervisor-feed",
    icon: Rss,
    badge: "New",
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    badge: null,
  },
  {
    title: "Collaboration",
    url: "/collaboration",
    icon: MessageSquare,
    badge: null,
  },
  {
    title: "My Profile",
    url: "/profile-setup",
    icon: UserCircle,
    badge: null,
  },
];

// Supervisor navigation items
const supervisorNavigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "My Posts",
    url: "/supervisor/posts",
    icon: Edit3,
    badge: null,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    badge: null,
  },
  {
    title: "Collaboration",
    url: "/collaboration",
    icon: MessageSquare,
    badge: null,
  },
  {
    title: "My Profile",
    url: "/profile-setup",
    icon: UserCircle,
    badge: null,
  },
];

// Admin navigation items
const adminNavigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Manage Students",
    url: "/admin/students",
    icon: Users,
    badge: null,
  },
  {
    title: "Manage Supervisors",
    url: "/admin/supervisors",
    icon: GraduationCap,
    badge: null,
  },
  {
    title: "Notifications",
    url: "/admin/notifications",
    icon: Bell,
    badge: null,
  },
];

const resourceItems = [
  {
    title: "Guidelines",
    url: "/guidelines",
    icon: BookOpen,
  },
  {
    title: "Research Areas",
    url: "/research",
    icon: Search,
  },
];

// Role-specific resource items
const studentResourceItems = [
  ...resourceItems,
  {
    title: "Find Students",
    url: "/students",
    icon: UserPlus,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const user = useSelector((state: any) => state.auth.user);
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "w-full justify-start transition-colors";
    return isActive(path)
      ? `${baseClasses} bg-accent text-accent-foreground font-medium`
      : `${baseClasses} hover:bg-accent/50`;
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    switch (user?.role) {
      case "student":
        return studentNavigationItems;
      case "supervisor":
        return supervisorNavigationItems;
      case "admin":
        return adminNavigationItems;
      default:
        return [];
    }
  };

  // Get resource items based on user role
  const getResourceItems = () => {
    switch (user?.role) {
      case "student":
        return studentResourceItems;
      case "supervisor":
      case "admin":
        return resourceItems;
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();
  // const resourceItemsForRole = getResourceItems();

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClasses(item.url)}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge
                              variant={
                                item.badge === "New" ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources */}
        {/* <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItemsForRole.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClasses(item.url)}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>
    </Sidebar>
  );
}
