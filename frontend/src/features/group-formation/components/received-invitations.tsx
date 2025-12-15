import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { Mail, Users, CheckCircle2, XCircle } from "lucide-react";
import studentGroupService, {
  IInvitation,
} from "@/core/services/api/student-group-service";
import { toast } from "sonner";

export const ReceivedInvitations: React.FC = () => {
  const [invitations, setInvitations] = useState<IInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const res = await studentGroupService.getReceivedInvitations();
      if (res.success && res.data) {
        setInvitations(res.data.invitations || []);
      } else {
        toast.error(res.msg || "Failed to load invitations");
      }
    } catch (error) {
      console.error("Error loading invitations:", error);
      toast.error("An error occurred while loading invitations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleRespond = async (invitationId: string, response: "accepted" | "rejected") => {
    setResponding(invitationId);
    try {
      const res = await studentGroupService.respondToInvitation(invitationId, response);
      if (res.success) {
        toast.success(
          response === "accepted"
            ? "Invitation accepted! You've joined the group."
            : "Invitation rejected."
        );
        // Reload invitations
        await loadInvitations();
        // Reload page to update group status if accepted
        if (response === "accepted") {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        toast.error(res.msg || `Failed to ${response} invitation`);
      }
    } catch (error: any) {
      console.error("Error responding to invitation:", error);
      toast.error(
        error?.response?.data?.msg || `An error occurred while ${response === "accepted" ? "accepting" : "rejecting"} the invitation`
      );
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Group Invitations ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => {
          const group = typeof invitation.group === "object" ? invitation.group : null;
          const sender = typeof invitation.sender === "object" 
            ? invitation.sender 
            : { firstName: "Unknown", lastName: "User", email: "" };

          if (!group) return null;

          const currentMembers = Array.isArray(group.members) ? group.members.length : 0;
          const isFull = currentMembers >= 4;

          return (
            <div
              key={invitation._id}
              className="p-4 border rounded-lg space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{group.name}</h4>
                    {isFull && (
                      <Badge variant="destructive" className="text-xs">
                        Full
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {group.description || "No description provided"}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Invited by: {sender.firstName} {sender.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Current members: {currentMembers}/4
                      </span>
                    </div>
                    {Array.isArray(group.members) && group.members.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Members:</p>
                        <div className="flex flex-wrap gap-1">
                          {group.members.map((member: any) => (
                            <Badge key={member._id} variant="outline" className="text-xs">
                              {member.firstName} {member.lastName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => handleRespond(invitation._id, "accepted")}
                  disabled={responding === invitation._id || isFull}
                >
                  {responding === invitation._id ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Accept
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleRespond(invitation._id, "rejected")}
                  disabled={responding === invitation._id}
                >
                  {responding === invitation._id ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
