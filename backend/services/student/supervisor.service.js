import BaseService from "../base-service.js";
import Supervisor from "../../models/supervisor.js";
import Student from "../../models/student.js";
import Group from "../../models/group.js";
import SupervisionRequest from "../../models/supervision-request.js";
import User from "../../models/user.js";
import Notification from "../../models/notification.js";
import { calculateMatchPercentage } from "../../utils/matching-algo.js";

class StudentSupervisorService extends BaseService {
  // Calculate match percentage between student and supervisor
  // calculateMatchPercentage(student, supervisor) {
  //   let matchScore = 0;
  //   let totalWeight = 0;

  //   // Department match (30% weight)
  //   if (student.department && supervisor.department) {
  //     totalWeight += 30;
  //     if (student.department === supervisor.department) {
  //       matchScore += 30;
  //     }
  //   } else {
  //     totalWeight += 30;
  //   }

  //   // Skills match (35% weight)
  //   if (
  //     student.skills &&
  //     student.skills.length > 0 &&
  //     supervisor.skills &&
  //     supervisor.skills.length > 0
  //   ) {
  //     totalWeight += 35;
  //     const commonSkills = student.skills.filter((skill) =>
  //       supervisor.skills.includes(skill)
  //     );
  //     const skillMatchRatio =
  //       commonSkills.length /
  //       Math.max(student.skills.length, supervisor.skills.length);
  //     matchScore += skillMatchRatio * 35;
  //   } else {
  //     totalWeight += 35;
  //   }

  //   // Interests match (35% weight)
  //   if (
  //     student.interests &&
  //     student.interests.length > 0 &&
  //     supervisor.interests &&
  //     supervisor.interests.length > 0
  //   ) {
  //     totalWeight += 35;
  //     const commonInterests = student.interests.filter((interest) =>
  //       supervisor.interests.includes(interest)
  //     );
  //     const interestMatchRatio =
  //       commonInterests.length /
  //       Math.max(student.interests.length, supervisor.interests.length);
  //     matchScore += interestMatchRatio * 35;
  //   } else {
  //     totalWeight += 35;
  //   }

  //   // Calculate percentage
  //   if (totalWeight === 0) return 0;
  //   return Math.round((matchScore / totalWeight) * 100);
  // }

  // Get all supervisors with match percentage
  // async getAllSupervisors(userId) {
  //   try {
  //     // Get student profile
  //     const student = await Student.findOne({ userId }).lean();
  //     if (!student) {
  //       return this.handleResponse(400, false, "Student profile not found");
  //     }

  //     // Get all supervisors with their profiles
  //     const supervisors = await Supervisor.find({
  //       profileCompleted: true,
  //     }).lean();
  //     const supervisorUserIds = supervisors.map((s) => s.userId);

  //     // Get user details
  //     const users = await User.find({
  //       _id: { $in: supervisorUserIds },
  //       role: "supervisor",
  //     })
  //       .select("firstName lastName email profileImg")
  //       .lean();

  //     // Get all groups to check supervisor assignments
  //     const groups = await Group.find({}).lean();
  //     const assignedSupervisorIds = new Set();
  //     groups.forEach((group) => {
  //       if (group.supervisor) {
  //         assignedSupervisorIds.add(group.supervisor.toString());
  //       }
  //     });

  //     // Get user's group (check both formed and unformed groups)
  //     const userGroup = await Group.findOne({
  //       $or: [{ createdBy: userId }, { members: userId }],
  //     }).lean();

  //     // Get supervision requests for user's group
  //     let groupRequests = [];
  //     if (userGroup) {
  //       groupRequests = await SupervisionRequest.find({
  //         group: userGroup._id,
  //       }).lean();
  //     }

  //     // Combine data and calculate matches
  //     const result = users
  //       .map((user) => {
  //         const supervisor = supervisors.find(
  //           (s) => s.userId.toString() === user._id.toString()
  //         );

  //         if (!supervisor) return null;

  //         const matchPercentage = calculateMatchPercentage(student, supervisor);

  //         // Check if supervisor is already assigned to a group
  //         const isAssigned = assignedSupervisorIds.has(user._id.toString());

  //         // Check request status for this supervisor
  //         let requestStatus = null;
  //         if (userGroup) {
  //           const request = groupRequests.find(
  //             (r) => r.supervisor.toString() === user._id.toString()
  //           );
  //           if (request) {
  //             requestStatus = request.status;
  //           }
  //         }

  //         // Check if supervisor has reached max groups (3)
  //         const supervisorGroups = groups.filter(
  //           (g) =>
  //             g.supervisor && g.supervisor.toString() === user._id.toString()
  //         );
  //         const hasReachedMax = supervisorGroups.length >= 3;

  //         return {
  //           id: user._id.toString(),
  //           name: `${user.firstName} ${user.lastName}`,
  //           email: user.email,
  //           avatar: user.profileImg,
  //           department: supervisor.department,
  //           title: this.getTitleFromLevel(supervisor.level),
  //           description: supervisor.description,
  //           researchInterests: supervisor.interests || [],
  //           tools: supervisor.skills || [],
  //           matchPercentage,
  //           isAssigned,
  //           requestStatus,
  //           hasReachedMax,
  //           currentGroups: supervisorGroups.length,
  //           maxGroups: 3,
  //         };
  //       })
  //       .filter((s) => s !== null);

  //     return this.handleResponse(200, true, "Supervisors retrieved", {
  //       supervisors: result,
  //     });
  //   } catch (err) {
  //     return this.handleError(err);
  //   }
  // }

  async getAllSupervisors(userId) {
    try {
      // 1. Get user's group
      const userGroup = await Group.findOne({
        $or: [{ createdBy: userId }, { members: userId }],
      }).lean();

      let groupStudents = [];

      if (!userGroup) {
        // 1. If no group then get any student
        groupStudents = await Student.find({ userId });
      } else {
        // 2. Get all students in the group
        groupStudents = await Student.find({
          userId: { $in: userGroup.members },
        }).lean();
      }

      if (!groupStudents.length) {
        return this.handleResponse(400, false, "Group students not found");
      }

      const groupText = userGroup?.description || "";

      // 4. Get supervisors
      const supervisors = await Supervisor.find({
        profileCompleted: true,
      }).lean();

      const supervisorUserIds = supervisors.map((s) => s.userId);

      // 5. Get supervisor users
      const users = await User.find({
        _id: { $in: supervisorUserIds },
        role: "supervisor",
      })
        .select("firstName lastName email profileImg")
        .lean();

      // 6. Groups for constraints
      const groups = await Group.find({}).lean();
      const assignedSupervisorIds = new Set(
        groups.filter((g) => g.supervisor).map((g) => g.supervisor.toString())
      );

      let groupRequests = [];
      groupRequests = await SupervisionRequest.find({
        group: userGroup?._id,
      }).lean();

      const result = users
        .map((user) => {
          const supervisor = supervisors.find(
            (s) => s.userId.toString() === user._id.toString()
          );
          if (!supervisor) return null;

          const matchPercentage = calculateMatchPercentage(
            supervisor,
            groupStudents,
            groupText
          );

          const isAssigned = assignedSupervisorIds.has(user._id.toString());

          let requestStatus = null;
          const request = groupRequests.find(
            (r) => r.supervisor.toString() === user._id.toString()
          );
          if (request) requestStatus = request.status;

          const supervisorGroups = groups.filter(
            (g) =>
              g.supervisor && g.supervisor.toString() === user._id.toString()
          );

          return {
            id: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatar: user.profileImg,
            department: supervisor.department,
            title: this.getTitleFromLevel(supervisor.level),
            description: supervisor.description,
            researchInterests: supervisor.interests || [],
            tools: supervisor.skills || [],
            matchPercentage,
            isAssigned,
            requestStatus,
            hasReachedMax: supervisorGroups.length >= 3,
            currentGroups: supervisorGroups.length,
            maxGroups: 3,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

      return this.handleResponse(200, true, "Supervisors retrieved", {
        supervisors: result,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  getTitleFromLevel(level) {
    const titles = {
      professor: "Professor",
      associate_professor: "Associate Professor",
      assistant_professor: "Assistant Professor",
      dean: "Dean",
      head_of_department: "Head of Department",
      lecturer: "Lecturer",
      other: "Supervisor",
    };
    return titles[level] || "Supervisor";
  }

  // Request supervision (group-based)
  async requestSupervision(userId, supervisorId) {
    try {
      console.log("userId", userId);

      // Check if user is in a group
      const group = await Group.findOne({
        $or: [{ createdBy: userId }, { members: userId }],
        // isFormed: true,
      }).lean();

      if (!group) {
        return this.handleResponse(
          400,
          false,
          "Please join or create a group before requesting supervision"
        );
      }

      // Check if group already has a supervisor
      if (group.supervisor) {
        return this.handleResponse(
          400,
          false,
          "Your group already has a supervisor assigned"
        );
      }

      // Check if supervisor exists and profile is complete
      const supervisor = await Supervisor.findOne({
        userId: supervisorId,
      }).lean();
      if (!supervisor || !supervisor.profileCompleted) {
        return this.handleResponse(
          400,
          false,
          "Supervisor not found or profile incomplete"
        );
      }

      // Check if supervisor has reached max groups (3)
      const supervisorGroups = await Group.find({
        supervisor: supervisorId,
      }).lean();
      if (supervisorGroups.length >= 3) {
        return this.handleResponse(
          400,
          false,
          "This supervisor has reached the maximum number of groups (3)"
        );
      }

      // Check if there's already a pending request
      const existingRequest = await SupervisionRequest.findOne({
        group: group._id,
        supervisor: supervisorId,
        status: "pending",
      }).lean();

      if (existingRequest) {
        return this.handleResponse(
          400,
          false,
          "A supervision request has already been sent to this supervisor"
        );
      }

      // Create supervision request
      const request = new SupervisionRequest({
        group: group._id,
        supervisor: supervisorId,
        requestedBy: userId,
        status: "pending",
      });

      await request.save();

      // Create notification for supervisor
      const supervisorUser = await User.findById(supervisorId).lean();
      const groupCreator = await User.findById(group.createdBy).lean();

      await Notification.create({
        recipient: supervisorId,
        audience: "specific",
        title: "Supervision Request",
        message: `${groupCreator.firstName} ${groupCreator.lastName} from group "${group.name}" has requested your supervision`,
        meta: {
          type: "supervision_request",
          groupId: group._id.toString(),
          requestId: request._id.toString(),
          requestedBy: userId.toString(),
        },
        read: false,
      });

      return this.handleResponse(200, true, "Supervision request sent", {
        request: request.toObject(),
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Cancel supervision request
  async cancelRequest(userId, supervisorId) {
    try {
      // Check if user is in a group
      const group = await Group.findOne({
        $or: [{ createdBy: userId }, { members: userId }],
        isFormed: true,
      }).lean();

      if (!group) {
        return this.handleResponse(400, false, "Group not found");
      }

      // Find and delete pending request
      const request = await SupervisionRequest.findOneAndDelete({
        group: group._id,
        supervisor: supervisorId,
        status: "pending",
      });

      if (!request) {
        return this.handleResponse(400, false, "Request not found");
      }

      return this.handleResponse(200, true, "Request cancelled");
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Get supervisor profile details
  async getSupervisorProfile(supervisorId) {
    try {
      const supervisor = await Supervisor.findOne({
        userId: supervisorId,
      }).lean();
      if (!supervisor) {
        return this.handleResponse(400, false, "Supervisor not found");
      }

      const user = await User.findById(supervisorId).lean();
      if (!user) {
        return this.handleResponse(400, false, "User not found");
      }

      // Get groups supervised by this supervisor
      const groups = await Group.find({ supervisor: supervisorId })
        .populate("createdBy", "firstName lastName email")
        .populate("members", "firstName lastName email")
        .lean();

      return this.handleResponse(200, true, "Supervisor profile retrieved", {
        supervisor: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImg: user.profileImg,
          department: supervisor.department,
          level: supervisor.level,
          title: this.getTitleFromLevel(supervisor.level),
          description: supervisor.description,
          skills: supervisor.skills || [],
          interests: supervisor.interests || [],
          currentGroups: groups.length,
          maxGroups: 3,
        },
      });
    } catch (err) {
      return this.handleError(err);
    }
  }
}

const studentSupervisorService = new StudentSupervisorService();

export default studentSupervisorService;
