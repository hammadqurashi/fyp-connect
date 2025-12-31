import { useEffect, useState, useRef, useCallback } from "react";
import {
  Search,
  Heart,
  MessageCircle,
  Mail,
  Send,
  X,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/shared/components/ui/use-toast";
import studentService from "@/core/services/api/student-service";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface Post {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  requirements?: string[];
  projectType: "research" | "industry" | "both";
    supervisor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImg?: string;
    department?: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

export default function SupervisorFeed() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likingPost, setLikingPost] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const loadPosts = useCallback(
    async (pageNum: number, search: string, reset: boolean = false) => {
      if (loading) return;
      setLoading(true);

      try {
        const res = await studentService.getAllPosts({
          page: pageNum,
          limit: 10,
          search: search || undefined,
        });

        if (res.success && res.data) {
          const newPosts = res.data.posts || [];
          if (reset) {
            setPosts(newPosts);
          } else {
            setPosts((prev) => [...prev, ...newPosts]);
          }
          setHasMore(res.data.pagination?.hasMore || false);
        } else {
          toast({
            title: "Error",
            description: res.msg || "Failed to load posts",
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
    },
    [loading, toast]
  );

  useEffect(() => {
    setPage(1);
    setPosts([]);
    loadPosts(1, searchTerm, true);
  }, [searchTerm]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadPosts(nextPage, searchTerm, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, page, searchTerm, loadPosts]);

  const handleLike = async (postId: string) => {
    if (likingPost) return;
    setLikingPost(postId);

    try {
      const res = await studentService.toggleLike(postId);
      if (res.success && res.data) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  isLiked: res.data.isLiked,
                  likesCount: res.data.likesCount,
                }
              : p
          )
        );
      } else {
        toast({
          title: "Error",
          description: res.msg || "Failed to like post",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive",
      });
    } finally {
      setLikingPost(null);
    }
  };

  const loadComments = async (postId: string) => {
    setLoadingComments(true);
    try {
      const res = await studentService.getComments(postId, { page: 1, limit: 50 });
      if (res.success && res.data) {
        setComments(res.data.comments || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleOpenComments = (post: Post) => {
    setSelectedPost(post);
    loadComments(post._id);
  };

  const handleSubmitComment = async () => {
    if (!selectedPost || !commentInput.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await studentService.addComment(
        selectedPost._id,
        commentInput.trim()
      );
      if (res.success && res.data) {
        setComments((prev) => [res.data.comment, ...prev]);
        setPosts((prev) =>
          prev.map((p) =>
            p._id === selectedPost._id
              ? { ...p, commentsCount: res.data.commentsCount }
              : p
          )
        );
        setCommentInput("");
      } else {
        toast({
          title: "Error",
          description: res.msg || "Failed to add comment",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case "research":
        return "bg-primary/10 text-primary border-primary/20";
      case "industry":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "both":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Supervisor Feed</h1>
        <p className="text-muted-foreground mt-1">
          Discover the latest project opportunities and research ideas from
          supervisors
        </p>
      </div>

      {/* Search */}
      <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, keywords, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card
            key={post._id}
            className="hover:shadow-md transition-all duration-200"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.supervisor.profileImg} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {post.supervisor.firstName[0]}
                      {post.supervisor.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {post.supervisor.firstName} {post.supervisor.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {post.supervisor.department || "Supervisor"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getProjectTypeColor(post.projectType)}>
                    {post.projectType === "both"
                      ? "Research + Industry"
                      : post.projectType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Title and Content */}
              <div>
                <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
                <div
                  className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Requirements */}
              {post.requirements && post.requirements.length > 0 && (
              <div>
                  <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                  <div className="space-y-1">
                  {post.requirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {req}
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs hover:bg-accent cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post._id)}
                    disabled={likingPost === post._id}
                    className={post.isLiked ? "text-red-500" : ""}
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${
                        post.isLiked ? "fill-current" : ""
                      }`}
                    />
                    {post.likesCount || 0}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenComments(post)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {post.commentsCount || 0}
                  </Button>
                </div>

                <Button
                  size="sm"
                  onClick={() =>
                    (window.location.href = `mailto:${post.supervisor.email}`)
                  }
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Supervisor
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Loading more posts...</p>
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-4" />

      {/* No posts */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No posts found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new
            posts.
          </p>
        </div>
      )}

      {/* Comments Dialog */}
      <Dialog
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {loadingComments ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user?.profileImg} />
                      <AvatarFallback>
                        {comment.user?.firstName?.[0]}
                        {comment.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="flex gap-2 pt-4 border-t">
            <Textarea
              placeholder="Write a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!commentInput.trim() || submittingComment}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
