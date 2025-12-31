import { Heart, MessageCircle } from "lucide-react";
import { DashboardWidget } from "./dashboard-widget";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface Post {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  supervisor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImg?: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

interface SupervisorFeedWidgetProps {
  posts?: Post[];
  loading?: boolean;
}

export function SupervisorFeedWidget({
  posts = [],
  loading = false,
}: SupervisorFeedWidgetProps) {
  if (loading) {
    return (
      <DashboardWidget title="Supervisor Feed">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </DashboardWidget>
    );
  }

  if (posts.length === 0) {
    return (
      <DashboardWidget
        title="Supervisor Feed"
        actionText="View Full Feed"
        actionHref="/supervisor-feed"
      >
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            No posts available yet
          </p>
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget
      title="Supervisor Feed"
      actionText="View Full Feed"
      actionHref="/supervisor-feed"
    >
      <div className="space-y-4">
        {posts.slice(0, 5).map((post) => (
          <div key={post._id} className="border rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.supervisor.profileImg} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {post.supervisor.firstName?.[0]}
                  {post.supervisor.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">
                  {post.supervisor.firstName} {post.supervisor.lastName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-1">{post.title}</h5>
              <div
                className="text-xs text-muted-foreground line-clamp-3 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.tags.length - 2} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {post.likesCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {post.commentsCount || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
}
