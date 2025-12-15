import BaseService from "../base-service.js";
import Supervisor from "../../models/supervisor.js";
import User from "../../models/user.js";

class SupervisorProfileService extends BaseService {
  async getSupervisorProfile(userId) {
    try {
      let supervisor = await Supervisor.findOne({ userId }).lean();

      if (!supervisor) {
        // Create supervisor profile if it doesn't exist
        supervisor = await Supervisor.create({
          userId,
          profileCompleted: false,
        });
        supervisor = supervisor.toObject();
      }

      // Populate user details
      const user = await User.findById(userId).lean();

      return this.handleResponse(200, true, "Supervisor profile retrieved", {
        ...supervisor,
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

  async updateSupervisorProfile(userId, data) {
    try {
      const { description, department, level, skills, interests } = data;

      let supervisor = await Supervisor.findOne({ userId });

      if (!supervisor) {
        supervisor = new Supervisor({ userId });
      }

      if (description !== undefined) supervisor.description = description;
      if (department !== undefined) supervisor.department = department;
      if (level !== undefined) supervisor.level = level;
      if (skills !== undefined) supervisor.skills = skills;
      if (interests !== undefined) supervisor.interests = interests;

      // Check if profile is complete
      if (
        supervisor.description &&
        supervisor.department &&
        supervisor.level &&
        supervisor.skills.length > 0 &&
        supervisor.interests.length > 0
      ) {
        supervisor.profileCompleted = true;
      }

      await supervisor.save();

      return this.handleResponse(
        200,
        true,
        "Profile updated successfully",
        supervisor.toObject()
      );
    } catch (err) {
      return this.handleError(err);
    }
  }

  async checkProfileComplete(userId) {
    try {
      const supervisor = await Supervisor.findOne({ userId }).lean();

      if (!supervisor) {
        return this.handleResponse(200, true, "Profile status", {
          profileCompleted: false,
        });
      }

      return this.handleResponse(200, true, "Profile status", {
        profileCompleted: supervisor.profileCompleted || false,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }
}

const supervisorProfileService = new SupervisorProfileService();

export default supervisorProfileService;

