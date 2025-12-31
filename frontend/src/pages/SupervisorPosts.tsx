import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Heart, MessageCircle, Trash2, ChevronDown, ChevronUp, Users } from "lucide-react";
import supervisorService from "@/core/services/api/supervisor-service";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";

export default function SupervisorPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [expandedLikes, setExpandedLikes] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      const res = await supervisorService.deletePost(postToDelete);
      if (res.success) {
        toast({
          title: "Success",
          description: "Post deleted successfully",
        });
        load();
      } else {
        toast({
          title: "Error",
          description: res.msg || "Failed to delete post",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Supervisor Posts</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your posts visible to students.
          </p>
        </div>
        <Button onClick={() => navigate("/supervisor/posts/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {loading && posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No posts yet</p>
            <Button onClick={() => navigate("/supervisor/posts/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Collapsible
                          open={expandedLikes.has(post._id)}
                          onOpenChange={(open) => {
                            const newSet = new Set(expandedLikes);
                            if (open) {
                              newSet.add(post._id);
                            } else {
                              newSet.delete(post._id);
                            }
                            setExpandedLikes(newSet);
                          }}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1 text-muted-foreground hover:text-foreground"
                            >
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>{post.likesCount || 0}</span>
                                {(post.likesCount || 0) > 0 && (
                                  expandedLikes.has(post._id) ? (
                                    <ChevronUp className="h-3 w-3 ml-1" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  )
                                )}
                              </div>
                            </Button>
                          </CollapsibleTrigger>
                        </Collapsible>
                        <Collapsible
                          open={expandedComments.has(post._id)}
                          onOpenChange={(open) => {
                            const newSet = new Set(expandedComments);
                            if (open) {
                              newSet.add(post._id);
                            } else {
                              newSet.delete(post._id);
                            }
                            setExpandedComments(newSet);
                          }}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1 text-muted-foreground hover:text-foreground"
                            >
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.commentsCount || 0}</span>
                                {(post.commentsCount || 0) > 0 && (
                                  expandedComments.has(post._id) ? (
                                    <ChevronUp className="h-3 w-3 ml-1" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  )
                                )}
                              </div>
                            </Button>
                          </CollapsibleTrigger>
                        </Collapsible>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPostToDelete(post._id);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className="text-muted-foreground prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                {post.requirements && post.requirements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                    <div className="space-y-1">
                      {post.requirements.map((req: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {(post.tags || []).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {post.projectType && (
                  <Badge variant="secondary" className="text-xs">
                    {post.projectType === "both"
                      ? "Research + Industry"
                      : post.projectType}
                  </Badge>
                )}

                {/* Likes Section */}
                {expandedLikes.has(post._id) && (post.likesCount || 0) > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-muted/50 rounded-md p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Users className="h-4 w-4" />
                        <span>Liked by ({post.likesCount}):</span>
                      </div>
                      {post.likes?.map((like: any) => (
                        <div
                          key={like._id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={like.user?.profileImg} />
                            <AvatarFallback className="text-xs">
                              {like.user?.firstName?.[0]}
                              {like.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {like.user?.firstName} {like.user?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDistanceToNow(new Date(like.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                {expandedComments.has(post._id) && (post.commentsCount || 0) > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-muted/50 rounded-md p-3 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>Comments ({post.commentsCount}):</span>
                      </div>
                      {post.comments?.map((comment: any) => (
                        <div
                          key={comment._id}
                          className="flex gap-3 pb-3 border-b last:border-0 last:pb-0"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.user?.profileImg} />
                            <AvatarFallback className="text-xs">
                              {comment.user?.firstName?.[0]}
                              {comment.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {comment.user?.firstName}{" "}
                                {comment.user?.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(comment.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
