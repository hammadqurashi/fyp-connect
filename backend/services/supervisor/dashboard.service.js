import BaseService from "../base-service.js";
import Post from "../../models/post.js";
import PostLike from "../../models/post-like.js";
import PostComment from "../../models/post-comment.js";
import SupervisionRequest from "../../models/supervision-request.js";
import Group from "../../models/group.js";
import Notification from "../../models/notification.js";
import User from "../../models/user.js";
import Student from "../../models/student.js";

class SupervisorDashboardService extends BaseService {
  async getDashboardData(supervisorId) {
    try {
      // Get supervisor profile
      const user = await User.findById(supervisorId).lean();
      if (!user) {
        return this.handleResponse(404, false, "User not found");
      }

      // Get posts statistics
      const totalPosts = await Post.countDocuments({
        supervisor: supervisorId,
      });
      const activePosts = await Post.countDocuments({
        supervisor: supervisorId,
        isActive: true,
      });

      // Get posts engagement
      const posts = await Post.find({ supervisor: supervisorId }).lean();
      const postsStats = await Promise.all(
        posts.map(async (post) => {
          const [likesCount, commentsCount] = await Promise.all([
            PostLike.countDocuments({ post: post._id }),
            PostComment.countDocuments({ post: post._id }),
          ]);

          return {
            postId: post._id,
            title: post.title,
            likesCount,
            commentsCount,
            totalEngagement: likesCount + commentsCount,
            createdAt: post.createdAt,
          };
        })
      );

      const totalLikes = postsStats.reduce((sum, p) => sum + p.likesCount, 0);
      const totalComments = postsStats.reduce(
        (sum, p) => sum + p.commentsCount,
        0
      );
      const totalEngagement = totalLikes + totalComments;

      // Get supervision requests
      const pendingRequests = await SupervisionRequest.countDocuments({
        supervisor: supervisorId,
        status: "pending",
      });

      // Get supervised groups
      const supervisedGroups = await Group.find({
        supervisor: supervisorId,
      })
        .populate("createdBy", "firstName lastName email")
        .populate("members", "firstName lastName email")
        .lean();

      const groupsWithStats = await Promise.all(
        supervisedGroups.map(async (group) => {
          const memberIds = [
            group.createdBy._id,
            ...(group.members || []).map((m) => m._id),
          ];

          const students = await Student.find({
            userId: { $in: memberIds },
          }).lean();

          return {
            ...group,
            memberCount: memberIds.length,
            students: students.map((s) => ({
              userId: s.userId,
              department: s.department,
              skills: s.skills,
              interests: s.interests,
            })),
          };
        })
      );

      // Get recent notifications
      const unreadNotifications = await Notification.countDocuments({
        recipient: supervisorId,
        read: false,
      });

      const recentNotifications = await Notification.find({
        recipient: supervisorId,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("recipient", "firstName lastName email profileImg")
        .lean();

      // Calculate average engagement per post
      const avgEngagementPerPost =
        totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0;

      // Get top performing post
      const topPost =
        postsStats.sort((a, b) => b.totalEngagement - a.totalEngagement)[0] ||
        null;

      return this.handleResponse(200, true, "Dashboard data retrieved", {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        stats: {
          totalPosts,
          activePosts,
          totalLikes,
          totalComments,
          totalEngagement,
          avgEngagementPerPost,
          pendingRequests,
          supervisedGroups: supervisedGroups.length,
          unreadNotifications,
        },
        postsStats,
        topPost,
        supervisedGroups: groupsWithStats,
        recentNotifications,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }
}

const supervisorDashboardService = new SupervisorDashboardService();

export default supervisorDashboardService;
