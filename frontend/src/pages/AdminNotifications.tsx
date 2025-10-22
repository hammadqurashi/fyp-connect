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

export default function AdminNotifications() {
  const [audience, setAudience] = useState("student");
  const [recipientIds, setRecipientIds] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const onSend = async () => {
    const payload: any = { audience, title, message };
    if (audience === "specific") {
      const ids = recipientIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      payload.recipientIds = ids;
    }
    const res = await notificationService.send(payload);
    if (res.success) {
      toast({ title: "Notification(s) sent" });
      setTitle("");
      setMessage("");
      setRecipientIds("");
    } else {
      toast({
        title: "Failed to send",
        description: res.msg,
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
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="supervisor">Supervisors</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="specific">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
              />
            </div>
          </div>

          {audience === "specific" && (
            <div>
              <Label>Recipient User IDs (comma separated)</Label>
              <Input
                value={recipientIds}
                onChange={(e) => setRecipientIds(e.target.value)}
                placeholder="e.g., 64f..., 64a..."
              />
            </div>
          )}

          <div>
            <Label>Message</Label>
            <Textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onSend}
              disabled={!title.trim() || !message.trim()}
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
