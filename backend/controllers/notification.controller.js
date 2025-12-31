import Notification from "../models/notification.js";
import User from "../models/user.js";

const notificationController = {
  send: async (req, res) => {
    try {
      const { audience = "specific", recipientIds = [], title, message, meta = {} } = req.body;

      if (!title || !message) {
        return res.status(400).json({ success: false, msg: "Title and message are required" });
      }

      let created = [];
      if (audience === "specific") {
        if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
          return res.status(400).json({ success: false, msg: "recipientIds required for specific audience" });
        }
        created = await Notification.insertMany(
          recipientIds.map((rid) => ({ recipient: rid, audience, title, message, meta }))
        );
      } else {
        // For student/supervisor/both audience, create notifications for all matching users
        let userQuery = {};
        if (audience === "student") {
          userQuery = { role: "student", isActive: { $ne: false } };
        } else if (audience === "supervisor") {
          userQuery = { role: "supervisor", isActive: { $ne: false } };
        } else if (audience === "both") {
          userQuery = { role: { $in: ["student", "supervisor"] }, isActive: { $ne: false } };
        }

        const users = await User.find(userQuery).select("_id").lean();
        const userIds = users.map((u) => u._id);

        if (userIds.length === 0) {
          return res.status(400).json({ 
            success: false, 
            msg: `No ${audience === "both" ? "users" : audience + "s"} found to send notification to` 
          });
        }

        created = await Notification.insertMany(
          userIds.map((userId) => ({ recipient: userId, audience, title, message, meta }))
        );
      }

      return res.status(201).json({ success: true, msg: "Notification(s) sent", data: { count: created.length } });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to send notification" });
    }
  },

  listMine: async (req, res) => {
    try {
      const userId = req.user.id;
      // Since send() now creates individual notifications for each user,
      // we just need to fetch notifications where this user is the recipient
      const items = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, msg: "Notifications", data: { notifications: items } });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to load notifications" });
    }
  },

  markRead: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const notif = await Notification.findOne({ _id: id, recipient: userId });
      if (!notif) return res.status(404).json({ success: false, msg: "Notification not found" });
      notif.read = true;
      await notif.save();
      return res.status(200).json({ success: true, msg: "Marked as read" });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to mark read" });
    }
  },

  markAllRead: async (req, res) => {
    try {
      const userId = req.user.id;
      await Notification.updateMany({ recipient: userId, read: false }, { $set: { read: true } });
      return res.status(200).json({ success: true, msg: "All marked as read" });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to mark all read" });
    }
  },
};

export default notificationController;


