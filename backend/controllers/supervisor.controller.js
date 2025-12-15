import supervisorProfileService from "../services/supervisor/profile.service.js";

const supervisorController = {
  getProfile: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await supervisorProfileService.getSupervisorProfile(userId);
    return res.status(status).json({ success, msg, data });
  },

  updateProfile: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await supervisorProfileService.updateSupervisorProfile(userId, req.body);
    return res.status(status).json({ success, msg, data });
  },

  checkProfileComplete: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await supervisorProfileService.checkProfileComplete(userId);
    return res.status(status).json({ success, msg, data });
  },

  // Placeholder methods for other supervisor features
  createPost: async (req, res) => {
    // TODO: Implement supervisor post creation
    return res.status(501).json({ success: false, msg: "Not implemented yet" });
  },

  listPosts: async (req, res) => {
    // TODO: Implement supervisor posts listing
    return res.status(501).json({ success: false, msg: "Not implemented yet" });
  },

  requestSupervision: async (req, res) => {
    // TODO: Implement supervision request
    return res.status(501).json({ success: false, msg: "Not implemented yet" });
  },

  respondToRequest: async (req, res) => {
    // TODO: Implement respond to supervision request
    return res.status(501).json({ success: false, msg: "Not implemented yet" });
  },
};

export default supervisorController;