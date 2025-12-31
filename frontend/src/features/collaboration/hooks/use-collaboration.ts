import { useCollaborationContext } from "../context/collaboration-context";

export const useCollaboration = () => {
  return useCollaborationContext();
};

