import BaseService from "../base-service.js";
import SupervisionRequest from "../../models/supervision-request.js";
import Group from "../../models/group.js";
import User from "../../models/user.js";
import Student from "../../models/student.js";
import Notification from "../../models/notification.js";

class SupervisorRequestService extends BaseService {
  // Get all supervision requests for a supervisor
  async getSupervisionRequests(supervisorId) {
    try {
      const requests = await SupervisionRequest.find({
        supervisor: supervisorId,
        status: "pending",
      })
        .populate({
          path: "group",
          select: "name description createdBy members supervisor isFormed createdAt updatedAt",
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
        .populate("requestedBy", "firstName lastName email")
        .sort({ createdAt: -1 })
        .lean();

      // Get student profiles for group members
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          if (!request.group) return null;

          const memberIds = [
            request.group.createdBy._id,
            ...(request.group.members || []).map((m) => m._id),
          ];

          const students = await Student.find({
            userId: { $in: memberIds },
          }).lean();

          // Get creator's student profile
          const creatorStudent = students.find(
            (s) => s.userId.toString() === request.group.createdBy._id.toString()
          );

          // Enrich creator with student details
          const enrichedCreator = {
            ...request.group.createdBy,
            department: creatorStudent?.department,
            completedCreditHours: creatorStudent?.completedCreditHours,
            skills: creatorStudent?.skills || [],
            interests: creatorStudent?.interests || [],
          };

          // Enrich members with student details
          const memberDetails = request.group.members.map((member) => {
            const student = students.find(
              (s) => s.userId.toString() === member._id.toString()
            );
            return {
              ...member,
              department: student?.department,
              completedCreditHours: student?.completedCreditHours,
              skills: student?.skills || [],
              interests: student?.interests || [],
            };
          });

          return {
            ...request,
            group: {
              ...request.group,
              createdBy: enrichedCreator,
              members: memberDetails,
            },
          };
        })
      );

      return this.handleResponse(200, true, "Supervision requests retrieved", {
        requests: enrichedRequests.filter((r) => r !== null),
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Respond to supervision request
  async respondToRequest(supervisorId, requestId, response) {
    try {
      const request = await SupervisionRequest.findById(requestId).lean();

      if (!request) {
        return this.handleResponse(400, false, "Request not found");
      }

      if (request.supervisor.toString() !== supervisorId.toString()) {
        return this.handleResponse(403, false, "Unauthorized");
      }

      if (request.status !== "pending") {
        return this.handleResponse(400, false, "Request already responded");
      }

      const group = await Group.findById(request.group);

      if (response === "accepted") {
        // Check if supervisor has reached max groups
        const supervisorGroups = await Group.find({
          supervisor: supervisorId,
        }).lean();
        if (supervisorGroups.length >= 3) {
          return this.handleResponse(
            400,
            false,
            "You have reached the maximum number of groups (3)"
          );
        }

        // Check if group already has a supervisor
        if (group.supervisor) {
          return this.handleResponse(
            400,
            false,
            "This group already has a supervisor assigned"
          );
        }

        // Assign supervisor to group
        group.supervisor = supervisorId;
        await group.save();

        // Update request status
        await SupervisionRequest.findByIdAndUpdate(requestId, {
          status: "accepted",
        });

        // Reject all other pending requests for this group
        await SupervisionRequest.updateMany(
          {
            group: group._id,
            _id: { $ne: requestId },
            status: "pending",
          },
          {
            status: "rejected",
          }
        );

        // Create notifications for all group members
        const memberIds = [
          group.createdBy,
          ...(group.members || []),
        ];

        const supervisorUser = await User.findById(supervisorId).lean();
        const notifications = memberIds.map((memberId) => ({
          recipient: memberId,
          audience: "specific",
          title: "Supervision Request Accepted",
          message: `${supervisorUser.firstName} ${supervisorUser.lastName} has accepted your group's supervision request`,
          meta: {
            type: "supervision_request_accepted",
            groupId: group._id.toString(),
            supervisorId: supervisorId.toString(),
          },
          read: false,
        }));

        await Notification.insertMany(notifications);
      } else if (response === "rejected") {
        // Update request status
        await SupervisionRequest.findByIdAndUpdate(requestId, {
          status: "rejected",
        });

        // Create notifications for all group members
        const memberIds = [
          group.createdBy,
          ...(group.members || []),
        ];

        const supervisorUser = await User.findById(supervisorId).lean();
        const notifications = memberIds.map((memberId) => ({
          recipient: memberId,
          audience: "specific",
          title: "Supervision Request Rejected",
          message: `${supervisorUser.firstName} ${supervisorUser.lastName} has rejected your group's supervision request`,
          meta: {
            type: "supervision_request_rejected",
            groupId: group._id.toString(),
            supervisorId: supervisorId.toString(),
          },
          read: false,
        }));

        await Notification.insertMany(notifications);
      }

      return this.handleResponse(200, true, "Response recorded", {
        request: {
          ...request,
          status: response === "accepted" ? "accepted" : "rejected",
        },
      });
    } catch (err) {
      return this.handleError(err);
    }
  }
}

const supervisorRequestService = new SupervisorRequestService();

export default supervisorRequestService;
