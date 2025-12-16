import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useToast } from "@/shared/components/ui/use-toast";
import supervisorRequestService, {
  SupervisionRequest,
} from "@/core/services/api/supervisor-request-service";

export default function SupervisorInvitations() {
  const [requests, setRequests] = useState<SupervisionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<SupervisionRequest | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseType, setResponseType] = useState<
    "accepted" | "rejected" | null
  >(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await supervisorRequestService.getSupervisionRequests();
      if (res.success && res.data?.requests) {
        setRequests(res.data.requests);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load supervision requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (
    request: SupervisionRequest,
    response: "accepted" | "rejected"
  ) => {
    setSelectedRequest(request);
    setResponseType(response);
    setResponseDialogOpen(true);
  };

  const confirmResponse = async () => {
    if (!selectedRequest || !responseType) return;

    try {
      const res = await supervisorRequestService.respondToRequest(
        selectedRequest._id,
        responseType
      );
      if (res.success) {
        toast({
          title: `Request ${responseType}`,
          description: `You have ${responseType} the supervision request from ${selectedRequest.group.name}`,
        });
        await fetchRequests();
      } else {
        toast({
          title: "Error",
          description: res.msg || "Failed to respond to request",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to respond to request",
        variant: "destructive",
      });
    } finally {
      setResponseDialogOpen(false);
      setSelectedRequest(null);
      setResponseType(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Supervision Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and respond to group supervision requests
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Supervision Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and respond to group supervision requests
        </p>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          </div>
          <h3 className="text-lg font-semibold mb-2">No requests found</h3>
          <p className="text-muted-foreground">
            You don't have any pending supervision requests at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((request) => (
            <Card key={request._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{request.group.name}</CardTitle>
                    {request.group.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.group.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Group Info */}
                <div className="pb-4 border-b">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Group Information</h4>
                    {request.group.description && (
                      <p className="text-sm text-muted-foreground">
                        {request.group.description}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(
                          request.group.createdAt || request.createdAt
                        ).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        {request.group.isFormed ? (
                          <Badge variant="default" className="ml-1 text-xs">
                            Formed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="ml-1 text-xs">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group Members */}
                <div>
                  <h4 className="text-sm font-medium mb-3">
                    Group Members ({request.group.members.length})
                  </h4>
                  <div className="space-y-3">
                    {/* Members */}
                    {request.group.members.map((member) => (
                      <div
                        key={member._id}
                        className="p-3 bg-muted rounded-lg border"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {member.firstName[0]}
                              {member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div>
                              <p className="text-sm font-medium">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {member.email}
                              </p>
                            </div>
                            {(member.department ||
                              member.completedCreditHours !== undefined) && (
                              <div className="flex flex-wrap gap-2 text-xs">
                                {member.department && (
                                  <span className="text-muted-foreground">
                                    Department: {member.department}
                                  </span>
                                )}
                                {member.completedCreditHours !== undefined && (
                                  <span className="text-muted-foreground">
                                    Credit Hours: {member.completedCreditHours}
                                  </span>
                                )}
                              </div>
                            )}
                            {member.skills && member.skills.length > 0 && (
                              <div>
                                <p className="text-xs font-medium mb-1">
                                  Skills:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {member.skills.map((skill) => (
                                    <Badge
                                      key={skill}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {member.interests &&
                              member.interests.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium mb-1">
                                    Interests:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {member.interests.map((interest) => (
                                      <Badge
                                        key={interest}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {interest}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Request Info */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Requested by: {request.requestedBy.firstName}{" "}
                      {request.requestedBy.lastName}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => handleRespond(request, "accepted")}
                  >
                    Accept Request
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleRespond(request, "rejected")}
                  >
                    Reject Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Response Confirmation Dialog */}
      <AlertDialog
        open={responseDialogOpen}
        onOpenChange={setResponseDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {responseType === "accepted"
                ? "Accept Supervision Request"
                : "Reject Supervision Request"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {responseType === "accepted" ? (
                <>
                  Are you sure you want to accept the supervision request from{" "}
                  <strong>{selectedRequest?.group.name}</strong>? You will be
                  assigned as their supervisor and all group members will be
                  notified.
                </>
              ) : (
                <>
                  Are you sure you want to reject the supervision request from{" "}
                  <strong>{selectedRequest?.group.name}</strong>? All group
                  members will be notified of your decision.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmResponse}
              variant={responseType === "rejected" ? "destructive" : "default"}
            >
              {responseType === "accepted" ? "Accept" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
