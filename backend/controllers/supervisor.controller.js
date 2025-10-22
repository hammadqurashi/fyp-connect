import Post from "../models/post.js";
import Group from "../models/group.js";
import User from "../models/user.js";

const supervisorController = {
  createPost: async (req, res) => {
    try {
      const supervisorId = req.user.id;
      const { title, content, tags = [], projectType = "research" } = req.body;
      const post = await Post.create({ supervisor: supervisorId, title, content, tags, projectType });
      return res.status(201).json({ success: true, msg: "Post created", data: { post } });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to create post" });
    }
  },

  listPosts: async (_req, res) => {
    try {
      const posts = await Post.find({ isActive: true }).populate("supervisor", "firstName lastName email");
      return res.status(200).json({ success: true, msg: "Posts", data: { posts } });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to list posts" });
    }
  },

  requestSupervision: async (req, res) => {
    try {
      const { supervisorId } = req.body;
      const studentId = req.user.id;

      // Find the student's group
      const group = await Group.findOne({ members: studentId });
      if (!group) {
        return res
          .status(400)
          .json({ success: false, msg: "Please join or create a group first" });
      }

      const supervisor = await User.findById(supervisorId);
      if (!supervisor || supervisor.role !== "supervisor") {
        return res.status(404).json({ success: false, msg: "Supervisor not found" });
      }

      // Minimal placeholder: mark requested supervisor on group (pending approval)
      group.supervisor = supervisorId;
      await group.save();

      return res.status(200).json({ success: true, msg: "Request sent", data: { groupId: group.id } });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to request supervision" });
    }
  },

  respondToRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { response } = req.body; // accepted | rejected

      // For MVP, requestId is groupId
      const group = await Group.findById(requestId);
      if (!group) return res.status(404).json({ success: false, msg: "Group not found" });

      if (response === "accepted") {
        // Limit: supervisor can manage up to 3 groups
        const supervisorId = req.user.id;
        const activeCount = await Group.countDocuments({ supervisor: supervisorId });
        if (activeCount >= 3) {
          return res.status(400).json({ success: false, msg: "Supervisor capacity reached" });
        }
        group.supervisor = supervisorId;
        await group.save();
        return res.status(200).json({ success: true, msg: "Request accepted", data: { groupId: group.id } });
      } else if (response === "rejected") {
        group.supervisor = null;
        await group.save();
        return res.status(200).json({ success: true, msg: "Request rejected" });
      } else {
        return res.status(400).json({ success: false, msg: "Invalid response" });
      }
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to respond" });
    }
  },
};

export default supervisorController;


