import BaseService from "../base-service.js";
import User from "../../models/user.js";
import Student from "../../models/student.js";
import Supervisor from "../../models/supervisor.js";
import Group from "../../models/group.js";
import Notification from "../../models/notification.js";
import SupervisionRequest from "../../models/supervision-request.js";
import Post from "../../models/post.js";
import PostLike from "../../models/post-like.js";
import PostComment from "../../models/post-comment.js";

class AdminDashboardService extends BaseService {
  async getDashboardData() {
    try {
      // User Statistics
      const totalStudents = await User.countDocuments({ role: "student" });
      const activeStudents = await User.countDocuments({
        role: "student",
        isActive: { $ne: false },
      });
      const inactiveStudents = totalStudents - activeStudents;

      const totalSupervisors = await User.countDocuments({ role: "supervisor" });
      const activeSupervisors = await User.countDocuments({
        role: "supervisor",
        isActive: { $ne: false },
      });
      const inactiveSupervisors = totalSupervisors - activeSupervisors;

      const totalAdmins = await User.countDocuments({ role: "admin" });

      // Group Statistics
      const totalGroups = await Group.countDocuments();
      const formedGroups = await Group.countDocuments({ isFormed: true });
      const groupsWithSupervisor = await Group.countDocuments({
        supervisor: { $exists: true, $ne: null },
      });
      const groupsWithoutSupervisor = totalGroups - groupsWithSupervisor;

      // Profile Completion Statistics
      const studentsWithProfile = await Student.countDocuments({
        profileCompleted: true,
      });
      const supervisorsWithProfile = await Supervisor.countDocuments({
        profileCompleted: true,
      });

      // Supervision Request Statistics
      const pendingRequests = await SupervisionRequest.countDocuments({
        status: "pending",
      });
      const acceptedRequests = await SupervisionRequest.countDocuments({
        status: "accepted",
      });
      const rejectedRequests = await SupervisionRequest.countDocuments({
        status: "rejected",
      });

      // Post Statistics
      const totalPosts = await Post.countDocuments();
      const activePosts = await Post.countDocuments({ isActive: true });
      const totalLikes = await PostLike.countDocuments();
      const totalComments = await PostComment.countDocuments();

      // Notification Statistics
      const totalNotifications = await Notification.countDocuments();
      const unreadNotifications = await Notification.countDocuments({
        read: false,
      });

      // Recent Activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentStudents = await User.countDocuments({
        role: "student",
        createdAt: { $gte: sevenDaysAgo },
      });

      const recentSupervisors = await User.countDocuments({
        role: "supervisor",
        createdAt: { $gte: sevenDaysAgo },
      });

      const recentGroups = await Group.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      });

      const recentPosts = await Post.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      });

      // Recent notifications sent
      const recentNotificationsSent = await Notification.find({
        createdAt: { $gte: sevenDaysAgo },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("recipient", "firstName lastName email role")
        .lean();

      // Recent groups created
      const recentGroupsCreated = await Group.find({
        createdAt: { $gte: sevenDaysAgo },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("createdBy", "firstName lastName email")
        .populate("supervisor", "firstName lastName email")
        .lean();

      // Groups by status
      const groupsByStatus = {
        total: totalGroups,
        formed: formedGroups,
        withSupervisor: groupsWithSupervisor,
        withoutSupervisor: groupsWithoutSupervisor,
      };

      return this.handleResponse(200, true, "Admin dashboard data retrieved", {
        userStats: {
          totalStudents,
          activeStudents,
          inactiveStudents,
          totalSupervisors,
          activeSupervisors,
          inactiveSupervisors,
          totalAdmins,
          totalUsers: totalStudents + totalSupervisors + totalAdmins,
        },
        groupStats: {
          totalGroups,
          formedGroups,
          groupsWithSupervisor,
          groupsWithoutSupervisor,
          groupsByStatus,
        },
        profileStats: {
          studentsWithProfile,
          studentsWithoutProfile: totalStudents - studentsWithProfile,
          supervisorsWithProfile,
          supervisorsWithoutProfile: totalSupervisors - supervisorsWithProfile,
        },
        supervisionStats: {
          pendingRequests,
          acceptedRequests,
          rejectedRequests,
          totalRequests: pendingRequests + acceptedRequests + rejectedRequests,
        },
        postStats: {
          totalPosts,
          activePosts,
          totalLikes,
          totalComments,
          averageLikesPerPost:
            totalPosts > 0 ? (totalLikes / totalPosts).toFixed(1) : 0,
          averageCommentsPerPost:
            totalPosts > 0 ? (totalComments / totalPosts).toFixed(1) : 0,
        },
        notificationStats: {
          totalNotifications,
          unreadNotifications,
          readNotifications: totalNotifications - unreadNotifications,
        },
        recentActivity: {
          recentStudents,
          recentSupervisors,
          recentGroups,
          recentPosts,
        },
        recentNotifications: recentNotificationsSent,
        recentGroups: recentGroupsCreated,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }
}

const adminDashboardService = new AdminDashboardService();

export default adminDashboardService;

