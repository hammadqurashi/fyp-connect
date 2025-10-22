export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  creditHours: number;
  skills: string[];
  interests: string[];
  bio?: string;
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  tagline: string;
  description: string;
  leaderId: string;
  members: Student[];
  maxMembers: number;
  skills: string[];
  department: string;
  interests: string[];
  createdAt: string;
  status: "active" | "completed" | "disbanded";
}

export interface GroupRequest {
  id: string;
  groupId: string;
  studentId: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt: string;
}
