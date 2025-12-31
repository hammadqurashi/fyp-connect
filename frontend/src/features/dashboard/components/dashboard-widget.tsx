import { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";

interface DashboardWidgetProps {
  title: string;
  children: ReactNode;
  actionText?: string;
  actionHref?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

export function DashboardWidget({
  title,
  children,
  actionText,
  actionHref,
  trend,
  trendValue,
}: DashboardWidgetProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {trend && trendValue && (
          <div className="flex items-center text-xs text-success">
            <TrendingUp className="mr-1 h-3 w-3" />
            {trendValue}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {children}
          {actionText && actionHref && (
            <Button
              variant="outline"
              size="sm"
              className="w-full group"
              asChild
            >
              <Link to={actionHref} className="flex items-center justify-center">
                {actionText}
                <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
