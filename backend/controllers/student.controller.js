import studentService from "../services/student-service.js";

const studentController = {
  getProfile: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } = await studentService.getStudentProfile(
      userId
    );
    return res.status(status).json({ success, msg, data });
  },

  updateProfile: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await studentService.updateStudentProfile(userId, req.body);
    return res.status(status).json({ success, msg, data });
  },

  checkProfileComplete: async (req, res) => {
    const { id: userId } = req.user;
    const { data, msg, status, success } =
      await studentService.checkProfileComplete(userId);
    return res.status(status).json({ success, msg, data });
  },
};

export default studentController;


