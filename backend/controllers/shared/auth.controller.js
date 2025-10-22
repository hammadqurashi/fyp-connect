import authService from "../../services/shared/auth-service.js";

const authController = {
  signup: async (req, res) => {
    const { firstName, lastName, email, password, role, profileImg } = req.body;

    const { data, msg, status, success } = await authService.createUser({
      firstName,
      lastName,
      email,
      password,
      role,
      profileImg,
    });

    return res.status(status).json({ success, msg, data });
  },

  login: async (req, res) => {
    const { data, msg, status, success } = await authService.login(req.body);

    return res.status(status).json({ success, msg, data });
  },

  continueWithGoogle: async (req, res) => {
    const { data, msg, status, success } = await authService.continueWithGoogle(
      req.body
    );

    return res.status(status).json({ success, msg, data });
  },

  // Authorized api
  getMyDetails: async (req, res) => {
    const { data, msg, status, success } = await authService.getMyDetails(
      req.user
    );

    return res.status(status).json({ success, msg, data });
  },

  refreshToken: async (req, res) => {
    const { data, msg, status, success } = await authService.refreshToken(
      req.user
    );

    return res.status(status).json({ success, msg, data });
  },
};

export default authController;
