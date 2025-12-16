import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { SupervisorProfile } from "@/core/services/api/student-supervisor-service";

interface SupervisorProfileDialogProps {
  supervisor: SupervisorProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupervisorProfileDialog({
  supervisor,
  open,
  onOpenChange,
}: SupervisorProfileDialogProps) {
  if (!supervisor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={supervisor.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {supervisor.firstName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">
                {supervisor.firstName} {supervisor.lastName}
              </DialogTitle>
              {supervisor.title && (
                <DialogDescription className="text-base">
                  {supervisor.title}
                </DialogDescription>
              )}
              {supervisor.department && (
                <DialogDescription>{supervisor.department}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {supervisor.description && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground">
                {supervisor.description}
              </p>
            </div>
          )}

          {/* Skills */}
          {supervisor.skills && supervisor.skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {supervisor.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {supervisor.interests && supervisor.interests.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Research Interests</h3>
              <div className="flex flex-wrap gap-2">
                {supervisor.interests.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-2">Contact</h3>
            <p className="text-sm text-muted-foreground">{supervisor.email}</p>
          </div>

          {/* Match Percentage */}
          {supervisor.matchPercentage !== undefined && (
            <div>
              <h3 className="font-semibold mb-2">Match Score</h3>
              <div className="text-3xl font-bold text-primary">
                {supervisor.matchPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your profile, skills, and interests
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
