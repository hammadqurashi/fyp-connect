import { Button } from "@/shared/components/ui/button";
import { TrendingUp, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface StudentDashboardHeaderProps {
  firstName: string;
  lastName: string;
}

export function StudentDashboardHeader({
  firstName,
  lastName,
}: StudentDashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your final year project
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to="/supervisor-feed">
            <TrendingUp className="mr-2 h-4 w-4" />
            Browse Posts
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/group-formation">
            <Plus className="mr-2 h-4 w-4" />
            Quick Actions
          </Link>
        </Button>
      </div>
    </div>
  );
}

