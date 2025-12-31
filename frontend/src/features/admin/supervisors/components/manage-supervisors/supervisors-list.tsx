import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/components/ui/use-toast";
import adminService from "@/core/services/api/admin-service";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

interface Supervisor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImg?: string;
  isActive?: boolean;
  supervisorProfile?: {
    department?: string;
    level?: string;
    description?: string;
    skills?: string[];
    interests?: string[];
  };
  supervisedGroupsCount?: number;
  createdAt: string;
}

export default function SupervisorsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<Supervisor | null>(null);

  const loadSupervisors = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllSupervisors({
        page,
        limit: 10,
        search: searchTerm || undefined,
      });

      if (res.success && res.data) {
        setSupervisors(res.data.supervisors || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        toast({
          title: "Error",
          description: res.msg || "Failed to load supervisors",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load supervisors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupervisors();
  }, [page, searchTerm]);

  const handleDelete = async () => {
    if (!selectedSupervisor) return;

    try {
      const res = await adminService.deleteSupervisor(selectedSupervisor._id);
      if (res.success) {
        toast({
          title: "Success",
          description: "Supervisor deleted successfully",
        });
        loadSupervisors();
      } else {
        toast({
          title: "Error",
          description: res.msg || "Failed to delete supervisor",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete supervisor",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedSupervisor(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedSupervisor) return;

    try {
      const res = await adminService.toggleSupervisorStatus(
        selectedSupervisor._id,
        !selectedSupervisor.isActive
      );
      if (res.success) {
        toast({
          title: "Success",
          description: `Supervisor ${
            res.data.isActive ? "enabled" : "disabled"
          } successfully`,
        });
        loadSupervisors();
      } else {
        toast({
          title: "Error",
          description: res.msg || "Failed to update supervisor status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update supervisor status",
        variant: "destructive",
      });
    } finally {
      setDisableDialogOpen(false);
      setSelectedSupervisor(null);
    }
  };

  const getTitleFromLevel = (level?: string) => {
    const titles: Record<string, string> = {
      professor: "Professor",
      associate_professor: "Associate Professor",
      assistant_professor: "Assistant Professor",
      dean: "Dean",
      head_of_department: "Head of Department",
      lecturer: "Lecturer",
      other: "Other",
    };
    return titles[level || ""] || level || "-";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Supervisors</h2>
          <p className="text-muted-foreground text-sm">
            View and manage all supervisor accounts
          </p>
        </div>
        <Button onClick={() => navigate("/admin/supervisors/add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supervisor
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading supervisors...</p>
        </div>
      ) : supervisors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No supervisors found</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Groups</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supervisors.map((supervisor) => (
                  <TableRow key={supervisor._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={supervisor.profileImg} />
                          <AvatarFallback>
                            {supervisor.firstName[0]}
                            {supervisor.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {supervisor.firstName} {supervisor.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {supervisor.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {supervisor.supervisorProfile?.department || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getTitleFromLevel(supervisor.supervisorProfile?.level)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {supervisor.supervisedGroupsCount || 0} group
                        {(supervisor.supervisedGroupsCount || 0) !== 1
                          ? "s"
                          : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          supervisor.isActive !== false
                            ? "default"
                            : "secondary"
                        }
                      >
                        {supervisor.isActive !== false ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/admin/supervisors/edit/${supervisor._id}`
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSupervisor(supervisor);
                              setDisableDialogOpen(true);
                            }}
                          >
                            {supervisor.isActive !== false ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Disable
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Enable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSupervisor(supervisor);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supervisor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedSupervisor?.firstName}{" "}
              {selectedSupervisor?.lastName}? This action cannot be undone.
              {selectedSupervisor?.supervisedGroupsCount &&
              selectedSupervisor.supervisedGroupsCount > 0 ? (
                <span className="block mt-2 text-destructive">
                  Warning: This supervisor is supervising{" "}
                  {selectedSupervisor.supervisedGroupsCount} group(s). They must
                  be reassigned first.
                </span>
              ) : (
                ""
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedSupervisor?.isActive !== false ? "Disable" : "Enable"}{" "}
              Supervisor
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {selectedSupervisor?.isActive !== false ? "disable" : "enable"}{" "}
              {selectedSupervisor?.firstName} {selectedSupervisor?.lastName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {selectedSupervisor?.isActive !== false ? "Disable" : "Enable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
