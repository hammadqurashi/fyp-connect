import Notification from "../models/notification.js";

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
        // For student/supervisor/both audience, we store without specific recipient
        // and frontends could fetch by audience; here simplify to broadcast-like entries per audience
        created = [await Notification.create({ recipient: req.user.id, audience, title, message, meta })];
      }

      return res.status(201).json({ success: true, msg: "Notification(s) sent", data: { count: created.length } });
    } catch (err) {
      return res.status(500).json({ success: false, msg: err.message || "Failed to send notification" });
    }
  },

  listMine: async (req, res) => {
    try {
      const userId = req.user.id;
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


