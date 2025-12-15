import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { Search, UserPlus, CheckCircle2 } from "lucide-react";
import studentGroupService, { IStudent } from "@/core/services/api/student-group-service";
import { toast } from "sonner";

interface FindMembersStepProps {
  form: UseFormReturn<any>;
  selectedStudents: string[];
  onSelectionChange: (studentIds: string[]) => void;
}

export const FindMembersStep: React.FC<FindMembersStepProps> = ({
  form,
  selectedStudents,
  onSelectionChange,
}) => {
  const [students, setStudents] = useState<IStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filters = {
    department: form.watch("department"),
    minCreditHours: form.watch("minCreditHours"),
    maxCreditHours: form.watch("maxCreditHours"),
    skills: form.watch("skills") || [],
    interests: form.watch("interests") || [],
    search: searchQuery,
  };

  const searchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentGroupService.searchStudents(filters);
      if (res.success && res.data) {
        setStudents(res.data.students);
      } else {
        toast.error(res.msg || "Failed to search students");
      }
    } catch (error) {
      console.error("Error searching students:", error);
      toast.error("An error occurred while searching students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-search when filters change (debounced)
    const timeoutId = setTimeout(() => {
      if (filters.department || filters.skills?.length > 0 || filters.interests?.length > 0 || searchQuery) {
        searchStudents();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.department, filters.skills, filters.interests, searchQuery]);

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.length >= 3 && !selectedStudents.includes(studentId)) {
      toast.error("Maximum 3 students can be invited (4 total including you)");
      return;
    }

    const newSelection = selectedStudents.includes(studentId)
      ? selectedStudents.filter((id) => id !== studentId)
      : [...selectedStudents, studentId];
    onSelectionChange(newSelection);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="button" onClick={searchStudents} disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : "Search"}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {selectedStudents.length > 0
          ? `${selectedStudents.length} student${selectedStudents.length > 1 ? "s" : ""} selected (max 3)`
          : "Select up to 3 students to invite"}
      </div>

      {loading && students.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No students found matching your filters.</p>
          <p className="text-sm mt-2">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => {
            const isSelected = selectedStudents.includes(student.id);
            return (
              <Card
                key={student.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:shadow-md"
                }`}
                onClick={() => toggleStudent(student.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {student.email}
                        </p>
                        {student.department && (
                          <p className="text-xs text-muted-foreground">
                            {student.department}
                            {student.completedCreditHours !== undefined &&
                              ` • ${student.completedCreditHours} credits`}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  {(student.skills.length > 0 ||
                    student.interests.length > 0) && (
                    <div className="mt-3 space-y-2">
                      {student.skills.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Skills:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {student.skills.slice(0, 5).map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {student.skills.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{student.skills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {student.interests.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Interests:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {student.interests.slice(0, 5).map((interest) => (
                              <Badge
                                key={interest}
                                variant="secondary"
                                className="text-xs"
                              >
                                {interest}
                              </Badge>
                            ))}
                            {student.interests.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{student.interests.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

