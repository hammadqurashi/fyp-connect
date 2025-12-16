import supervisorProfileService from "../services/supervisor/profile.service.js";
import supervisorRequestService from "../services/supervisor/request.service.js";

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

  getSupervisionRequests: async (req, res) => {
    const { id: supervisorId } = req.user;
    const { data, msg, status, success } =
      await supervisorRequestService.getSupervisionRequests(supervisorId);
    return res.status(status).json({ success, msg, data });
  },

  respondToRequest: async (req, res) => {
    const { id: supervisorId } = req.user;
    const { requestId } = req.params;
    const { response } = req.body; // "accepted" or "rejected"
    const { data, msg, status, success } =
      await supervisorRequestService.respondToRequest(
        supervisorId,
        requestId,
        response
      );
    return res.status(status).json({ success, msg, data });
  },
};

export default supervisorController;