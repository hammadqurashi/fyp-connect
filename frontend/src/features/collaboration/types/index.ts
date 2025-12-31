export interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImg?: string;
  };
  content: string;
  type: "text" | "file" | "image";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
  isCurrentUser?: boolean;
}

export interface GroupMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImg?: string;
  role: "student" | "supervisor";
  status?: "online" | "away" | "offline";
  lastSeen?: Date;
}

export interface GroupFile {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  members: GroupMember[];
  supervisor?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isFormed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationState {
  group: Group | null;
  messages: ChatMessage[];
  members: GroupMember[];
  files: GroupFile[];
  loading: boolean;
  error: string | null;
  hasGroup: boolean;
}

