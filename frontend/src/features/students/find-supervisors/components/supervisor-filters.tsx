import { Search, Filter } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface SupervisorFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  departments: string[];
  resultCount: number;
}

export function SupervisorFilters({
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentFilterChange,
  sortBy,
  onSortByChange,
  departments,
  resultCount,
}: SupervisorFiltersProps) {
  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, research interests, or tools..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="match">Best Match</SelectItem>
            <SelectItem value="availability">Most Available</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {resultCount} supervisors
        </p>
        <Badge variant="outline">
          <Filter className="mr-1 h-3 w-3" />
          {searchTerm || (departmentFilter && departmentFilter !== "all")
            ? "Filtered"
            : "All Results"}
        </Badge>
      </div>
    </>
  );
}
