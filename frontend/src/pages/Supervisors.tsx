import { useEffect, useState } from "react";
import { Search, Filter, Star, Users, MapPin, Mail } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Progress } from "@/shared/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Supervisor } from "@/core/types/supervisor";
import supervisorService from "@/core/services/api/supervisor-service";
import { useToast } from "@/shared/components/ui/use-toast";
import groupService from "@/core/services/api/group-service";

// Fallback mock
const mockSupervisors: Supervisor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    department: "Computer Science",
    title: "Associate Professor",
    researchInterests: ["Machine Learning", "AI Ethics", "Computer Vision"],
    tools: ["Python", "TensorFlow", "PyTorch", "R"],
    bio: "Dr. Johnson specializes in machine learning and AI ethics with over 10 years of research experience. She has supervised 25+ successful FYP students and published 40+ papers in top-tier conferences.",
    maxStudents: 6,
    currentStudents: 4,
    rating: 4.8,
    matchPercentage: 92,
  },
  {
    id: "2",
    name: "Prof. Michael Chen",
    email: "michael.chen@university.edu",
    department: "Data Science",
    title: "Professor",
    researchInterests: ["Big Data Analytics", "Cloud Computing", "IoT"],
    tools: ["Apache Spark", "Hadoop", "AWS", "MongoDB"],
    bio: "Prof. Chen is a leading expert in big data analytics and cloud computing. He has extensive industry connections and focuses on real-world applications of data science.",
    maxStudents: 8,
    currentStudents: 6,
    rating: 4.6,
    matchPercentage: 87,
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@university.edu",
    department: "Software Engineering",
    title: "Senior Lecturer",
    researchInterests: ["Web Development", "Mobile Apps", "DevOps"],
    tools: ["React", "Node.js", "Docker", "Kubernetes"],
    bio: "Dr. Rodriguez brings industry experience from top tech companies. She focuses on modern software development practices and has mentored numerous successful startup founders.",
    maxStudents: 5,
    currentStudents: 3,
    rating: 4.9,
    matchPercentage: 81,
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    email: "james.wilson@university.edu",
    department: "Cybersecurity",
    title: "Assistant Professor",
    researchInterests: ["Network Security", "Blockchain", "Cryptography"],
    tools: ["Wireshark", "Metasploit", "Solidity", "OpenSSL"],
    bio: "Dr. Wilson is a cybersecurity expert with government consulting experience. He focuses on practical security implementations and emerging technologies like blockchain.",
    maxStudents: 4,
    currentStudents: 2,
    rating: 4.7,
    matchPercentage: 75,
  },
];

export default function Supervisors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match");
  const [supervisors, setSupervisors] = useState<Supervisor[]>(mockSupervisors);
  const { toast } = useToast();

  // useEffect(() => {
  //   // For now we reuse posts endpoint to list supervisors with posts
  //   (async () => {
  //     const res = await supervisorService.listPosts();
  //     if (res.success) {
  //       const seen = new Map<string, Supervisor>();
  //       (res.data?.posts || []).forEach((p: any) => {
  //         const u = p.supervisor;
  //         if (u && !seen.has(u._id)) {
  //           seen.set(u._id, {
  //             id: u._id,
  //             name:
  //               `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
  //             email: u.email,
  //             department: "",
  //             title: "",
  //             researchInterests: [],
  //             tools: [],
  //             bio: "",
  //             maxStudents: 3,
  //             currentStudents: 0,
  //             rating: 0,
  //             matchPercentage: 0,
  //           });
  //         }
  //       });
  //       setSupervisors(Array.from(seen.values()));
  //     } else if (res.msg) {
  //       toast({
  //         title: "Failed to load supervisors",
  //         description: res.msg,
  //         variant: "destructive",
  //       });
  //     }
  //   })();
  // }, []);

  const departments = Array.from(new Set(supervisors.map((s) => s.department)));

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
        case "rating":
          return b.rating - a.rating;
        case "availability":
          return (
            a.currentStudents / a.maxStudents -
            b.currentStudents / b.maxStudents
          );
        default:
          return 0;
      }
    });

  const getAvailabilityColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio < 0.7) return "text-green-600";
    if (ratio < 0.9) return "text-orange-600";
    return "text-red-600";
  };

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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, research interests, or tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
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

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="match">Best Match</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="availability">Most Available</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredSupervisors.length} supervisors
        </p>
        <Badge variant="outline">
          <Filter className="mr-1 h-3 w-3" />
          {searchTerm || departmentFilter ? "Filtered" : "All Results"}
        </Badge>
      </div>

      {/* Supervisors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSupervisors.map((supervisor) => (
          <Card
            key={supervisor.id}
            className="hover:shadow-md transition-all duration-200"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={supervisor.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {supervisor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{supervisor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {supervisor.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {supervisor.department}
                    </p>
                  </div>
                </div>

                {supervisor.matchPercentage && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {supervisor.matchPercentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">Match</div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Bio */}
              <p className="text-sm text-muted-foreground line-clamp-3">
                {supervisor.bio}
              </p>

              {/* Research Interests */}
              <div>
                <h4 className="text-sm font-medium mb-2">Research Interests</h4>
                <div className="flex flex-wrap gap-1">
                  {supervisor.researchInterests.slice(0, 3).map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="text-xs"
                    >
                      {interest}
                    </Badge>
                  ))}
                  {supervisor.researchInterests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{supervisor.researchInterests.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Tools */}
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Tools & Technologies
                </h4>
                <div className="flex flex-wrap gap-1">
                  {supervisor.tools.slice(0, 4).map((tool) => (
                    <Badge key={tool} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                  {supervisor.tools.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{supervisor.tools.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>{supervisor.rating}/5.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users
                    className={`h-4 w-4 ${getAvailabilityColor(
                      supervisor.currentStudents,
                      supervisor.maxStudents
                    )}`}
                  />
                  <span
                    className={getAvailabilityColor(
                      supervisor.currentStudents,
                      supervisor.maxStudents
                    )}
                  >
                    {supervisor.currentStudents}/{supervisor.maxStudents}{" "}
                    students
                  </span>
                </div>
              </div>

              {/* Availability Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Availability</span>
                  <span
                    className={getAvailabilityColor(
                      supervisor.currentStudents,
                      supervisor.maxStudents
                    )}
                  >
                    {Math.round(
                      (1 -
                        supervisor.currentStudents / supervisor.maxStudents) *
                        100
                    )}
                    % available
                  </span>
                </div>
                <Progress
                  value={
                    (supervisor.currentStudents / supervisor.maxStudents) * 100
                  }
                  className="h-2"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={
                    supervisor.currentStudents >= supervisor.maxStudents
                  }
                  onClick={async () => {
                    try {
                      const res = await supervisorService.requestSupervision({
                        supervisorId: supervisor.id,
                      });
                      if (res.success) {
                        toast({ title: "Request sent" });
                      } else {
                        const message = res.msg || "Unable to send request";
                        if (
                          message
                            .toLowerCase()
                            .includes("please join or create a group")
                        ) {
                          toast({
                            title: "Create a group first",
                            description:
                              "Please join or create a group before requesting supervision.",
                            variant: "destructive",
                          });
                        } else {
                          toast({
                            title: "Failed to send request",
                            description: message,
                            variant: "destructive",
                          });
                        }
                      }
                    } catch (e: any) {
                      toast({
                        title: "Error",
                        description: e?.message || "Unable to send request",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {supervisor.currentStudents >= supervisor.maxStudents
                    ? "Fully Booked"
                    : "Request Supervision"}
                </Button>
                <Button size="sm" variant="outline">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}
