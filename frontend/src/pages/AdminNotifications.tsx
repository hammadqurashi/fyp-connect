import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import notificationService from "@/core/services/api/notification-service";
import { useToast } from "@/shared/components/ui/use-toast";
import { UserSelector } from "@/features/admin/components/user-selector";

export default function AdminNotifications() {
  const [audience, setAudience] = useState("student");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const onSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }

    if (audience === "specific" && selectedUserIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one user",
        variant: "destructive",
      });
      return;
    }

    const payload: any = { audience, title, message };
    if (audience === "specific") {
      payload.recipientIds = selectedUserIds;
    }

    try {
      const res = await notificationService.send(payload);
      if (res.success) {
        toast({ title: "Success", description: "Notification(s) sent successfully" });
        setTitle("");
        setMessage("");
        setSelectedUserIds([]);
        setAudience("student");
      } else {
        toast({
          title: "Failed to send",
          description: res.msg || "Failed to send notification",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Send notifications to students, supervisors, or specific users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Send Notification</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">All Students</SelectItem>
                  <SelectItem value="supervisor">All Supervisors</SelectItem>
                  <SelectItem value="both">Both (All Students & Supervisors)</SelectItem>
                  <SelectItem value="specific">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notification title"
                required
              />
            </div>
          </div>

          {audience === "specific" && (
            <div>
              <Label>Select Users *</Label>
              <UserSelector
                selectedUserIds={selectedUserIds}
                onSelectionChange={setSelectedUserIds}
              />
            </div>
          )}

          <div>
            <Label>Message *</Label>
            <Textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              required
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onSend}
              disabled={
                !title.trim() ||
                !message.trim() ||
                (audience === "specific" && selectedUserIds.length === 0)
              }
            >
              Send Notification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
