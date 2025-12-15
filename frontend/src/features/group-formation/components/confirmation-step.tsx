import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";

interface ConfirmationStepProps {
  form: UseFormReturn<any>;
  selectedStudentsCount: number;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  form,
  selectedStudentsCount,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Group Created Successfully!
        </h2>
        <p className="text-muted-foreground">
          Your group has been created and invitations have been sent to selected
          students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Group Name</Label>
            <p className="mt-1">{form.watch("name")}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              {form.watch("description")}
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium">Invitations Sent</Label>
            <p className="mt-1">{selectedStudentsCount} student{selectedStudentsCount !== 1 ? "s" : ""}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

