import studentProfileService from "../services/student/profile.service.js";
import studentGroupService from "../services/student/group.service.js";
import studentSupervisorService from "../services/student/supervisor.service.js";

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

  // Supervisor-related methods
  getAllSupervisors: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await studentSupervisorService.getAllSupervisors(userId);
    return res.status(status).json({ success, msg, data });
  },

  getSupervisorProfile: async (req, res) => {
    const { supervisorId } = req.params;
    const { data, msg, status, success } =
      await studentSupervisorService.getSupervisorProfile(supervisorId);
    return res.status(status).json({ success, msg, data });
  },

  requestSupervision: async (req, res) => {
    const { id: userId } = req.user;
    const { supervisorId } = req.body;
    const { data, msg, status, success } =
      await studentSupervisorService.requestSupervision(userId, supervisorId);
    return res.status(status).json({ success, msg, data });
  },

  cancelSupervisionRequest: async (req, res) => {
    const { id: userId } = req.user;
    const { supervisorId } = req.body;
    const { data, msg, status, success } =
      await studentSupervisorService.cancelRequest(userId, supervisorId);
    return res.status(status).json({ success, msg, data });
  },
};

export default studentController;


