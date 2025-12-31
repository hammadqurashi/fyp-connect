import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  CollaborationState,
  ChatMessage,
  Group,
  GroupMember,
  GroupFile,
} from "../types";
import { useSocket } from "../hooks/use-socket";
import httpService from "@/core/services/local/http-service";
import { useSelector } from "react-redux";

interface CollaborationContextType {
  state: CollaborationState;
  sendMessage: (content: string, file?: File) => Promise<void>;
  loadMessages: (group: Group) => Promise<void>;
  loadFiles: (group: Group) => Promise<void>;
  isConnected: boolean;
}

const CollaborationContext = createContext<CollaborationContextType | null>(
  null
);

export const useCollaborationContext = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error(
      "useCollaborationContext must be used within CollaborationProvider"
    );
  }
  return context;
};

interface CollaborationProviderProps {
  children: React.ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<CollaborationState>({
    group: null,
    messages: [],
    members: [],
    files: [],
    loading: true,
    error: null,
    hasGroup: false,
  });

  const user = useSelector((state: any) => state.auth.user);
  const { socket, isConnected } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load group and initialize
  useEffect(() => {
    const loadGroup = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Get user's group (works for both students and supervisors)
        const res = await httpService.get<any>("/group/my");

        if (res.success && res.data?.group) {
          const group = res.data.group;

          // Build members list including creator, members, and supervisor
          const allMembers: any[] = [];

          // Add creator as member if not already in members array
          if (group.createdBy) {
            const creatorInMembers = group.members?.some(
              (m: any) => m._id?.toString() === group.createdBy._id?.toString()
            );
            if (!creatorInMembers) {
              allMembers.push({
                ...group.createdBy,
                role: "student" as const,
              });
            }
          }

          // Add regular members
          if (group.members) {
            group.members.forEach((member: any) => {
              allMembers.push({
                ...member,
                role: "student" as const,
              });
            });
          }

          // Add supervisor if exists
          if (group.supervisor) {
            allMembers.push({
              ...group.supervisor,
              role: "supervisor" as const,
            });
          }


          // Initialize all members as offline, then set current user as online
          const membersWithStatus = allMembers.map((member) => ({
            ...member,
            status: member._id === user?.id ? ("online" as const) : ("offline" as const),
          }));

          setState((prev) => ({
            ...prev,
            group,
            hasGroup: true,
            members: membersWithStatus,
          }));

          // Join socket room
          if (socket && group._id) {
            socket.emit("join_group", { groupId: group._id });
          }

          // Load messages and files
          await Promise.all([loadMessages(group), loadFiles(group)]);
        } else {
          setState((prev) => ({
            ...prev,
            hasGroup: false,
            loading: false,
          }));
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error?.message || "Failed to load group",
          loading: false,
          hasGroup: false,
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    if (user) {
      loadGroup();
    }
  }, [user, socket]);

  // Track online status
  useEffect(() => {
    if (!socket || !state.group) return;

    const handleUserOnline = (data: { userId: string }) => {
      setState((prev) => ({
        ...prev,
        members: prev.members.map((member) =>
          member._id === data.userId
            ? { ...member, status: "online" as const }
            : member
        ),
      }));
    };

    const handleUserOffline = (data: { userId: string }) => {
      setState((prev) => ({
        ...prev,
        members: prev.members.map((member) =>
          member._id === data.userId
            ? {
                ...member,
                status: "offline" as const,
                lastSeen: new Date(),
              }
            : member
        ),
      }));
    };

    const handleGroupOnlineUsers = (data: { userIds: string[] }) => {
      setState((prev) => ({
        ...prev,
        members: prev.members.map((member) =>
          data.userIds.includes(member._id)
            ? { ...member, status: "online" as const }
            : member
        ),
      }));
    };

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("group_online_users", handleGroupOnlineUsers);

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("group_online_users", handleGroupOnlineUsers);
    };
  }, [socket, state.group]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !state.group) return;

    const handleNewMessage = (data: {
      message: string;
      senderId: string;
      ts: number;
      type?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    }) => {
      // Fetch sender details
      const sender = state.members.find((m) => m._id === data.senderId) || {
        _id: data.senderId,
        firstName: "Unknown",
        lastName: "User",
        email: "",
        role: "student" as const,
      };

      const newMessage: ChatMessage = {
        _id: `temp-${Date.now()}`,
        sender: {
          _id: sender._id,
          firstName: sender.firstName,
          lastName: sender.lastName,
          email: sender.email,
          profileImg: sender.profileImg,
        },
        content: data.message,
        type: (data.type as any) || "text",
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        createdAt: new Date(data.ts),
        updatedAt: new Date(data.ts),
        isCurrentUser: data.senderId === user?.id,
      };

      setState((prev) => {
        const updatedMessages = [...prev.messages, newMessage];
        
        // If it's a file message, also add to files list if not already present
        let updatedFiles = prev.files;
        if ((data.type === "file" || data.type === "image") && data.fileUrl && data.fileName) {
          const fileExists = prev.files.some(
            (f) => f.fileUrl === data.fileUrl || (f.fileName === data.fileName && f.fileSize === data.fileSize)
          );
          if (!fileExists) {
            const newFile: GroupFile = {
              _id: `temp-file-${Date.now()}`,
              fileName: data.fileName,
              fileUrl: data.fileUrl,
              fileSize: data.fileSize || 0,
              fileType: data.type === "image" ? "image/*" : "application/*",
              uploadedBy: {
                _id: sender._id,
                firstName: sender.firstName,
                lastName: sender.lastName,
              },
              createdAt: new Date(data.ts),
            };
            updatedFiles = [newFile, ...prev.files];
          }
        }
        
        return {
          ...prev,
          messages: updatedMessages,
          files: updatedFiles,
        };
      });
    };

    socket.on("group_message", handleNewMessage);

    return () => {
      socket.off("group_message", handleNewMessage);
    };
  }, [socket, state.group, state.members, user]);

  const loadMessages = async (group: Group) => {
    if (!group?._id) return;

    try {
      const res = await httpService.get<any>(`/group/${group._id}/messages`);
      if (res.success && res.data?.messages) {
        const messages: ChatMessage[] = res.data.messages.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt),
          isCurrentUser: m.sender._id === user?.id,
        }));
        setState((prev) => ({ ...prev, messages }));
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const loadFiles = async (group: Group) => {
    if (!group?._id) return;
    
    try {
      const res = await httpService.get<any>(`/group/${group._id}/files`);
      if (res.success && res.data?.files) {
        const files: GroupFile[] = res.data.files
          .map((f: any) => ({
            ...f,
            createdAt: new Date(f.createdAt),
          }))
          .sort((a: GroupFile, b: GroupFile) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          ); // Sort by newest first
        setState((prev) => ({ ...prev, files }));
      }
    } catch (error) {
      console.error("Failed to load files:", error);
    }
  };

  const sendMessage = async (content: string, file?: File) => {
    if (!state.group?._id || (!content.trim() && !file)) return;

    try {
      if (file) {
        // Upload file first
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await httpService.post<any>(
          `/group/${state.group._id}/files`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (uploadRes.success && uploadRes.data?.file) {
          const fileData = uploadRes.data.file;
          const messageType = file.type.startsWith("image/") ? "image" : "file";

          // Add file to state immediately (will be replaced when we reload files)
          const newFile: GroupFile = {
            _id: fileData._id || `temp-${Date.now()}`,
            fileName: fileData.fileName,
            fileUrl: fileData.fileUrl,
            fileSize: fileData.fileSize,
            fileType: fileData.fileType || file.type,
            uploadedBy: fileData.uploadedBy || {
              _id: user?.id || "",
              firstName: user?.firstName || "",
              lastName: user?.lastName || "",
            },
            createdAt: new Date(fileData.createdAt || Date.now()),
          };

          setState((prev) => {
            // Check if file already exists to avoid duplicates
            const fileExists = prev.files.some(
              (f) => f.fileUrl === newFile.fileUrl || f._id === newFile._id
            );
            const updatedFiles = fileExists
              ? prev.files
              : [newFile, ...prev.files]; // Add to beginning of list
            
            return {
              ...prev,
              files: updatedFiles,
            };
          });

          // Reload files to get the proper file with correct _id and avoid duplicates
          if (state.group) {
            await loadFiles(state.group);
          }

          // Create message in database
          const messageRes = await httpService.post<any>(
            `/group/${state.group._id}/messages`,
            {
              content: content || fileData.fileName,
              type: messageType,
              fileUrl: fileData.fileUrl,
              fileName: fileData.fileName,
              fileSize: fileData.fileSize,
            }
          );

          // Send message via socket
          if (socket) {
            socket.emit("group_message", {
              groupId: state.group._id,
              message: content || fileData.fileName,
              senderId: user?.id,
              type: messageType,
              fileUrl: fileData.fileUrl,
              fileName: fileData.fileName,
              fileSize: fileData.fileSize,
            });
          }
        }
      } else {
        // Create text message in database
        await httpService.post<any>(`/group/${state.group._id}/messages`, {
          content,
          type: "text",
        });

        // Send message via socket
        if (socket) {
          socket.emit("group_message", {
            groupId: state.group._id,
            message: content,
            senderId: user?.id,
            type: "text",
          });
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  const value: CollaborationContextType = {
    state,
    sendMessage,
    loadMessages,
    loadFiles,
    isConnected,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};
