import supervisorProfileService from "../services/supervisor/profile.service.js";
import supervisorRequestService from "../services/supervisor/request.service.js";
import supervisorPostService from "../services/supervisor/post.service.js";

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

  // Post methods
  createPost: async (req, res) => {
    const { id: supervisorId } = req.user;
    const { data, msg, status, success } =
      await supervisorPostService.createPost(supervisorId, req.body);
    return res.status(status).json({ success, msg, data });
  },

  getMyPosts: async (req, res) => {
    const { id: supervisorId } = req.user;
    const { data, msg, status, success } =
      await supervisorPostService.getMyPosts(supervisorId);
    return res.status(status).json({ success, msg, data });
  },

  updatePost: async (req, res) => {
    const { id: supervisorId } = req.user;
    const { postId } = req.params;
    const { data, msg, status, success } =
      await supervisorPostService.updatePost(supervisorId, postId, req.body);
    return res.status(status).json({ success, msg, data });
  },

  deletePost: async (req, res) => {
    const { id: supervisorId } = req.user;
    const { postId } = req.params;
    const { data, msg, status, success } =
      await supervisorPostService.deletePost(supervisorId, postId);
    return res.status(status).json({ success, msg, data });
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