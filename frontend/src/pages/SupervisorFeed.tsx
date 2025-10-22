import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Heart,
  MessageCircle,
  Bookmark,
  Calendar,
  Tag,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { SupervisorPost } from "@/core/types/supervisor";
import supervisorService from "@/core/services/api/supervisor-service";
import { useToast } from "@/shared/components/ui/use-toast";

// Fallback sample
const mockPosts: SupervisorPost[] = [
  {
    id: "1",
    supervisorId: "1",
    supervisor: {
      id: "1",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@university.edu",
      department: "Computer Science",
      title: "Associate Professor",
      researchInterests: ["Machine Learning", "AI Ethics"],
      tools: ["Python", "TensorFlow"],
      bio: "",
      maxStudents: 6,
      currentStudents: 4,
      rating: 4.8,
    },
    title: "AI Ethics Research Project - Bias Detection in Healthcare",
    content:
      "I'm looking for motivated students to join my research on detecting and mitigating bias in healthcare AI systems. This project involves working with real hospital data and developing fairness metrics for medical diagnosis algorithms. Students will gain experience with Python, TensorFlow, and ethical AI principles. The project has potential for publication in top AI conferences and could make a real impact on healthcare equity.",
    tags: ["AI", "Ethics", "Healthcare", "Research", "Python", "TensorFlow"],
    projectType: "research",
    requirements: [
      "Strong Python skills",
      "Interest in AI ethics",
      "Basic ML knowledge",
      "Good communication skills",
    ],
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isActive: true,
  },
  {
    id: "2",
    supervisorId: "2",
    supervisor: {
      id: "2",
      name: "Prof. Michael Chen",
      email: "michael.chen@university.edu",
      department: "Data Science",
      title: "Professor",
      researchInterests: ["Big Data", "Cloud Computing"],
      tools: ["Spark", "AWS"],
      bio: "",
      maxStudents: 8,
      currentStudents: 6,
      rating: 4.6,
    },
    title: "Smart City Analytics Platform - Industry Partnership",
    content:
      "Exciting opportunity to work with the city council on developing a comprehensive analytics platform for urban planning. This project involves processing large datasets from IoT sensors, traffic cameras, and citizen reports to provide insights for city management. Students will work with cutting-edge big data technologies and see their work deployed in a real city environment.",
    tags: ["Big Data", "IoT", "Smart City", "Industry", "Apache Spark", "AWS"],
    projectType: "industry",
    requirements: [
      "Experience with big data tools",
      "Strong analytical skills",
      "Interest in urban planning",
      "Team collaboration",
    ],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isActive: true,
  },
  {
    id: "3",
    supervisorId: "3",
    supervisor: {
      id: "3",
      name: "Dr. Emily Rodriguez",
      email: "emily.rodriguez@university.edu",
      department: "Software Engineering",
      title: "Senior Lecturer",
      researchInterests: ["Web Development", "Mobile Apps"],
      tools: ["React", "Node.js"],
      bio: "",
      maxStudents: 5,
      currentStudents: 3,
      rating: 4.9,
    },
    title: "E-Learning Platform Development - EdTech Startup Collaboration",
    content:
      "Partner with a growing EdTech startup to build the next generation of online learning platforms. This project focuses on creating engaging, interactive learning experiences using modern web technologies. Students will work in an agile environment, implementing features like real-time collaboration, adaptive learning paths, and comprehensive analytics dashboards.",
    tags: ["Web Development", "EdTech", "React", "Node.js", "Startup", "Agile"],
    projectType: "both",
    requirements: [
      "Full-stack web development",
      "React/Node.js experience",
      "Interest in education",
      "Startup mindset",
    ],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isActive: true,
  },
  {
    id: "4",
    supervisorId: "4",
    supervisor: {
      id: "4",
      name: "Dr. James Wilson",
      email: "james.wilson@university.edu",
      department: "Cybersecurity",
      title: "Assistant Professor",
      researchInterests: ["Network Security", "Blockchain"],
      tools: ["Wireshark", "Solidity"],
      bio: "",
      maxStudents: 4,
      currentStudents: 2,
      rating: 4.7,
    },
    title: "Blockchain Security Framework for Supply Chain Management",
    content:
      "Develop a comprehensive security framework for blockchain-based supply chain systems. This research project involves analyzing existing vulnerabilities, designing secure protocols, and implementing proof-of-concept solutions. Students will gain deep knowledge of blockchain technology, cryptographic protocols, and supply chain logistics.",
    tags: [
      "Blockchain",
      "Security",
      "Supply Chain",
      "Cryptography",
      "Research",
    ],
    projectType: "research",
    requirements: [
      "Understanding of blockchain",
      "Security background",
      "Programming skills",
      "Research interest",
    ],
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    isActive: true,
  },
];

export default function SupervisorFeed() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [posts, setPosts] = useState<SupervisorPost[]>(mockPosts);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const res = await supervisorService.listPosts();
      if (res.success) {
        const apiPosts = (res.data?.posts || []).map((p: any) => ({
          id: p._id,
          supervisorId: p.supervisor?._id,
          supervisor: {
            id: p.supervisor?._id,
            name:
              `${p.supervisor?.firstName ?? ""} ${
                p.supervisor?.lastName ?? ""
              }`.trim() || "Supervisor",
            email: p.supervisor?.email,
            department: "",
            title: "",
            researchInterests: [],
            tools: [],
            bio: "",
            maxStudents: 0,
            currentStudents: 0,
            rating: 0,
          },
          title: p.title,
          content: p.content,
          tags: p.tags || [],
          projectType: p.projectType || "research",
          requirements: [],
          postedAt: p.createdAt,
          isActive: p.isActive,
        }));
        setPosts(apiPosts);
      } else if (res.msg) {
        toast({
          title: "Failed to load posts",
          description: res.msg,
          variant: "destructive",
        });
      }
    })();
  }, []);

  const departments = Array.from(
    new Set(posts.map((p) => p.supervisor.department))
  );

  const filteredPosts = posts
    .filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    .filter(
      (post) =>
        typeFilter === "" ||
        typeFilter === "all" ||
        post.projectType === typeFilter
    )
    .filter(
      (post) =>
        departmentFilter === "" ||
        departmentFilter === "all" ||
        post.supervisor.department === departmentFilter
    );

  const toggleSave = (postId: string) => {
    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case "research":
        return "bg-primary/10 text-primary border-primary/20";
      case "industry":
        return "bg-success/10 text-success border-success/20";
      case "both":
        return "bg-accent/10 text-accent-foreground border-accent/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Supervisor Feed</h1>
        <p className="text-muted-foreground mt-1">
          Discover the latest project opportunities and research ideas from
          supervisors
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, keywords, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="industry">Industry</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>

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
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPosts.length} posts
        </p>
        <div className="flex gap-2">
          <Badge variant="outline">
            <Bookmark className="mr-1 h-3 w-3" />
            {savedPosts.length} Saved
          </Badge>
          <Badge variant="outline">
            <Filter className="mr-1 h-3 w-3" />
            {searchTerm || typeFilter || departmentFilter
              ? "Filtered"
              : "All Posts"}
          </Badge>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            className="hover:shadow-md transition-all duration-200"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.supervisor.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {post.supervisor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{post.supervisor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {post.supervisor.title} • {post.supervisor.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getProjectTypeColor(post.projectType)}>
                    {post.projectType === "both"
                      ? "Research + Industry"
                      : post.projectType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.postedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Title and Content */}
              <div>
                <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Requirements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {post.requirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {req}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs hover:bg-accent cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={
                      likedPosts.includes(post.id) ? "text-red-500" : ""
                    }
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${
                        likedPosts.includes(post.id) ? "fill-current" : ""
                      }`}
                    />
                    {likedPosts.includes(post.id) ? "Liked" : "Like"}
                  </Button>

                  <Button variant="ghost" size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Comment
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSave(post.id)}
                    className={
                      savedPosts.includes(post.id) ? "text-primary" : ""
                    }
                  >
                    <Bookmark
                      className={`h-4 w-4 ${
                        savedPosts.includes(post.id) ? "fill-current" : ""
                      }`}
                    />
                  </Button>

                  <Button size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Contact Supervisor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No posts found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new
            posts.
          </p>
        </div>
      )}
    </div>
  );
}
