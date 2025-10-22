import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

import BaseService from "../base-service.js";
import { AppConfig } from "../../config/index.js";
import User from "../../models/user.js";

class AuthService extends BaseService {
  async createUser(data) {
    try {
      const { firstName, lastName, email, password, role, profileImg } = data;

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const user = new User({
        firstName: firstName.trim(),
        lastName,
        email: email.trim()?.toLowerCase(),
        password: hashedPassword,
        role,
        profileImg,
      });

      await user.save();

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        AppConfig.jwtSecret,
        {
          expiresIn: "1h",
        }
      );

      return this.handleResponse(200, true, "Account created successfully!", {
        token,
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
      console.log(err);
      return this.handleError(err);
    }
  }

  async login(data) {
    try {
      const { email, password } = data;

      const user = await User.findOne({
        email: email.toLowerCase().trim(),
      }).lean();

      if (!user) {
        return this.handleResponse(400, false, "Invalid credentials");
      }

      const isCorrect = bcrypt.compareSync(password, user.password);

      if (!isCorrect) {
        return this.handleResponse(400, false, "Invalid credentials");
      }

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        AppConfig.jwtSecret,
        {
          expiresIn: "1h",
        }
      );

      return this.handleResponse(200, true, "Login successfull", {
        token,
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
      console.log(err);
      return this.handleError(err);
    }
  }

  async continueWithGoogle(data) {
    try {
      const { access_token } = data;

      const googleRes = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (!googleRes || !googleRes.data) {
        return this.handleResponse(400, false, "Login failed!");
      }

      const userObj = {
        firstName: googleRes.data.given_name,
        lastName: googleRes.data.family_name,
        profileImg: googleRes.data.picture,
        password: googleRes.data.sub,
        email: googleRes.data.email,
        role: "student", // Default role for Google sign-in
      };

      const user = await User.findOne({ email: googleRes.data.email });

      if (!user) {
        const res = await this.createUser(userObj);
        return res;
      }

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        AppConfig.jwtSecret,
        {
          expiresIn: "1h",
        }
      );

      return this.handleResponse(200, true, "Login successful", {
        token,
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
      console.log(err);
      return this.handleError(err);
    }
  }

  async getMyDetails(userData) {
    try {
      const { id: userId } = userData;

      const user = await User.findById(userId).lean();

      if (!user) {
        return this.handleResponse(400, false, "UnAuthorized");
      }

      const userDetails = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImg: user.profileImg,
      };

      return this.handleResponse(200, true, "Auth session.", {
        user: userDetails,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  async refreshToken(userData) {
    try {
      const { id: userId } = userData;

      const user = await User.findById(userId).lean();

      if (!user) {
        return this.handleResponse(400, false, "UnAuthorized");
      }

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        AppConfig.jwtSecret,
        {
          expiresIn: "1h",
        }
      );

      return this.handleResponse(200, true, "Token refreshed successfully", {
        token,
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
}

const authService = new AuthService();

export default authService;
