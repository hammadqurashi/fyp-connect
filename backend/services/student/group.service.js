import BaseService from "../base-service.js";
import Group from "../../models/group.js";
import Invitation from "../../models/invitation.js";
import Notification from "../../models/notification.js";
import User from "../../models/user.js";
import Student from "../../models/student.js";

class StudentGroupService extends BaseService {
  // Create a new group
  async createGroup(userId, data) {
    try {
      const { name, description, invitedStudentIds } = data;

      // Check if user is already in a group
      const existingGroup = await Group.findOne({
        $or: [{ createdBy: userId }, { members: userId }],
        isFormed: true,
      });

      if (existingGroup) {
        return this.handleResponse(
          400,
          false,
          "You are already enrolled in a group"
        );
      }

      // Validate invited students count (max 3 others + creator = 4 total)
      if (!invitedStudentIds || invitedStudentIds.length === 0) {
        return this.handleResponse(
          400,
          false,
          "Please invite at least one student"
        );
      }

      if (invitedStudentIds.length > 3) {
        return this.handleResponse(
          400,
          false,
          "Maximum 3 students can be invited (4 total including you)"
        );
      }

      // Check if any invited student is already in a group
      const groupsWithInvited = await Group.find({
        $or: [
          { createdBy: { $in: invitedStudentIds } },
          { members: { $in: invitedStudentIds } },
        ],
        isFormed: true,
      }).lean();

      const enrolledIds = new Set();
      groupsWithInvited.forEach((group) => {
        if (group.createdBy) {
          enrolledIds.add(group.createdBy.toString());
        }
        if (group.members) {
          group.members.forEach((member) => {
            enrolledIds.add(member.toString());
          });
        }
      });

      const alreadyEnrolled = invitedStudentIds.filter((id) =>
        enrolledIds.has(id.toString())
      );

      if (alreadyEnrolled.length > 0) {
        const enrolledUsers = await User.find({
          _id: { $in: alreadyEnrolled },
        }).select("firstName lastName");
        const names = enrolledUsers
          .map((u) => `${u.firstName} ${u.lastName}`)
          .join(", ");
        return this.handleResponse(
          400,
          false,
          `${names} ${
            alreadyEnrolled.length > 1 ? "are" : "is"
          } already enrolled in a group`
        );
      }

      // Create the group
      const group = new Group({
        name,
        description,
        createdBy: userId,
        members: [userId], // Creator is automatically a member
        isFormed: false,
      });

      await group.save();

      // Create invitations for invited students
      const invitations = [];
      const notifications = [];

      for (const invitedId of invitedStudentIds) {
        // Create invitation
        const invitation = new Invitation({
          group: group._id,
          sender: userId,
          receiver: invitedId,
          status: "pending",
        });
        await invitation.save();
        invitations.push(invitation);

        // Create notification
        const sender = await User.findById(userId).lean();
        const notification = new Notification({
          recipient: invitedId,
          audience: "specific",
          title: "Group Invitation",
          message: `${sender.firstName} ${sender.lastName} invited you to join "${name}"`,
          meta: {
            type: "group_invitation",
            groupId: group._id.toString(),
            invitationId: invitation._id.toString(),
            senderId: userId.toString(),
          },
          read: false,
        });
        await notification.save();
        notifications.push(notification);
      }

      return this.handleResponse(
        200,
        true,
        "Group created and invitations sent",
        {
          group: group.toObject(),
          invitations: invitations.map((inv) => inv.toObject()),
        }
      );
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Get user's group
  async getMyGroup(userId) {
    try {
      const group = await Group.findOne({
        $or: [{ createdBy: userId }, { members: userId }],
      })
        .populate("createdBy", "firstName lastName email")
        .populate("members", "firstName lastName email")
        .populate("supervisor", "firstName lastName email")
        .lean();

      if (!group) {
        return this.handleResponse(200, true, "No group found", {
          group: null,
        });
      }

      // Get invitation statuses for this group
      const invitations = await Invitation.find({
        group: group._id,
      })
        .populate("receiver", "firstName lastName email")
        .lean();

      return this.handleResponse(200, true, "Group retrieved", {
        group,
        invitations,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Search students with filters
  async searchStudents(userId, filters) {
    try {
      const {
        department,
        minCreditHours,
        maxCreditHours,
        skills,
        interests,
        search,
      } = filters;

      // Get current user's student profile
      const currentStudent = await Student.findOne({ userId }).lean();
      if (!currentStudent) {
        return this.handleResponse(400, false, "Student profile not found");
      }

      // Build query
      const query = {};

      // Exclude current user
      const currentUser = await User.findById(userId).lean();
      const allStudents = await Student.find({}).lean();
      const allStudentUserIds = allStudents.map((s) => s.userId.toString());
      const excludeIds = [userId.toString()];

      // Exclude students already in groups
      const groups = await Group.find({
        isFormed: true,
      }).lean();
      const enrolledUserIds = new Set();
      groups.forEach((group) => {
        if (group.createdBy) {
          enrolledUserIds.add(group.createdBy.toString());
        }
        if (group.members) {
          group.members.forEach((member) => {
            enrolledUserIds.add(member.toString());
          });
        }
      });
      enrolledUserIds.forEach((id) => excludeIds.push(id));

      // Filter by department
      if (department) {
        query.department = department;
      }

      // Filter by credit hours
      if (minCreditHours !== undefined || maxCreditHours !== undefined) {
        query.completedCreditHours = {};
        if (minCreditHours !== undefined) {
          query.completedCreditHours.$gte = minCreditHours;
        }
        if (maxCreditHours !== undefined) {
          query.completedCreditHours.$lte = maxCreditHours;
        }
      }

      // Filter by skills (at least one match)
      if (skills && skills.length > 0) {
        const skillArr = skills.split(",").map((s) => s);

        if (skillArr.length > 0) {
          query.skills = { $in: skillArr };
        }
      }

      // Filter by interests (at least one match)
      if (interests && interests.length > 0) {
        const interestsArr = interests.split(",").map((i) => i);
        query.interests = { $in: interestsArr };
      }

      console.log("query", query);

      // Find matching students
      let students = await Student.find(query).lean();

      // Filter out enrolled students
      students = students.filter(
        (student) => !excludeIds.includes(student.userId.toString())
      );

      // Get user details for matching students
      const studentUserIds = students.map((s) => s.userId);
      let users = await User.find({
        _id: { $in: studentUserIds },
        role: "student",
      })
        .select("firstName lastName email profileImg")
        .lean();

      // Apply search filter on names/email
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(
          (user) =>
            user.firstName?.toLowerCase().includes(searchLower) ||
            user.lastName?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
        );
      }

      // Combine student and user data
      const result = users.map((user) => {
        const student = students.find(
          (s) => s.userId.toString() === user._id.toString()
        );
        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImg: user.profileImg,
          department: student?.department,
          completedCreditHours: student?.completedCreditHours,
          skills: student?.skills || [],
          interests: student?.interests || [],
        };
      });

      return this.handleResponse(200, true, "Students retrieved", {
        students: result,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Respond to group invitation
  async respondToInvitation(userId, invitationId, response) {
    try {
      const invitation = await Invitation.findById(invitationId)
        .populate("group")
        .lean();

      if (!invitation) {
        return this.handleResponse(400, false, "Invitation not found");
      }

      if (invitation.receiver.toString() !== userId.toString()) {
        return this.handleResponse(403, false, "Unauthorized");
      }

      if (invitation.status !== "pending") {
        return this.handleResponse(400, false, "Invitation already responded");
      }

      const group = await Group.findById(invitation.group._id);

      if (response === "accepted") {
        // Check if group is still open and has space
        const currentMembers = group.members.length;
        if (currentMembers >= 4) {
          return this.handleResponse(400, false, "Group is already full");
        }

        // Add user to group
        if (!group.members.includes(userId)) {
          group.members.push(userId);
        }

        // Check if group is now complete (4 members)
        if (group.members.length === 4) {
          group.isFormed = true;
        }

        await group.save();

        // Update invitation
        await Invitation.findByIdAndUpdate(invitationId, {
          status: "accepted",
        });

        // Create notification for group creator
        const acceptedUser = await User.findById(userId).lean();
        await Notification.create({
          recipient: group.createdBy,
          audience: "specific",
          title: "Invitation Accepted",
          message: `${acceptedUser.firstName} ${acceptedUser.lastName} accepted your group invitation`,
          meta: {
            type: "group_invitation_accepted",
            groupId: group._id.toString(),
            userId: userId.toString(),
          },
          read: false,
        });
      } else if (response === "rejected") {
        // Update invitation
        await Invitation.findByIdAndUpdate(invitationId, {
          status: "rejected",
        });

        // Create notification for group creator
        const rejectedUser = await User.findById(userId).lean();
        await Notification.create({
          recipient: group.createdBy,
          audience: "specific",
          title: "Invitation Rejected",
          message: `${rejectedUser.firstName} ${rejectedUser.lastName} rejected your group invitation`,
          meta: {
            type: "group_invitation_rejected",
            groupId: group._id.toString(),
            userId: userId.toString(),
          },
          read: false,
        });
      }

      // Check if all invitations are rejected, allow group recreation
      const allInvitations = await Invitation.find({
        group: group._id,
        receiver: { $ne: group.createdBy },
      }).lean();

      const allRejected =
        allInvitations.length > 0 &&
        allInvitations.every((inv) => inv.status === "rejected");

      return this.handleResponse(200, true, "Response recorded", {
        invitation: {
          ...invitation,
          status: response === "accepted" ? "accepted" : "rejected",
        },
        canRecreateGroup: allRejected && group.members.length === 1,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Get invitations received by user
  async getReceivedInvitations(userId) {
    try {
      const invitations = await Invitation.find({
        receiver: userId,
        status: "pending",
      })
        .populate({
          path: "group",
          select: "name description createdBy members isFormed",
          populate: [
            {
              path: "createdBy",
              select: "firstName lastName email",
            },
            {
              path: "members",
              select: "firstName lastName email",
            },
          ],
        })
        .populate("sender", "firstName lastName email")
        .lean();

      return this.handleResponse(200, true, "Received invitations retrieved", {
        invitations,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Delete group (if all rejected or not formed)
  async deleteGroup(userId, groupId) {
    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return this.handleResponse(400, false, "Group not found");
      }

      if (group.createdBy.toString() !== userId.toString()) {
        return this.handleResponse(403, false, "Only group creator can delete");
      }

      if (group.isFormed) {
        return this.handleResponse(400, false, "Cannot delete a formed group");
      }

      // Delete all invitations
      await Invitation.deleteMany({ group: groupId });

      // Delete group
      await Group.findByIdAndDelete(groupId);

      return this.handleResponse(200, true, "Group deleted successfully");
    } catch (err) {
      return this.handleError(err);
    }
  }
}

const studentGroupService = new StudentGroupService();

export default studentGroupService;
