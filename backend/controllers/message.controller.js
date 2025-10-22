import Message from "../models/message.js";
import Group from "../models/group.js";

const messageController = {
  listGroupMessages: async (req, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ success: false, msg: "Group not found" });
      if (!group.members.map((m) => m.toString()).includes(userId)) {
        return res.status(403).json({ success: false, msg: "Not a member of this group" });
      }

      const messages = await Message.find({ group: groupId })
        .sort({ createdAt: 1 })
        .lean();

      return res.status(200).json({ success: true, msg: "Messages", data: { messages } });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to load messages" });
    }
  },
};

export default messageController;



