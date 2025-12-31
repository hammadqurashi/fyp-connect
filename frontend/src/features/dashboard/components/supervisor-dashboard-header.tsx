import { Button } from "@/shared/components/ui/button";
import { TrendingUp, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface SupervisorDashboardHeaderProps {
  firstName: string;
  lastName: string;
}

export function SupervisorDashboardHeader({
  firstName,
  lastName,
}: SupervisorDashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your posts and supervise student groups
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to="/supervisor/posts">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Analytics
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/supervisor/posts/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Link>
        </Button>
      </div>
    </div>
  );
}

