import studentProfileService from "../services/student/profile.service.js";
import studentGroupService from "../services/student/group.service.js";

const studentController = {
  // Profile methods
  getProfile: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } = await studentProfileService.getStudentProfile(
      userId
    );
    return res.status(status).json({ success, msg, data });
  },

  updateProfile: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await studentProfileService.updateStudentProfile(userId, req.body);
    return res.status(status).json({ success, msg, data });
  },

  checkProfileComplete: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await studentProfileService.checkProfileComplete(userId);
    return res.status(status).json({ success, msg, data });
  },

  // Group methods
  createGroup: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await studentGroupService.createGroup(userId, req.body);
    return res.status(status).json({ success, msg, data });
  },

  getMyGroup: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await studentGroupService.getMyGroup(userId);
    return res.status(status).json({ success, msg, data });
  },

  searchStudents: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await studentGroupService.searchStudents(userId, req.query);
    return res.status(status).json({ success, msg, data });
  },

  respondToInvitation: async (req, res) => {
    const { id: userId } = req.user;
    const { invitationId } = req.params;
    const { response } = req.body; // "accepted" or "rejected"
    const { data, msg, status, success } =
      await studentGroupService.respondToInvitation(userId, invitationId, response);
    return res.status(status).json({ success, msg, data });
  },

  deleteGroup: async (req, res) => {
    const { id: userId } = req.user;
    const { groupId } = req.params;
    const { data, msg, status, success } =
      await studentGroupService.deleteGroup(userId, groupId);
    return res.status(status).json({ success, msg, data });
  },

  getReceivedInvitations: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await studentGroupService.getReceivedInvitations(userId);
    return res.status(status).json({ success, msg, data });
  },
};

export default studentController;


