import { useEffect, useState } from "react";
import supervisorService from "@/core/services/api/supervisor-service";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/components/ui/use-toast";

export default function SupervisorPosts() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string>("");
  const [posts, setPosts] = useState<any[]>([]);
  const { toast } = useToast();

  const load = async () => {
    const res = await supervisorService.listPosts();
    if (res.success) {
      setPosts(res.data?.posts || []);
    } else if (res.msg) {
      toast({
        title: "Failed to load posts",
        description: res.msg,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const payload = {
      title,
      content,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const res = await supervisorService.createPost(payload);
    if (res.success) {
      toast({ title: "Post created" });
      setTitle("");
      setContent("");
      setTags("");
      load();
    } else {
      toast({
        title: "Failed to create post",
        description: res.msg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Supervisor Posts</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage your posts visible to students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Create Post</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              onClick={create}
              disabled={!title.trim() || !content.trim()}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {posts.map((p) => (
          <Card key={p._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.title}</h3>
                <div className="text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">{p.content}</p>
              <div className="flex gap-2 flex-wrap">
                {(p.tags || []).map((t: string) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
