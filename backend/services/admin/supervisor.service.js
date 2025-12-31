import BaseService from "../base-service.js";
import User from "../../models/user.js";
import Supervisor from "../../models/supervisor.js";
import Group from "../../models/group.js";
import bcrypt from "bcryptjs";

class AdminSupervisorService extends BaseService {
  // Get all supervisors with pagination and filters
  async getAllSupervisors(query) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const search = query.search || "";
      const skip = (page - 1) * limit;

      // Build search query
      const searchQuery = {
        role: "supervisor",
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

      // Get supervisor profiles for each user
      const userIds = users.map((u) => u._id);
      const supervisors = await Supervisor.find({
        userId: { $in: userIds },
      }).lean();

      // Get groups supervised by each supervisor
      const groups = await Group.find({
        supervisor: { $in: userIds },
      }).lean();

      const enrichedUsers = users.map((user) => {
        const supervisor = supervisors.find(
          (s) => s.userId.toString() === user._id.toString()
        );
        const supervisedGroups = groups.filter(
          (g) => g.supervisor.toString() === user._id.toString()
        );

        return {
          ...user,
          supervisorProfile: supervisor || null,
          supervisedGroupsCount: supervisedGroups.length,
        };
      });

      const total = await User.countDocuments(searchQuery);

      return this.handleResponse(200, true, "Supervisors retrieved", {
        supervisors: enrichedUsers,
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

  // Get single supervisor by ID
  async getSupervisorById(supervisorId) {
    try {
      const user = await User.findById(supervisorId)
        .select("-password")
        .lean();

      if (!user || user.role !== "supervisor") {
        return this.handleResponse(404, false, "Supervisor not found");
      }

      const supervisor = await Supervisor.findOne({
        userId: supervisorId,
      }).lean();
      const groups = await Group.find({ supervisor: supervisorId })
        .populate("createdBy", "firstName lastName email")
        .populate("members", "firstName lastName email")
        .lean();

      return this.handleResponse(200, true, "Supervisor retrieved", {
        supervisor: {
          ...user,
          supervisorProfile: supervisor || null,
          groups,
        },
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Create supervisor
  async createSupervisor(data) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        description,
        department,
        level,
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
        role: "supervisor",
      });

      // Create supervisor profile if profile data provided
      if (description || department || level || skills || interests) {
        await Supervisor.create({
          userId: user._id,
          description: description || "",
          department: department || "",
          level: level || "other",
          skills: skills || [],
          interests: interests || [],
          profileCompleted: !!(description && department && skills && interests),
        });
      }

      const populatedUser = await User.findById(user._id)
        .select("-password")
        .lean();

      return this.handleResponse(201, true, "Supervisor created successfully", {
        supervisor: populatedUser,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Update supervisor
  async updateSupervisor(supervisorId, data) {
    try {
      const user = await User.findById(supervisorId).lean();

      if (!user || user.role !== "supervisor") {
        return this.handleResponse(404, false, "Supervisor not found");
      }

      const {
        firstName,
        lastName,
        email,
        password,
        description,
        department,
        level,
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
          _id: { $ne: supervisorId },
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

      await User.findByIdAndUpdate(supervisorId, updateData);

      // Update or create supervisor profile
      const supervisor = await Supervisor.findOne({
        userId: supervisorId,
      }).lean();
      const supervisorUpdateData = {};
      if (description !== undefined) supervisorUpdateData.description = description;
      if (department !== undefined) supervisorUpdateData.department = department;
      if (level !== undefined) supervisorUpdateData.level = level;
      if (skills !== undefined) supervisorUpdateData.skills = skills;
      if (interests !== undefined) supervisorUpdateData.interests = interests;

      if (Object.keys(supervisorUpdateData).length > 0) {
        supervisorUpdateData.profileCompleted = !!(
          (description || supervisor?.description) &&
          (department || supervisor?.department) &&
          (skills || supervisor?.skills) &&
          (interests || supervisor?.interests)
        );

        if (supervisor) {
          await Supervisor.findByIdAndUpdate(supervisor._id, supervisorUpdateData);
        } else {
          await Supervisor.create({
            userId: supervisorId,
            ...supervisorUpdateData,
          });
        }
      }

      const updatedUser = await User.findById(supervisorId)
        .select("-password")
        .lean();

      return this.handleResponse(200, true, "Supervisor updated successfully", {
        supervisor: updatedUser,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Disable/Enable supervisor
  async toggleSupervisorStatus(supervisorId, isActive) {
    try {
      const user = await User.findById(supervisorId).lean();

      if (!user || user.role !== "supervisor") {
        return this.handleResponse(404, false, "Supervisor not found");
      }

      // Add isActive field to user if not exists
      await User.findByIdAndUpdate(supervisorId, {
        isActive: isActive !== undefined ? isActive : !user.isActive,
      });

      return this.handleResponse(200, true, "Supervisor status updated", {
        isActive: isActive !== undefined ? isActive : !user.isActive,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Delete supervisor
  async deleteSupervisor(supervisorId) {
    try {
      const user = await User.findById(supervisorId).lean();

      if (!user || user.role !== "supervisor") {
        return this.handleResponse(404, false, "Supervisor not found");
      }

      // Check if supervisor is supervising any groups
      const groups = await Group.find({ supervisor: supervisorId }).lean();

      if (groups.length > 0) {
        return this.handleResponse(
          400,
          false,
          "Cannot delete supervisor who is supervising groups. Please reassign groups first."
        );
      }

      // Delete supervisor profile
      await Supervisor.deleteMany({ userId: supervisorId });

      // Delete user
      await User.findByIdAndDelete(supervisorId);

      return this.handleResponse(200, true, "Supervisor deleted successfully");
    } catch (err) {
      return this.handleError(err);
    }
  }
}

const adminSupervisorService = new AdminSupervisorService();

export default adminSupervisorService;

