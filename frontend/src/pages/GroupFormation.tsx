import { useState, useEffect } from "react";
import { GroupFormationStepper } from "@/features/group-formation/components/group-formation-stepper";
import { GroupStatusView } from "@/features/group-formation/components/group-status-view";
import { ReceivedInvitations } from "@/features/group-formation/components/received-invitations";
import studentGroupService from "@/core/services/api/student-group-service";

export default function GroupFormation() {
  const [hasGroup, setHasGroup] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGroup = async () => {
      try {
        const res = await studentGroupService.getMyGroup();
        if (res.success && res.data?.group) {
          setHasGroup(true);
        } else {
          setHasGroup(false);
        }
      } catch (error) {
        console.error("Error checking group:", error);
        setHasGroup(false);
      } finally {
        setLoading(false);
      }
    };
    checkGroup();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show received invitations at the top for all students */}
      <ReceivedInvitations />
      
      {/* Show group status or formation stepper */}
      {hasGroup ? <GroupStatusView /> : <GroupFormationStepper />}
    </div>
  );
}