import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Search, FileText, MessageSquare } from "lucide-react";

interface QuickLinksWidgetProps {
  role: "student" | "supervisor";
}

export function QuickLinksWidget({ role }: QuickLinksWidgetProps) {
  const studentLinks = [
    { href: "/group-formation", label: "Create New Group", icon: Users },
    { href: "/supervisors", label: "Browse Supervisors", icon: Search },
    { href: "/supervisor-feed", label: "View Posts", icon: FileText },
    { href: "/collaboration", label: "Open Chat", icon: MessageSquare },
  ];

  const supervisorLinks = [
    { href: "/supervisor/posts/create", label: "Create Post", icon: FileText },
    { href: "/supervisor/invitations", label: "Review Requests", icon: Users },
    { href: "/supervisor/posts", label: "My Posts", icon: FileText },
    { href: "/collaboration", label: "Open Chat", icon: MessageSquare },
  ];

  const links = role === "student" ? studentLinks : supervisorLinks;

  return (
    <div className="bg-gradient-to-br from-accent/50 to-background rounded-lg p-4 border">
      <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
      <div className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to={link.href}>
                <Icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

