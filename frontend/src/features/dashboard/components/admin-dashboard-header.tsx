import { useSelector } from "react-redux";

interface AdminDashboardHeaderProps {
  firstName?: string;
  lastName?: string;
}

export function AdminDashboardHeader({
  firstName = "Admin",
  lastName = "",
}: AdminDashboardHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">
        Welcome back, {firstName} {lastName}!
      </h1>
      <p className="text-muted-foreground mt-1">
        Here's an overview of your system
      </p>
    </div>
  );
}

