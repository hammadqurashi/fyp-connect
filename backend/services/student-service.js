import BaseService from "./base-service.js";
import Student from "../models/student.js";
import User from "../models/user.js";

class StudentService extends BaseService {
  async getStudentProfile(userId) {
    try {
      let student = await Student.findOne({ userId }).lean();

      if (!student) {
        // Create student profile if it doesn't exist
        student = await Student.create({ userId, profileCompleted: false });
        student = student.toObject();
      }

      // Populate user details
      const user = await User.findById(userId).lean();

      return this.handleResponse(200, true, "Student profile retrieved", {
        ...student,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profileImg: user.profileImg,
        },
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  async updateStudentProfile(userId, data) {
    try {
      const { department, completedCreditHours, skills, interests } = data;

      let student = await Student.findOne({ userId });

      if (!student) {
        student = new Student({ userId });
      }

      if (department !== undefined) student.department = department;
      if (completedCreditHours !== undefined)
        student.completedCreditHours = completedCreditHours;
      if (skills !== undefined) student.skills = skills;
      if (interests !== undefined) student.interests = interests;

      // Check if profile is complete
      if (
        student.department &&
        student.completedCreditHours !== undefined &&
        student.completedCreditHours !== null &&
        student.skills.length > 0 &&
        student.interests.length > 0
      ) {
        student.profileCompleted = true;
      }

      await student.save();

      return this.handleResponse(
        200,
        true,
        "Profile updated successfully",
        student.toObject()
      );
    } catch (err) {
      return this.handleError(err);
    }
  }

  async checkProfileComplete(userId) {
    try {
      const student = await Student.findOne({ userId }).lean();

      if (!student) {
        return this.handleResponse(200, true, "Profile status", {
          profileCompleted: false,
        });
      }

      return this.handleResponse(200, true, "Profile status", {
        profileCompleted: student.profileCompleted || false,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }
}

const studentService = new StudentService();

export default studentService;
