import adminStudentService from "../services/admin/student.service.js";
import adminSupervisorService from "../services/admin/supervisor.service.js";

const adminController = {
  // Student management
  getAllStudents: async (req, res) => {
    const { data, msg, status, success } =
      await adminStudentService.getAllStudents(req.query);
    return res.status(status).json({ success, msg, data });
  },

  getStudentById: async (req, res) => {
    const { studentId } = req.params;
    const { data, msg, status, success } =
      await adminStudentService.getStudentById(studentId);
    return res.status(status).json({ success, msg, data });
  },

  createStudent: async (req, res) => {
    const { data, msg, status, success } =
      await adminStudentService.createStudent(req.body);
    return res.status(status).json({ success, msg, data });
  },

  updateStudent: async (req, res) => {
    const { studentId } = req.params;
    const { data, msg, status, success } =
      await adminStudentService.updateStudent(studentId, req.body);
    return res.status(status).json({ success, msg, data });
  },

  toggleStudentStatus: async (req, res) => {
    const { studentId } = req.params;
    const { isActive } = req.body;
    const { data, msg, status, success } =
      await adminStudentService.toggleStudentStatus(studentId, isActive);
    return res.status(status).json({ success, msg, data });
  },

  deleteStudent: async (req, res) => {
    const { studentId } = req.params;
    const { data, msg, status, success } =
      await adminStudentService.deleteStudent(studentId);
    return res.status(status).json({ success, msg, data });
  },

  // Supervisor management
  getAllSupervisors: async (req, res) => {
    const { data, msg, status, success } =
      await adminSupervisorService.getAllSupervisors(req.query);
    return res.status(status).json({ success, msg, data });
  },

  getSupervisorById: async (req, res) => {
    const { supervisorId } = req.params;
    const { data, msg, status, success } =
      await adminSupervisorService.getSupervisorById(supervisorId);
    return res.status(status).json({ success, msg, data });
  },

  createSupervisor: async (req, res) => {
    const { data, msg, status, success } =
      await adminSupervisorService.createSupervisor(req.body);
    return res.status(status).json({ success, msg, data });
  },

  updateSupervisor: async (req, res) => {
    const { supervisorId } = req.params;
    const { data, msg, status, success } =
      await adminSupervisorService.updateSupervisor(supervisorId, req.body);
    return res.status(status).json({ success, msg, data });
  },

  toggleSupervisorStatus: async (req, res) => {
    const { supervisorId } = req.params;
    const { isActive } = req.body;
    const { data, msg, status, success } =
      await adminSupervisorService.toggleSupervisorStatus(supervisorId, isActive);
    return res.status(status).json({ success, msg, data });
  },

  deleteSupervisor: async (req, res) => {
    const { supervisorId } = req.params;
    const { data, msg, status, success } =
      await adminSupervisorService.deleteSupervisor(supervisorId);
    return res.status(status).json({ success, msg, data });
  },
};

export default adminController;

