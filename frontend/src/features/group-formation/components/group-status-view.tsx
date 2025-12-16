import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { Users, Clock, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import studentGroupService, {
  IGroup,
  IInvitation,
} from "@/core/services/api/student-group-service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const GroupStatusView: React.FC = () => {
  const [group, setGroup] = useState<IGroup | null>(null);
  const [invitations, setInvitations] = useState<IInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [canRecreate, setCanRecreate] = useState(false);
  const navigate = useNavigate();

  const loadGroup = async () => {
    setLoading(true);
    try {
      const res = await studentGroupService.getMyGroup();
      if (res.success && res.data) {
        setGroup(res.data.group);
        setInvitations(res.data.invitations || []);

        // Check if all invitations are rejected and only creator is in group
        if (res.data.group && res.data.invitations) {
          const allRejected =
            res.data.invitations.length > 0 &&
            res.data.invitations.every(
              (inv) => inv.status === "rejected"
            ) &&
            res.data.group.members.length === 1;
          setCanRecreate(allRejected);
        }
      }
    } catch (error) {
      console.error("Error loading group:", error);
      toast.error("Failed to load group information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
  }, []);

  const handleDeleteGroup = async () => {
    if (!group) return;

    if (
      !confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await studentGroupService.deleteGroup(group._id);
      if (res.success) {
        toast.success("Group deleted successfully");
        navigate("/group-formation");
        window.location.reload();
      } else {
        toast.error(res.msg || "Failed to delete group");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("An error occurred while deleting the group");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!group) {
    return null;
  }

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending"
  );
  const acceptedInvitations = invitations.filter(
    (inv) => inv.status === "accepted"
  );
  const rejectedInvitations = invitations.filter(
    (inv) => inv.status === "rejected"
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {group.name}
            </CardTitle>
            {canRecreate && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteGroup}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete & Create New
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <p>{group.description}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Members</p>
            <div className="space-y-2">
              {group.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <span>
                    {member.firstName} {member.lastName}
                  </span>
                  {member._id === group.createdBy._id && (
                    <Badge variant="secondary">Creator</Badge>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {group.members.length}/4 members
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Invitation Status</p>
            <div className="space-y-3">
              {pendingInvitations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">
                      Pending ({pendingInvitations.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {pendingInvitations.map((inv) => (
                      <div
                        key={inv._id}
                        className="flex items-center justify-between p-2 bg-yellow-50 rounded text-sm"
                      >
                        <span>
                          {inv.receiver.firstName} {inv.receiver.lastName}
                        </span>
                        <Badge variant="outline">Waiting for response</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {acceptedInvitations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">
                      Accepted ({acceptedInvitations.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {acceptedInvitations.map((inv) => (
                      <div
                        key={inv._id}
                        className="flex items-center justify-between p-2 bg-green-50 rounded text-sm"
                      >
                        <span>
                          {inv.receiver.firstName} {inv.receiver.lastName}
                        </span>
                        <Badge variant="outline" className="bg-green-100">
                          Accepted
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rejectedInvitations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">
                      Rejected ({rejectedInvitations.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {rejectedInvitations.map((inv) => (
                      <div
                        key={inv._id}
                        className="flex items-center justify-between p-2 bg-red-50 rounded text-sm"
                      >
                        <span>
                          {inv.receiver.firstName} {inv.receiver.lastName}
                        </span>
                        <Badge variant="outline" className="bg-red-100">
                          Rejected
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {invitations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No invitations sent yet.
                </p>
              )}
            </div>
          </div>

          {group.isFormed && (
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-sm font-medium text-green-800">
                ✓ Group is fully formed with 4 members!
              </p>
            </div>
          )}

          {/* Supervisor Section */}
          {group.supervisor && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">Supervisor</h3>
              <div className="flex items-center gap-3 p-3 bg-muted rounded">
                <div className="flex-1">
                  <p className="font-medium">
                    {group.supervisor.firstName} {group.supervisor.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {group.supervisor.email}
                  </p>
                </div>
                <Badge variant="default">Assigned</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

