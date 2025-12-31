import Group from "../models/group.js";
import Invitation from "../models/invitation.js";
import User from "../models/user.js";

const groupController = {
  createGroup: async (req, res) => {
    try {
      const { name, description } = req.body;
      const creatorId = req.user.id;

      const creator = await User.findById(creatorId);
      if (!creator || creator.role !== "student") {
        return res.status(400).json({ success: false, msg: "Only students can create groups" });
      }

      const group = await Group.create({
        name,
        description,
        createdBy: creatorId,
        members: [creatorId],
        isFormed: false,
      });

      return res.status(201).json({ success: true, msg: "Group created", data: { group } });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to create group" });
    }
  },

  getMyGroup: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // For students, check if they're a member
      // For supervisors, check if they're assigned as supervisor
      const query = userRole === "supervisor"
        ? { supervisor: userId }
        : { $or: [{ createdBy: userId }, { members: userId }] };
      
      const group = await Group.findOne(query)
        .populate("createdBy", "firstName lastName email profileImg")
        .populate("members", "firstName lastName email profileImg")
        .populate("supervisor", "firstName lastName email profileImg")
        .lean();

      if (!group) {
        return res.status(200).json({ success: true, msg: "No group found", data: { group: null } });
      }

      return res.status(200).json({ success: true, msg: "My group", data: { group } });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to fetch group" });
    }
  },

  sendInvitations: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { receivers } = req.body; // array of userIds
      const senderId = req.user.id;

      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ success: false, msg: "Group not found" });
      if (group.createdBy.toString() !== senderId) {
        return res.status(403).json({ success: false, msg: "Only group creator can invite" });
      }

      const pendingInvites = await Invitation.insertMany(
        receivers.map((r) => ({ group: groupId, sender: senderId, receiver: r }))
      );

      return res.status(201).json({ success: true, msg: "Invitations sent", data: { invitations: pendingInvites } });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to send invitations" });
    }
  },

  respondToInvitation: async (req, res) => {
    try {
      const { invitationId } = req.params;
      const { response } = req.body; // "accepted" | "rejected"
      const userId = req.user.id;

      const invitation = await Invitation.findById(invitationId);
      if (!invitation) return res.status(404).json({ success: false, msg: "Invitation not found" });
      if (invitation.receiver.toString() !== userId) {
        return res.status(403).json({ success: false, msg: "Not your invitation" });
      }

      if (invitation.status !== "pending") {
        return res.status(400).json({ success: false, msg: "Invitation already responded" });
      }

      if (response === "accepted") {
        // Ensure max 4 members in group
        const group = await Group.findById(invitation.group);
        if (!group) return res.status(404).json({ success: false, msg: "Group not found" });

        const currentMembers = group.members?.length || 0;
        if (currentMembers >= 4) {
          invitation.status = "expired";
          await invitation.save();
          return res.status(400).json({ success: false, msg: "Group already full" });
        }

        // Add member
        if (!group.members.map((m) => m.toString()).includes(userId)) {
          group.members.push(userId);
          await group.save();
        }
        invitation.status = "accepted";
        await invitation.save();

        // If formed (>= 2? or up to 4). Mark formed when >=2 for now
        if (group.members.length >= 2) {
          group.isFormed = group.members.length >= 2; // can adjust later
          await group.save();
        }

        return res.status(200).json({ success: true, msg: "Invitation accepted", data: { groupId: group.id } });
      } else if (response === "rejected") {
        invitation.status = "rejected";
        await invitation.save();
        return res.status(200).json({ success: true, msg: "Invitation rejected" });
      } else {
        return res.status(400).json({ success: false, msg: "Invalid response" });
      }
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to respond" });
    }
  },
};

export default groupController;


