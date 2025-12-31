import Message from "../models/message.js";
import Group from "../models/group.js";
import GroupFile from "../models/group-file.js";
import UserModel from "../models/user.js";

const messageController = {
  listGroupMessages: async (req, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const group = await Group.findById(groupId)
        .populate("supervisor", "firstName lastName email")
        .lean();

      if (!group) {
        return res.status(404).json({ success: false, msg: "Group not found" });
      }

      // Check if user is a member or supervisor
      const isMember = group.members.map((m) => m.toString()).includes(userId);
      const isSupervisor =
        group.supervisor && group.supervisor._id.toString() === userId;

      if (!isMember && !isSupervisor) {
        return res
          .status(403)
          .json({ success: false, msg: "Not a member of this group" });
      }

      const messages = await Message.find({ group: groupId })
        .populate("sender", "firstName lastName email profileImg")
        .sort({ createdAt: 1 })
        .lean();

      return res
        .status(200)
        .json({ success: true, msg: "Messages", data: { messages } });
    } catch (err) {
      return res.status(500).json({
        success: false,
        msg: err.message || "Failed to load messages",
      });
    }
  },

  createMessage: async (req, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;
      const { content, type, fileUrl, fileName, fileSize } = req.body;

      const group = await Group.findById(groupId).lean();
      if (!group) {
        return res.status(404).json({ success: false, msg: "Group not found" });
      }

      const isMember = group.members.map((m) => m.toString()).includes(userId);
      const isSupervisor =
        group.supervisor && group.supervisor.toString() === userId;

      if (!isMember && !isSupervisor) {
        return res
          .status(403)
          .json({ success: false, msg: "Not a member of this group" });
      }

      const newMsgData = {
        group: groupId,
        sender: userId,
        content: content || fileName || "",
        type: type || "text",
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
      };

      const message = new Message(newMsgData);
      await message.save();

      // message.sender
      if (userId) {
        const senderDetails = await UserModel.findById(userId);
        if (senderDetails) {
          newMsgData["sender"] = {
            firstName: senderDetails.firstName,
            lastName: senderDetails.lastName,
            email: senderDetails.email,
            profileImg: senderDetails.profileImg,
          };
        }
      }

      return res.status(201).json({
        success: true,
        msg: "Message sent",
        data: { message: newMsgData },
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        msg: err.message || "Failed to send message",
      });
    }
  },

  listGroupFiles: async (req, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const group = await Group.findById(groupId).lean();
      if (!group) {
        return res.status(404).json({ success: false, msg: "Group not found" });
      }

      const isMember = group.members.map((m) => m.toString()).includes(userId);
      const isSupervisor =
        group.supervisor && group.supervisor.toString() === userId;

      if (!isMember && !isSupervisor) {
        return res
          .status(403)
          .json({ success: false, msg: "Not a member of this group" });
      }

      const files = await GroupFile.find({ group: groupId })
        .populate("uploadedBy", "firstName lastName")
        .sort({ createdAt: -1 })
        .lean();

      return res
        .status(200)
        .json({ success: true, msg: "Files", data: { files } });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, msg: err.message || "Failed to load files" });
    }
  },
};

export default messageController;
