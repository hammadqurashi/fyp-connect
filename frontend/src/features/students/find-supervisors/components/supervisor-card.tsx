import { Star, Users, Mail, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Progress } from "@/shared/components/ui/progress";
import { Button } from "@/shared/components/ui/button";
import { Supervisor } from "@/core/services/api/student-supervisor-service";

interface SupervisorCardProps {
  supervisor: Supervisor;
  onRequestSupervision: (supervisor: Supervisor) => void;
  onCancelRequest: (supervisor: Supervisor) => void;
  onViewProfile: (supervisor: Supervisor) => void;
  hasGroup: boolean;
  hasSupervisor: boolean;
}

export function SupervisorCard({
  supervisor,
  onRequestSupervision,
  onCancelRequest,
  onViewProfile,
  hasGroup,
  hasSupervisor,
}: SupervisorCardProps) {
  const getAvailabilityColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.7) return "text-green-600";
    if (ratio < 0.9) return "text-orange-600";
    return "text-red-600";
  };

  const isRequestPending = supervisor.requestStatus === "pending";
  const isRequestAccepted = supervisor.requestStatus === "accepted";
  const isRequestRejected = supervisor.requestStatus === "rejected";
  const canRequest =
    hasGroup &&
    !hasSupervisor &&
    !supervisor.isAssigned &&
    !supervisor.hasReachedMax &&
    !isRequestPending &&
    !isRequestAccepted;

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={supervisor.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {supervisor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{supervisor.name}</h3>
              {supervisor.title && (
                <p className="text-sm text-muted-foreground">
                  {supervisor.title}
                </p>
              )}
              {supervisor.department && (
                <p className="text-sm text-muted-foreground">
                  {supervisor.department}
                </p>
              )}
            </div>
          </div>

          {supervisor.matchPercentage !== undefined && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {supervisor.matchPercentage}%
              </div>
              <div className="text-xs text-muted-foreground">Match</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {supervisor.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {supervisor.description}
          </p>
        )}

        {/* Research Interests */}
        {supervisor.researchInterests.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Research Interests</h4>
            <div className="flex flex-wrap gap-1">
              {supervisor.researchInterests.slice(0, 3).map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="text-xs"
                >
                  {interest}
                </Badge>
              ))}
              {supervisor.researchInterests.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{supervisor.researchInterests.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tools */}
        {supervisor.tools.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">
              Tools & Technologies
            </h4>
            <div className="flex flex-wrap gap-1">
              {supervisor.tools.slice(0, 4).map((tool) => (
                <Badge key={tool} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
              {supervisor.tools.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{supervisor.tools.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users
              className={`h-4 w-4 ${getAvailabilityColor(
                supervisor.currentGroups,
                supervisor.maxGroups
              )}`}
            />
            <span
              className={getAvailabilityColor(
                supervisor.currentGroups,
                supervisor.maxGroups
              )}
            >
              {supervisor.currentGroups}/{supervisor.maxGroups} groups
            </span>
          </div>
        </div>

        {/* Availability Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Availability</span>
            <span
              className={getAvailabilityColor(
                supervisor.currentGroups,
                supervisor.maxGroups
              )}
            >
              {Math.round(
                (1 - supervisor.currentGroups / supervisor.maxGroups) * 100
              )}
              % available
            </span>
          </div>
          <Progress
            value={(supervisor.currentGroups / supervisor.maxGroups) * 100}
            className="h-2"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {isRequestPending && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                disabled
              >
                Request Sent
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onCancelRequest(supervisor)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Request
              </Button>
            </>
          )}
          {isRequestAccepted && (
            <Button size="sm" className="flex-1" disabled>
              Request Accepted
            </Button>
          )}
          {isRequestRejected && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled
            >
              Request Rejected
            </Button>
          )}
          {!isRequestPending && !isRequestAccepted && !isRequestRejected && (
            <Button
              size="sm"
              className="flex-1"
              disabled={!canRequest}
              onClick={() => onRequestSupervision(supervisor)}
            >
              <Mail className="mr-2 h-4 w-4" />
              {!hasGroup
                ? "Join a Group First"
                : hasSupervisor
                ? "Supervisor Assigned"
                : supervisor.hasReachedMax
                ? "Fully Booked"
                : supervisor.isAssigned
                ? "Already Assigned"
                : "Request Supervision"}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewProfile(supervisor)}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
