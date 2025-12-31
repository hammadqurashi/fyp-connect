import { Users } from "lucide-react";

export function NoGroupView() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">Join a Group First</h2>
          <p className="text-muted-foreground">
            You need to be part of a group to access the collaboration features.
            Please join or create a group to start collaborating with your team
            members and supervisor.
          </p>
        </div>
      </div>
    </div>
  );
}

