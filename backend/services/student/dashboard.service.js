import BaseService from "../base-service.js";
import Group from "../../models/group.js";
import PostLike from "../../models/post-like.js";
import PostComment from "../../models/post-comment.js";
import Post from "../../models/post.js";
import Notification from "../../models/notification.js";
import SupervisionRequest from "../../models/supervision-request.js";
import Student from "../../models/student.js";
import Supervisor from "../../models/supervisor.js";
import User from "../../models/user.js";
import studentSupervisorService from "./supervisor.service.js";

class StudentDashboardService extends BaseService {
  async getDashboardData(userId) {
    try {
      // Get student profile
      const student = await Student.findOne({ userId }).lean();
      if (!student) {
        return this.handleResponse(404, false, "Student profile not found");
      }

      // Get user's group
      const group = await Group.findOne({
        $or: [{ createdBy: userId }, { members: userId }],
      })
        .populate("createdBy", "firstName lastName email profileImg")
        .populate("members", "firstName lastName email profileImg")
        .populate("supervisor", "firstName lastName email profileImg")
        .lean();

      // Get group stats
      const groupStats = {
        hasGroup: !!group,
        memberCount: group ? (group.members?.length || 0) + 1 : 0, // +1 for creator
        maxMembers: 4,
        hasSupervisor: !!group?.supervisor,
        isFormed: group?.isFormed || false,
      };

      // Get supervisor match percentage (if group exists)
      let supervisorMatch = 0;
      if (group?.supervisor) {
        const supervisorProfile = await Supervisor.findOne({
          userId: group.supervisor._id,
        }).lean();

        if (supervisorProfile && student) {
          // Calculate match based on skills and interests
          let matchScore = 0;
          let totalWeight = 0;

          // Skills match (50% weight)
          if (
            student.skills &&
            student.skills.length > 0 &&
            supervisorProfile.skills &&
            supervisorProfile.skills.length > 0
          ) {
            totalWeight += 50;
            const commonSkills = student.skills.filter((skill) =>
              supervisorProfile.skills.includes(skill)
            );
            matchScore +=
              (commonSkills.length /
                Math.max(
                  student.skills.length,
                  supervisorProfile.skills.length
                )) *
              50;
          }

          // Interests match (50% weight)
          if (
            student.interests &&
            student.interests.length > 0 &&
            supervisorProfile.interests &&
            supervisorProfile.interests.length > 0
          ) {
            totalWeight += 50;
            const commonInterests = student.interests.filter((interest) =>
              supervisorProfile.interests.includes(interest)
            );
            matchScore +=
              (commonInterests.length /
                Math.max(
                  student.interests.length,
                  supervisorProfile.interests.length
                )) *
              50;
          }

          supervisorMatch =
            totalWeight > 0 ? Math.round((matchScore / totalWeight) * 100) : 0;
        }
      }

      // Get recent notifications count
      const unreadNotifications = await Notification.countDocuments({
        recipient: userId,
        read: false,
      });

      // Get supervision request status
      let supervisionStatus = null;
      if (group) {
        const request = await SupervisionRequest.findOne({
          group: group._id,
        }).lean();
        if (request) {
          supervisionStatus = request.status; // pending, accepted, rejected
        }
      }

      // Get latest 5 posts with engagement
      const recentPosts = await Post.find({ isActive: true })
        .populate("supervisor", "firstName lastName email profileImg")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      const postsWithEngagement = await Promise.all(
        recentPosts.map(async (post) => {
          const [likesCount, commentsCount, isLiked] = await Promise.all([
            PostLike.countDocuments({ post: post._id }),
            PostComment.countDocuments({ post: post._id }),
            PostLike.exists({ post: post._id, user: userId }),
          ]);

          return {
            ...post,
            likesCount,
            commentsCount,
            isLiked: !!isLiked,
          };
        })
      );

      // Get top 5 supervisors with match percentage
      const supervisorsResponse =
        await studentSupervisorService.getAllSupervisors(userId);
      const allSupervisors = supervisorsResponse.data?.supervisors || [];
      const topSupervisors = allSupervisors
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 5)
        .map((s) => ({
          id: s.id,
          firstName: s.name.split(" ")[0] || "",
          lastName: s.name.split(" ").slice(1).join(" ") || "",
          email: s.email,
          profileImg: s.avatar,
          department: s.department,
          title: s.title,
          matchPercentage: s.matchPercentage,
        }));

      // Get recent notifications
      const recentNotifications = await Notification.find({
        recipient: userId,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("recipient", "firstName lastName email profileImg")
        .lean();

      // Get user details
      const user = await User.findById(userId).lean();

      return this.handleResponse(200, true, "Dashboard data retrieved", {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        group: group
          ? {
              ...group,
              memberCount: groupStats.memberCount,
            }
          : null,
        groupStats,
        supervisionStatus,
        topSupervisors,
        recentNotifications,
        recentPosts: postsWithEngagement.slice(0, 5), // Latest 5 posts
      });
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }
  }
}

const studentDashboardService = new StudentDashboardService();

export default studentDashboardService;
