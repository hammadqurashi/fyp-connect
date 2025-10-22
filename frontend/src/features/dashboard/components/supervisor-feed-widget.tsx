import { Rss, Heart, MessageCircle, Bookmark } from "lucide-react";
import { DashboardWidget } from "./dashboard-widget";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { formatDistanceToNow } from "date-fns";

// Mock data
const mockPosts = [
  {
    id: "1",
    supervisor: {
      name: "Dr. Sarah Johnson",
      avatar: "/placeholder-avatar-prof1.jpg",
      department: "Computer Science",
    },
    title: "AI Ethics Research Project",
    content:
      "Looking for motivated students interested in exploring ethical implications of AI systems. This project will focus on bias detection and fairness in machine learning algorithms.",
    tags: ["AI", "Ethics", "Research"],
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 12,
    comments: 3,
  },
  {
    id: "2",
    supervisor: {
      name: "Prof. Michael Chen",
      avatar: "/placeholder-avatar-prof2.jpg",
      department: "Data Science",
    },
    title: "Industry Partnership - Smart City Analytics",
    content:
      "Exciting opportunity to work with the city council on developing analytics dashboard for urban planning. Real-world impact guaranteed!",
    tags: ["Industry", "Analytics", "Smart City"],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    likes: 8,
    comments: 5,
  },
];

export function SupervisorFeedWidget() {
  const latestPost = mockPosts[0];

  return (
    <DashboardWidget
      title="Supervisor Feed"
      actionText="View Full Feed"
      actionHref="/supervisor-feed"
    >
      <div className="space-y-4">
        {/* Latest Post Preview */}
        <div className="border rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={latestPost.supervisor.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {latestPost.supervisor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">
                {latestPost.supervisor.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                {latestPost.supervisor.department}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(latestPost.postedAt, { addSuffix: true })}
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium mb-1">{latestPost.title}</h5>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {latestPost.content}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {latestPost.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {latestPost.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{latestPost.tags.length - 2} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {latestPost.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {latestPost.comments}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Bookmark className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">
              {mockPosts.length}
            </div>
            <div className="text-xs text-muted-foreground">New Posts</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary">5</div>
            <div className="text-xs text-muted-foreground">Bookmarked</div>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
}
