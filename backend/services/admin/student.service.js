import BaseService from "../base-service.js";
import User from "../../models/user.js";
import Student from "../../models/student.js";
import Group from "../../models/group.js";
import bcrypt from "bcryptjs";

class AdminStudentService extends BaseService {
  // Get all students with pagination and filters
  async getAllStudents(query) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const search = query.search || "";
      const skip = (page - 1) * limit;

      // Build search query
      const searchQuery = {
        role: "student",
      };

      if (search) {
        searchQuery.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const users = await User.find(searchQuery)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Get student profiles for each user
      const userIds = users.map((u) => u._id);
      const students = await Student.find({ userId: { $in: userIds } }).lean();

      // Get groups for each student
      const groups = await Group.find({
        $or: [
          { createdBy: { $in: userIds } },
          { members: { $in: userIds } },
        ],
      }).lean();

      const enrichedUsers = users.map((user) => {
        const student = students.find(
          (s) => s.userId.toString() === user._id.toString()
        );
        const userGroups = groups.filter(
          (g) =>
            g.createdBy.toString() === user._id.toString() ||
            g.members.some((m) => m.toString() === user._id.toString())
        );

        return {
          ...user,
          studentProfile: student || null,
          groupsCount: userGroups.length,
          isInGroup: userGroups.length > 0,
        };
      });

      const total = await User.countDocuments(searchQuery);

      return this.handleResponse(200, true, "Students retrieved", {
        students: enrichedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Get single student by ID
  async getStudentById(studentId) {
    try {
      const user = await User.findById(studentId)
        .select("-password")
        .lean();

      if (!user || user.role !== "student") {
        return this.handleResponse(404, false, "Student not found");
      }

      const student = await Student.findOne({ userId: studentId }).lean();
      const groups = await Group.find({
        $or: [{ createdBy: studentId }, { members: studentId }],
      })
        .populate("createdBy", "firstName lastName email")
        .populate("members", "firstName lastName email")
        .populate("supervisor", "firstName lastName email")
        .lean();

      return this.handleResponse(200, true, "Student retrieved", {
        student: {
          ...user,
          studentProfile: student || null,
          groups,
        },
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Create student
  async createStudent(data) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        department,
        completedCreditHours,
        skills,
        interests,
      } = data;

      if (!firstName || !email || !password) {
        return this.handleResponse(
          400,
          false,
          "First name, email, and password are required"
        );
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
      }).lean();

      if (existingUser) {
        return this.handleResponse(400, false, "Email already exists");
      }

      // Create user
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName?.trim() || "",
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "student",
      });

      // Create student profile if profile data provided
      if (department || completedCreditHours || skills || interests) {
        await Student.create({
          userId: user._id,
          department: department || "",
          completedCreditHours: completedCreditHours || 0,
          skills: skills || [],
          interests: interests || [],
          profileCompleted: !!(department && skills && interests),
        });
      }

      const populatedUser = await User.findById(user._id)
        .select("-password")
        .lean();

      return this.handleResponse(201, true, "Student created successfully", {
        student: populatedUser,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Update student
  async updateStudent(studentId, data) {
    try {
      const user = await User.findById(studentId).lean();

      if (!user || user.role !== "student") {
        return this.handleResponse(404, false, "Student not found");
      }

      const {
        firstName,
        lastName,
        email,
        password,
        department,
        completedCreditHours,
        skills,
        interests,
      } = data;

      // Update user
      const updateData = {};
      if (firstName) updateData.firstName = firstName.trim();
      if (lastName !== undefined) updateData.lastName = lastName.trim();
      if (email) {
        const existingUser = await User.findOne({
          email: email.toLowerCase().trim(),
          _id: { $ne: studentId },
        }).lean();
        if (existingUser) {
          return this.handleResponse(400, false, "Email already exists");
        }
        updateData.email = email.toLowerCase().trim();
      }
      if (password) {
        const salt = bcrypt.genSaltSync(10);
        updateData.password = bcrypt.hashSync(password, salt);
      }

      await User.findByIdAndUpdate(studentId, updateData);

      // Update or create student profile
      const student = await Student.findOne({ userId: studentId }).lean();
      const studentUpdateData = {};
      if (department !== undefined) studentUpdateData.department = department;
      if (completedCreditHours !== undefined)
        studentUpdateData.completedCreditHours = completedCreditHours;
      if (skills !== undefined) studentUpdateData.skills = skills;
      if (interests !== undefined) studentUpdateData.interests = interests;

      if (Object.keys(studentUpdateData).length > 0) {
        studentUpdateData.profileCompleted = !!(
          (department || student?.department) &&
          (skills || student?.skills) &&
          (interests || student?.interests)
        );

        if (student) {
          await Student.findByIdAndUpdate(student._id, studentUpdateData);
        } else {
          await Student.create({
            userId: studentId,
            ...studentUpdateData,
          });
        }
      }

      const updatedUser = await User.findById(studentId)
        .select("-password")
        .lean();

      return this.handleResponse(200, true, "Student updated successfully", {
        student: updatedUser,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Disable/Enable student
  async toggleStudentStatus(studentId, isActive) {
    try {
      const user = await User.findById(studentId).lean();

      if (!user || user.role !== "student") {
        return this.handleResponse(404, false, "Student not found");
      }

      // Add isActive field to user if not exists
      await User.findByIdAndUpdate(studentId, {
        isActive: isActive !== undefined ? isActive : !user.isActive,
      });

      return this.handleResponse(200, true, "Student status updated", {
        isActive: isActive !== undefined ? isActive : !user.isActive,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Delete student
  async deleteStudent(studentId) {
    try {
      const user = await User.findById(studentId).lean();

      if (!user || user.role !== "student") {
        return this.handleResponse(404, false, "Student not found");
      }

      // Check if student is in any group
      const groups = await Group.find({
        $or: [{ createdBy: studentId }, { members: studentId }],
      }).lean();

      if (groups.length > 0) {
        return this.handleResponse(
          400,
          false,
          "Cannot delete student who is part of a group. Please remove them from groups first."
        );
      }

      // Delete student profile
      await Student.deleteMany({ userId: studentId });

      // Delete user
      await User.findByIdAndDelete(studentId);

      return this.handleResponse(200, true, "Student deleted successfully");
    } catch (err) {
      return this.handleError(err);
    }
  }
}

const adminStudentService = new AdminStudentService();

export default adminStudentService;

