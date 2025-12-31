import BaseService from "../base-service.js";
import Post from "../../models/post.js";
import PostLike from "../../models/post-like.js";
import PostComment from "../../models/post-comment.js";
import User from "../../models/user.js";
import Supervisor from "../../models/supervisor.js";

class StudentPostService extends BaseService {
  // Get all active posts with pagination
  async getAllPosts(userId, query) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const search = query.search || "";
      const skip = (page - 1) * limit;

      // Build search query
      const searchQuery = {
        isActive: true,
      };

      if (search) {
        searchQuery.$or = [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      // Get posts with supervisor details
      const posts = await Post.find(searchQuery)
        .populate("supervisor", "firstName lastName email profileImg")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Get supervisor details for each post
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const supervisor = await Supervisor.findOne({
            userId: post.supervisor._id,
          }).lean();

          const [likesCount, commentsCount, isLiked] = await Promise.all([
            PostLike.countDocuments({ post: post._id }),
            PostComment.countDocuments({ post: post._id }),
            userId ? PostLike.exists({ post: post._id, user: userId }) : false,
          ]);

          return {
            ...post,
            supervisor: {
              ...post.supervisor,
              department: supervisor?.department,
            },
            likesCount,
            commentsCount,
            isLiked: !!isLiked,
          };
        })
      );

      // Get total count for pagination
      const total = await Post.countDocuments(searchQuery);

      return this.handleResponse(200, true, "Posts retrieved", {
        posts: enrichedPosts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + limit < total,
        },
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Like/Unlike a post
  async toggleLike(userId, postId) {
    try {
      const post = await Post.findById(postId).lean();
      if (!post) {
        return this.handleResponse(404, false, "Post not found");
      }

      const existingLike = await PostLike.findOne({
        post: postId,
        user: userId,
      }).lean();

      if (existingLike) {
        // Unlike
        await PostLike.findByIdAndDelete(existingLike._id);
        const likesCount = await PostLike.countDocuments({ post: postId });
        return this.handleResponse(200, true, "Post unliked", {
          isLiked: false,
          likesCount,
        });
      } else {
        // Like
        await PostLike.create({ post: postId, user: userId });
        const likesCount = await PostLike.countDocuments({ post: postId });
        return this.handleResponse(200, true, "Post liked", {
          isLiked: true,
          likesCount,
        });
      }
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Get comments for a post
  async getComments(postId, query) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;
      const skip = (page - 1) * limit;

      const comments = await PostComment.find({ post: postId })
        .populate("user", "firstName lastName email profileImg")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await PostComment.countDocuments({ post: postId });

      return this.handleResponse(200, true, "Comments retrieved", {
        comments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Add a comment
  async addComment(userId, postId, content) {
    try {
      const post = await Post.findById(postId).lean();
      if (!post) {
        return this.handleResponse(404, false, "Post not found");
      }

      if (!content || !content.trim()) {
        return this.handleResponse(400, false, "Comment content is required");
      }

      const comment = await PostComment.create({
        post: postId,
        user: userId,
        content: content.trim(),
      });

      const populatedComment = await PostComment.findById(comment._id)
        .populate("user", "firstName lastName email profileImg")
        .lean();

      const commentsCount = await PostComment.countDocuments({ post: postId });

      return this.handleResponse(201, true, "Comment added", {
        comment: populatedComment,
        commentsCount,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Delete a comment
  async deleteComment(userId, commentId) {
    try {
      const comment = await PostComment.findOne({
        _id: commentId,
        user: userId,
      }).lean();

      if (!comment) {
        return this.handleResponse(404, false, "Comment not found");
      }

      await PostComment.findByIdAndDelete(commentId);

      const commentsCount = await PostComment.countDocuments({
        post: comment.post,
      });

      return this.handleResponse(200, true, "Comment deleted", {
        commentsCount,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }
}

const studentPostService = new StudentPostService();

export default studentPostService;

