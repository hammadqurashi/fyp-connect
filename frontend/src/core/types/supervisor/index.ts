export interface Supervisor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  title: string;
  researchInterests: string[];
  tools: string[];
  bio: string;
  maxStudents: number;
  currentStudents: number;
  rating: number;
  matchPercentage?: number;
}

export interface SupervisorPost {
  id: string;
  supervisorId: string;
  supervisor: Supervisor;
  title: string;
  content: string;
  tags: string[];
  projectType: "research" | "industry" | "both";
  requirements: string[];
  postedAt: string;
  isActive: boolean;
}

export interface SupervisorRequest {
  id: string;
  groupId: string;
  supervisorId: string;
  status: "pending" | "accepted" | "rejected";
  message: string;
  createdAt: string;
}
