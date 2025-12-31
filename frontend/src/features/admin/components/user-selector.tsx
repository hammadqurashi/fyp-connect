import { useEffect, useState } from "react";
import { Search, Check } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import adminService from "@/core/services/api/admin-service";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImg?: string;
  role: "student" | "supervisor";
}

interface UserSelectorProps {
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
}

export function UserSelector({
  selectedUserIds,
  onSelectionChange,
}: UserSelectorProps) {
  const [students, setStudents] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        // Fetch all students and supervisors (with high limit to get all)
        const [studentsRes, supervisorsRes] = await Promise.all([
          adminService.getAllStudents({ page: 1, limit: 1000 }),
          adminService.getAllSupervisors({ page: 1, limit: 1000 }),
        ]);

        if (studentsRes.success && studentsRes.data) {
          setStudents(
            studentsRes.data.students.map((s: any) => ({
              _id: s._id,
              firstName: s.firstName,
              lastName: s.lastName,
              email: s.email,
              profileImg: s.profileImg,
              role: "student" as const,
            }))
          );
        }

        if (supervisorsRes.success && supervisorsRes.data) {
          setSupervisors(
            supervisorsRes.data.supervisors.map((s: any) => ({
              _id: s._id,
              firstName: s.firstName,
              lastName: s.lastName,
              email: s.email,
              profileImg: s.profileImg,
              role: "supervisor" as const,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredStudents = students.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSupervisors = supervisors.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onSelectionChange(selectedUserIds.filter((id) => id !== userId));
    } else {
      onSelectionChange([...selectedUserIds, userId]);
    }
  };

  const UserItem = ({ user }: { user: User }) => {
    const isSelected = selectedUserIds.includes(user._id);
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
          isSelected
            ? "bg-primary/5 border-primary/20"
            : "hover:bg-muted/50 border-border"
        }`}
        onClick={() => toggleUser(user._id)}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleUser(user._id)}
          onClick={(e) => e.stopPropagation()}
        />
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.profileImg} />
          <AvatarFallback>
            {user.firstName[0]}
            {user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">
              {user.firstName} {user.lastName}
            </p>
            <Badge
              variant={user.role === "student" ? "default" : "secondary"}
              className="text-xs"
            >
              {user.role === "student" ? "Student" : "Supervisor"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {user.email}
          </p>
        </div>
        {isSelected && <Check className="h-4 w-4 text-primary" />}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Select Users</CardTitle>
          {selectedUserIds.length > 0 && (
            <Badge variant="secondary">
              {selectedUserIds.length} selected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {/* Students Section */}
              {filteredStudents.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Students ({filteredStudents.length})
                  </Label>
                  <div className="space-y-2">
                    {filteredStudents.map((user) => (
                      <UserItem key={user._id} user={user} />
                    ))}
                  </div>
                </div>
              )}

              {/* Supervisors Section */}
              {filteredSupervisors.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Supervisors ({filteredSupervisors.length})
                  </Label>
                  <div className="space-y-2">
                    {filteredSupervisors.map((user) => (
                      <UserItem key={user._id} user={user} />
                    ))}
                  </div>
                </div>
              )}

              {filteredStudents.length === 0 &&
                filteredSupervisors.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No users found
                    </p>
                  </div>
                )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

