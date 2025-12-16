import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useToast } from "@/shared/components/ui/use-toast";
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
import {
  Supervisor,
  SupervisorProfile,
} from "@/core/services/api/student-supervisor-service";
import studentSupervisorService from "@/core/services/api/student-supervisor-service";
import studentGroupService, {
  IGroup,
} from "@/core/services/api/student-group-service";
import { SupervisorCard } from "./supervisor-card";
import { SupervisorFilters } from "./supervisor-filters";
import { SupervisorProfileDialog } from "./supervisor-profile-dialog";

export default function AllSupervisors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match");
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasGroup, setHasGroup] = useState(false);
  const [hasSupervisor, setHasSupervisor] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<Supervisor | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [supervisorProfile, setSupervisorProfile] =
    useState<SupervisorProfile | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [supervisorToRequest, setSupervisorToRequest] =
    useState<Supervisor | null>(null);
  const { toast } = useToast();

  // Fetch supervisors and group info
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [supervisorsRes, groupRes] = await Promise.all([
          studentSupervisorService.getAllSupervisors(),
          studentGroupService.getMyGroup(),
        ]);

        if (supervisorsRes.success && supervisorsRes.data?.supervisors) {
          setSupervisors(supervisorsRes.data.supervisors);
        }

        if (groupRes.success && groupRes.data?.group) {
          setHasGroup(true);
          if (groupRes.data.group.supervisor) {
            setHasSupervisor(true);
          }
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to load supervisors",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const departments = Array.from(
    new Set(supervisors.map((s) => s.department).filter(Boolean))
  );

  const filteredSupervisors = supervisors
    .filter(
      (supervisor) =>
        supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.researchInterests.some((interest) =>
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        supervisor.tools.some((tool) =>
          tool.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    .filter(
      (supervisor) =>
        departmentFilter === "" ||
        departmentFilter === "all" ||
        supervisor.department === departmentFilter
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "match":
          return (b.matchPercentage || 0) - (a.matchPercentage || 0);
        case "availability":
          return a.currentGroups / a.maxGroups - b.currentGroups / b.maxGroups;
        default:
          return 0;
      }
    });

  const handleRequestSupervision = (supervisor: Supervisor) => {
    setSupervisorToRequest(supervisor);
    setConfirmDialogOpen(true);
  };

  const handleConfirmRequest = async () => {
    if (!supervisorToRequest) return;

    try {
      const res = await studentSupervisorService.requestSupervision(
        supervisorToRequest.id
      );
      if (res.success) {
        toast({
          title: "Request sent",
          description: `Supervision request sent to ${supervisorToRequest.name}`,
        });
        // Update local state instead of refetching
        setSupervisors((prevSupervisors) =>
          prevSupervisors.map((s) =>
            s.id === supervisorToRequest.id
              ? { ...s, requestStatus: "pending" as const }
              : s
          )
        );
      } else {
        toast({
          title: "Failed to send request",
          description: res.msg || "Unable to send request",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Unable to send request",
        variant: "destructive",
      });
    } finally {
      setConfirmDialogOpen(false);
      setSupervisorToRequest(null);
    }
  };

  const handleCancelRequest = async (supervisor: Supervisor) => {
    try {
      const res = await studentSupervisorService.cancelRequest(supervisor.id);
      if (res.success) {
        toast({
          title: "Request cancelled",
          description: `Supervision request to ${supervisor.name} has been cancelled`,
        });
        // Update local state instead of refetching
        setSupervisors((prevSupervisors) =>
          prevSupervisors.map((s) =>
            s.id === supervisor.id ? { ...s, requestStatus: null } : s
          )
        );
      } else {
        toast({
          title: "Failed to cancel request",
          description: res.msg || "Unable to cancel request",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Unable to cancel request",
        variant: "destructive",
      });
    }
  };

  const handleViewProfile = async (supervisor: Supervisor) => {
    try {
      const res = await studentSupervisorService.getSupervisorProfile(
        supervisor.id
      );
      if (res.success && res.data?.supervisor) {
        setSupervisorProfile(res.data.supervisor);
        setProfileDialogOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to load supervisor profile",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load supervisor profile",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Find Supervisors</h1>
          <p className="text-muted-foreground mt-1">
            Discover supervisors that match your interests and project goals
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading supervisors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Find Supervisors</h1>
        <p className="text-muted-foreground mt-1">
          Discover supervisors that match your interests and project goals
        </p>
      </div>

      {/* Search and Filters */}
      <SupervisorFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        departments={departments}
        resultCount={filteredSupervisors.length}
      />

      {/* Supervisors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSupervisors.map((supervisor) => (
          <SupervisorCard
            key={supervisor.id}
            supervisor={supervisor}
            onRequestSupervision={handleRequestSupervision}
            onCancelRequest={handleCancelRequest}
            onViewProfile={handleViewProfile}
            hasGroup={hasGroup}
            hasSupervisor={hasSupervisor}
          />
        ))}
      </div>

      {filteredSupervisors.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No supervisors found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters to find more matches.
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Supervision Request</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to request supervision by{" "}
              <strong>{supervisorToRequest?.name}</strong>? This request will be
              sent on behalf of your entire group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRequest}>
              Send Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Supervisor Profile Dialog */}
      <SupervisorProfileDialog
        supervisor={supervisorProfile}
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
    </div>
  );
}
