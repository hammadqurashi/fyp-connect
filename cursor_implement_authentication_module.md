# Implement authentication module and role-based access
_Exported on 10/15/2025 at 20:42:56 GMT+5 from Cursor (1.7.37)_

---

**User**

I'll tell the module, you implement that module.
Below is project overview:
### Project Overview

This is the university project **"FYP Connect"**, developed with the following tech stack:

* **Frontend**: Vite (React + TypeScript)
* **Backend**: Node.js
* **Database**: MongoDB

Project structure:

* `/backend` → Contains complete backend files
* `/frontend` → Contains complete frontend files

The system supports **three roles**: **Student, Supervisor, and Admin**.

---

### Features by Role

#### 👩‍🎓 Student

1. **Group Creation**

   * Steps:

     * Add Basic Info
     * Apply Filters (to find other students)
     * Send Invitations (can invite many students, but only the first 4 who accept can join)
   * Notifications: Each invited student receives a notification on their dashboard.
   * **UI completed** → Path: `/frontend/src/pages/GroupFormation.tsx`
   * **Task**: Build backend APIs + integrate with frontend.

2. **Find & Request Supervisors**

   * Students (only if enrolled in a group) can view supervisors and request supervision.
   * On request, group details are sent to the supervisor’s dashboard.
   * **UI completed** → Path: `/frontend/src/pages/Supervisors.tsx`
   * **Task**: Build backend APIs + integrate with frontend.

3. **View Supervisor Posts & Contact**

   * Students can scroll through supervisor posts.
   * If interested, they can send a query message (form submission).
   * These queries appear on the supervisor’s dashboard.
   * **UI completed** → Path: `/frontend/src/pages/SupervisorFeed.tsx`
   * **Task**: Build backend APIs + integrate with frontend.

4. **Collaboration Portal**

   * Opened once a group is formed.
   * Includes up to **4 group members + their supervisor**.
   * Features: Chat + File Sharing (via socket.io).
   * **UI completed** → Path: `/frontend/src/pages/Collaboration.tsx`
   * **Task**: Implement backend APIs + socket.io integration.

---

#### 👨‍🏫 Supervisor

1. **Collaboration Portal**

   * Same as students.
   * Limit: Each supervisor can manage up to **3 groups**.

2. **Add Posts**

   * Supervisors can create posts visible to students.

3. **Notifications**

   * Supervisors can receive notifications.

4. **Group Requests**

   * Supervisors receive group requests from students.
   * They can accept or reject requests.
   * Students are notified in both cases.

5. **Contact Queries**

   * Supervisors can view and respond to contact queries sent by students.

---

#### 👨‍💼 Admin

1. **Manage Students** – Add students.
2. **Manage Supervisors** – Add supervisors.
3. **Notifications** – Send notifications to:

   * Students
   * Supervisors
   * Or both

---

### 🔑 Additional Requirements

* Implement complete **authentication flow** (login/signup/role-based access).
* Use **socket.io** for real-time chat & collaboration features.
* Ensure role-based authorization for all APIs.
* Make sure notifications are properly integrated for all roles.

---

### ⚡ Deliverable

* Complete backend APIs.
* API integration with the provided frontend UI.
* Working authentication + real-time collaboration.




Now Complete Auth Module first, integrate the Auth API's, when user logs in the sidebar menu should be shown according to the role, implement protected routes with allowed roles (student can't navigate to supervisor or admin page and vise versa)

---

**Cursor**

I'll implement the complete Auth Module with role-based access control. Let me start by analyzing the current project structure and then implement the authentication system.


Let me first analyze the current authentication structure to understand what's already implemented:


Now let me check the middleware and configuration files:


Now let me check the current routing structure and types:


Now let me check the login form and current auth implementation:


Now I'll start implementing the complete authentication system. First, let me update the backend authentication APIs:


Let me fix the backend auth service first - there's a missing import and some issues:


```javascript
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
      });
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }
  }

  async login(data) {
    try {
      const { email, password } = data;

      const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();

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
        this.handleResponse(400, false, "Login failed!");
      }

      const userObj = {
        firstName: googleRes.data.given_name,
        lastName: googleRes.data.family_name,
        profileImg: googleRes.data.picture,
        password: googleRes.data.sub,
        email: googleRes.data.email,
      };

      const user = await User.findOne({ email: googleRes.data.email });

      if (!user) {
        const res = await this.createUser(userObj);
        return res;
      }

      const token = jwt.sign(
        {
          id: user._id,
        },
        AppConfig.jwtSecret,
        {
          expiresIn: "15m",
        }
      );

      return this.handleResponse(200, true, "Login successfull", {
        token,
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
}

const authService = new AuthService();

export default authService;

```

Now let me fix the Google auth service issue:


```javascript
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
      });
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }
  }

  async login(data) {
    try {
      const { email, password } = data;

      const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();

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
}

const authService = new AuthService();

export default authService;

```

Now let me add a refresh token endpoint to the auth controller and routes:


```javascript
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

```

Now let me add the refreshToken method to the auth service:


```javascript
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
      });
    } catch (err) {
      console.log(err);
      return this.handleError(err);
    }
  }

  async login(data) {
    try {
      const { email, password } = data;

      const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();

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

```

Now let me add the refresh token route:


```javascript
import { Router } from "express";
import { authCheck } from "../../../middlewares/index.js";
import authController from "../../../controllers/shared/auth.controller.js";

const router = Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/google", authController.continueWithGoogle);
router.get("/me", authCheck, authController.getMyDetails);
router.post("/refresh", authCheck, authController.refreshToken);

export default router;

```

Now let me update the frontend auth service to properly integrate with the backend:


```typescript
import { IUser } from "@/types/user";
import BaseService from "./base-service";
import jwtService from "../local/jwt-service";

interface LoginResponse {
  success: boolean;
  msg: string;
  data: {
    token: string;
    user: IUser;
  };
}

interface SignupResponse {
  success: boolean;
  msg: string;
  data: {
    token: string;
  };
}

interface UserDetailsResponse {
  success: boolean;
  msg: string;
  data: {
    user: IUser;
  };
}

class AuthService extends BaseService {
  async login(payload: { email: string; password: string }): Promise<LoginResponse> {
    const res = await this.httpService.post<LoginResponse>("/auth/login", payload);
    return res;
  }

  async signup(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "student" | "supervisor" | "admin";
    profileImg?: string;
  }): Promise<SignupResponse> {
    const res = await this.httpService.post<SignupResponse>("/auth/signup", payload);
    return res;
  }

  async continueWithGoogle(payload: { access_token: string }): Promise<LoginResponse> {
    const res = await this.httpService.post<LoginResponse>("/auth/google", payload);
    return res;
  }

  async getUserDetailsByToken(): Promise<IUser | null> {
    const res = await this.httpService.get<UserDetailsResponse>("/auth/me");

    if (res.success) {
      return res.data.user;
    }

    return null;
  }

  async refreshToken(): Promise<LoginResponse> {
    const res = await this.httpService.post<LoginResponse>("/auth/refresh");
    return res;
  }

  async sendResetPassOTP() {
    const res = await this.httpService.get<any>("/auth/send-otp");
    return res;
  }

  async verifyOtp(payload: any) {
    const res = await this.httpService.post<any>("/auth/verify-otp", payload);
    return res;
  }

  async resetPassword(payload: any) {
    const res = await this.httpService.post<any>(
      "/auth/reset-password",
      payload
    );
    return res;
  }
}

const authService = new AuthService();

export default authService;

```

Now let me check and update the IUser type to match the backend:


I need to create a user type file. Let me check if it exists:


Let me create the user types file:


```typescript
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImg: string | null;
  role: "student" | "supervisor" | "admin";
}

export interface IAuthUser extends IUser {}

export interface IAuthSession {
  token: string;
}
```

Now let me update the types index to export the user types:


```typescript
export * from "./user";
export * from "./http";

```

Now let me update the auth service import:


```typescript
import { IUser } from "@/core/types/user";
import BaseService from "./base-service";
import jwtService from "../local/jwt-service";

interface LoginResponse {
  success: boolean;
  msg: string;
  data: {
    token: string;
    user: IUser;
  };
}

interface SignupResponse {
  success: boolean;
  msg: string;
  data: {
    token: string;
  };
}

interface UserDetailsResponse {
  success: boolean;
  msg: string;
  data: {
    user: IUser;
  };
}

class AuthService extends BaseService {
  async login(payload: { email: string; password: string }): Promise<LoginResponse> {
    const res = await this.httpService.post<LoginResponse>("/auth/login", payload);
    return res;
  }

  async signup(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "student" | "supervisor" | "admin";
    profileImg?: string;
  }): Promise<SignupResponse> {
    const res = await this.httpService.post<SignupResponse>("/auth/signup", payload);
    return res;
  }

  async continueWithGoogle(payload: { access_token: string }): Promise<LoginResponse> {
    const res = await this.httpService.post<LoginResponse>("/auth/google", payload);
    return res;
  }

  async getUserDetailsByToken(): Promise<IUser | null> {
    const res = await this.httpService.get<UserDetailsResponse>("/auth/me");

    if (res.success) {
      return res.data.user;
    }

    return null;
  }

  async refreshToken(): Promise<LoginResponse> {
    const res = await this.httpService.post<LoginResponse>("/auth/refresh");
    return res;
  }

  async sendResetPassOTP() {
    const res = await this.httpService.get<any>("/auth/send-otp");
    return res;
  }

  async verifyOtp(payload: any) {
    const res = await this.httpService.post<any>("/auth/verify-otp", payload);
    return res;
  }

  async resetPassword(payload: any) {
    const res = await this.httpService.post<any>(
      "/auth/reset-password",
      payload
    );
    return res;
  }
}

const authService = new AuthService();

export default authService;

```

Now let me update the auth slice to work with the new auth service:


```typescript
import jwtService from "@/core/services/local/jwt-service";
import { IAuthUser } from "@/core/types";
import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isLoggedIn: boolean;
  user: IAuthUser | null;
  token: string;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  token: "",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      const { token, user } = action.payload;

      state.isLoggedIn = true;
      state.token = token;
      state.user = user || null;

      jwtService.setAuthSession({ token });
    },

    setUser(state, action) {
      const { user } = action.payload;

      state.user = user;
    },

    updateToken(state, action) {
      const { token } = action.payload;
      state.token = token;
      jwtService.setAuthSession({ token });
    },

    logout(state) {
      state.isLoggedIn = false;
      state.token = "";
      state.user = null;

      jwtService.clearSession();
    },
  },
});

export const { setAuth, setUser, updateToken, logout } = authSlice.actions;

```

Now let me update the auth store index to export the actions:


Good, the actions are already exported. Now let me update the login form hook to use the new auth service:


```typescript
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import authService from "@/core/services/api/auth-service";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { authActions } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { studentRoutes } from "@/core/routes";

const loginFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const useLoginForm = () => {
  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await authService.login(data);
      
      if (res.success && res.data) {
        const { token, user } = res.data;
        
        toast.success(res.msg);
        dispatch(authActions.setAuth({ token, user }));
        
        // Navigate based on user role
        switch (user.role) {
          case "student":
            navigate(studentRoutes.DASHBOARD_ROUTE);
            break;
          case "supervisor":
            navigate("/");
            break;
          case "admin":
            navigate("/");
            break;
          default:
            navigate("/");
        }
        
        return;
      }
      
      toast.error(res.msg || "Login failed");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    }
  };

  return { form, onSubmit };
};

export default useLoginForm;

```

Now let me implement the protected routes system. First, let me create a ProtectedRoute component:


```typescriptreact
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { authRoutes } from "@/core/routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "supervisor" | "admin")[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const user = useSelector((state: any) => state.auth.user);
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);
  const location = useLocation();

  // If auth is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If not logged in, redirect to login
  if (!isLoggedIn || !user) {
    return <Navigate to={authRoutes.LOGIN_ROUTE} state={{ from: location }} replace />;
  }

  // If roles are specified and user role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard or appropriate page based on role
    const defaultRoute = user.role === "student" ? "/" : "/";
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

Now let me update the App.tsx to use protected routes:


```typescriptreact
import { Toaster } from "sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/shared/ui/dashboard.layout";
import Dashboard from "./pages/Dashboard";
import GroupFormation from "./pages/GroupFormation";
import Supervisors from "./pages/Supervisors";
import SupervisorFeed from "./pages/SupervisorFeed";
import Notifications from "./pages/Notifications";
import Collaboration from "./pages/Collaboration";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/auth/login.page";
import { authRoutes, studentRoutes, supervisorRoutes } from "./core/routes";
import SupervisorPosts from "./pages/SupervisorPosts";
import AdminNotifications from "./pages/AdminNotifications";
import { ForgotPasswordPage } from "./pages/auth/forgot-password.page";
import ProtectedRoute from "@/shared/components/protected-route";

const queryClient = new QueryClient();

const App = () => {
  const user = useSelector((state: any) => state.auth.user);
  const role = user?.role;
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
          {/* Auth routes */}
          <Route path={authRoutes.LOGIN_ROUTE} element={<LoginPage />} />
          <Route
            path={authRoutes.FORGOT_PASSWORD_ROUTE}
            element={<ForgotPasswordPage />}
          />

          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route
              path={studentRoutes.CREATE_GROUP_ROUTE}
              element={<GroupFormation />}
            />
            <Route path="/supervisors" element={<Supervisors />} />
            <Route path="/supervisor-feed" element={<SupervisorFeed />} />
            {role === "supervisor" && (
              <Route path={supervisorRoutes.SUP_POSTS_ROUTE} element={<SupervisorPosts />} />
            )}
            {role === "admin" && (
              <Route path="/admin/notifications" element={<AdminNotifications />} />
            )}
            <Route
              path={studentRoutes.NOTIFICATIONS_ROUTE}
              element={<Notifications />}
            />
            <Route path="/collaboration" element={<Collaboration />} />
            <Route
              path="/guidelines"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">FYP Guidelines</h1>
                  <p className="text-muted-foreground">
                    Project guidelines and requirements will be displayed
                    here...
                  </p>
                </div>
              }
            />
            <Route
              path="/students"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Find Students</h1>
                  <p className="text-muted-foreground">
                    Student discovery and networking features coming soon...
                  </p>
                </div>
              }
            />
            <Route
              path="/research"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Research Areas</h1>
                  <p className="text-muted-foreground">
                    Research area directory and exploration coming soon...
                  </p>
                </div>
              }
            />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

```

```typescriptreact
import { Toaster } from "sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/shared/ui/dashboard.layout";
import Dashboard from "./pages/Dashboard";
import GroupFormation from "./pages/GroupFormation";
import Supervisors from "./pages/Supervisors";
import SupervisorFeed from "./pages/SupervisorFeed";
import Notifications from "./pages/Notifications";
import Collaboration from "./pages/Collaboration";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/auth/login.page";
import { authRoutes, studentRoutes, supervisorRoutes } from "./core/routes";
import SupervisorPosts from "./pages/SupervisorPosts";
import AdminNotifications from "./pages/AdminNotifications";
import { ForgotPasswordPage } from "./pages/auth/forgot-password.page";
import ProtectedRoute from "@/shared/components/protected-route";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Auth routes - no protection needed */}
            <Route path={authRoutes.LOGIN_ROUTE} element={<LoginPage />} />
            <Route
              path={authRoutes.FORGOT_PASSWORD_ROUTE}
              element={<ForgotPasswordPage />}
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              {/* Student-only routes */}
              <Route
                path={studentRoutes.CREATE_GROUP_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <GroupFormation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisors"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Supervisors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisor-feed"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SupervisorFeed />
                  </ProtectedRoute>
                }
              />
              
              {/* Supervisor-only routes */}
              <Route
                path={supervisorRoutes.SUP_POSTS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["supervisor"]}>
                    <SupervisorPosts />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin-only routes */}
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />
              
              {/* Common routes for all authenticated users */}
              <Route
                path={studentRoutes.NOTIFICATIONS_ROUTE}
                element={<Notifications />}
              />
              <Route path="/collaboration" element={<Collaboration />} />
              
              {/* Resource pages */}
              <Route
                path="/guidelines"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">FYP Guidelines</h1>
                    <p className="text-muted-foreground">
                      Project guidelines and requirements will be displayed
                      here...
                    </p>
                  </div>
                }
              />
              <Route
                path="/students"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Find Students</h1>
                    <p className="text-muted-foreground">
                      Student discovery and networking features coming soon...
                    </p>
                  </div>
                }
              />
              <Route
                path="/research"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Research Areas</h1>
                    <p className="text-muted-foreground">
                      Research area directory and exploration coming soon...
                    </p>
                  </div>
                }
              />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

```

Now let me update the sidebar to show menu items based on user role:


```typescriptreact
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Rss,
  Bell,
  MessageSquare,
  Settings,
  BookOpen,
  UserPlus,
  Search,
  Edit3,
  Shield,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Badge } from "@/shared/components/ui/badge";

// Student navigation items
const studentNavigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Group Formation",
    url: "/group-formation",
    icon: Users,
    badge: null,
  },
  {
    title: "Find Supervisors",
    url: "/supervisors",
    icon: GraduationCap,
    badge: null,
  },
  {
    title: "Supervisor Feed",
    url: "/supervisor-feed",
    icon: Rss,
    badge: "New",
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    badge: "3",
  },
  {
    title: "Collaboration",
    url: "/collaboration",
    icon: MessageSquare,
    badge: null,
  },
];

// Supervisor navigation items
const supervisorNavigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "My Posts",
    url: "/supervisor/posts",
    icon: Edit3,
    badge: null,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    badge: "3",
  },
  {
    title: "Collaboration",
    url: "/collaboration",
    icon: MessageSquare,
    badge: null,
  },
];

// Admin navigation items
const adminNavigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Manage Students",
    url: "/admin/students",
    icon: Users,
    badge: null,
  },
  {
    title: "Manage Supervisors",
    url: "/admin/supervisors",
    icon: GraduationCap,
    badge: null,
  },
  {
    title: "Notifications",
    url: "/admin/notifications",
    icon: Bell,
    badge: "3",
  },
];

const resourceItems = [
  {
    title: "Guidelines",
    url: "/guidelines",
    icon: BookOpen,
  },
  {
    title: "Research Areas",
    url: "/research",
    icon: Search,
  },
];

// Role-specific resource items
const studentResourceItems = [
  ...resourceItems,
  {
    title: "Find Students",
    url: "/students",
    icon: UserPlus,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "w-full justify-start transition-colors";
    return isActive(path)
      ? `${baseClasses} bg-accent text-accent-foreground font-medium`
      : `${baseClasses} hover:bg-accent/50`;
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClasses(item.url)}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge
                              variant={
                                item.badge === "New" ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClasses(item.url)}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

```

Now let me update the rest of the AppSidebar component to use role-based navigation:


```typescriptreact
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Rss,
  Bell,
  MessageSquare,
  Settings,
  BookOpen,
  UserPlus,
  Search,
  Edit3,
  Shield,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Badge } from "@/shared/components/ui/badge";

// Student navigation items
const studentNavigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Group Formation",
    url: "/group-formation",
    icon: Users,
    badge: null,
  },
  {
    title: "Find Supervisors",
    url: "/supervisors",
    icon: GraduationCap,
    badge: null,
  },
  {
    title: "Supervisor Feed",
    url: "/supervisor-feed",
    icon: Rss,
    badge: "New",
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    badge: "3",
  },
  {
    title: "Collaboration",
    url: "/collaboration",
    icon: MessageSquare,
    badge: null,
  },
];

// Supervisor navigation items
const supervisorNavigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "My Posts",
    url: "/supervisor/posts",
    icon: Edit3,
    badge: null,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    badge: "3",
  },
  {
    title: "Collaboration",
    url: "/collaboration",
    icon: MessageSquare,
    badge: null,
  },
];

// Admin navigation items
const adminNavigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Manage Students",
    url: "/admin/students",
    icon: Users,
    badge: null,
  },
  {
    title: "Manage Supervisors",
    url: "/admin/supervisors",
    icon: GraduationCap,
    badge: null,
  },
  {
    title: "Notifications",
    url: "/admin/notifications",
    icon: Bell,
    badge: "3",
  },
];

const resourceItems = [
  {
    title: "Guidelines",
    url: "/guidelines",
    icon: BookOpen,
  },
  {
    title: "Research Areas",
    url: "/research",
    icon: Search,
  },
];

// Role-specific resource items
const studentResourceItems = [
  ...resourceItems,
  {
    title: "Find Students",
    url: "/students",
    icon: UserPlus,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const user = useSelector((state: any) => state.auth.user);
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "w-full justify-start transition-colors";
    return isActive(path)
      ? `${baseClasses} bg-accent text-accent-foreground font-medium`
      : `${baseClasses} hover:bg-accent/50`;
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    switch (user?.role) {
      case "student":
        return studentNavigationItems;
      case "supervisor":
        return supervisorNavigationItems;
      case "admin":
        return adminNavigationItems;
      default:
        return [];
    }
  };

  // Get resource items based on user role
  const getResourceItems = () => {
    switch (user?.role) {
      case "student":
        return studentResourceItems;
      case "supervisor":
      case "admin":
        return resourceItems;
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();
  const resourceItemsForRole = getResourceItems();

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClasses(item.url)}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge
                              variant={
                                item.badge === "New" ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItemsForRole.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={getNavClasses(item.url)}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

```

Now let me add a logout functionality to the header. First, let me check the current header:


Now let me update the header to show user information and add logout functionality:


```typescriptreact
import { Bell, Search, User, LogOut, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Badge } from "@/shared/components/ui/badge";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { BtnLink } from "../components/ui/btn-link";
import { studentRoutes } from "@/core/routes";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center space-x-3">
            <img
              src="logo.png"
              alt="logo"
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-xl font-semibold text-foreground">
              FYP Connect
            </h1>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <BtnLink
            to={studentRoutes.NOTIFICATIONS_ROUTE}
            variant="ghost"
            size="sm"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              3
            </Badge>
          </BtnLink>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Student" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john.doe@university.edu
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

```

```typescriptreact
import { Bell, Search, User, LogOut, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Badge } from "@/shared/components/ui/badge";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { BtnLink } from "../components/ui/btn-link";
import { studentRoutes } from "@/core/routes";
import { useSelector, useDispatch } from "react-redux";
import { authActions } from "@/store/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Header() {
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(authActions.logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getNotificationsRoute = () => {
    switch (user?.role) {
      case "admin":
        return "/admin/notifications";
      default:
        return "/notifications";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center space-x-3">
            <img
              src="logo.png"
              alt="logo"
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-xl font-semibold text-foreground">
              FYP Connect
            </h1>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <BtnLink
            to={getNotificationsRoute()}
            variant="ghost"
            size="sm"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              3
            </Badge>
          </BtnLink>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage 
                    src={user?.profileImg || "/placeholder-avatar.jpg"} 
                    alt={user?.firstName || "User"} 
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user ? getInitials(user.firstName, user.lastName) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user ? `${user.firstName} ${user.lastName}` : "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "user@example.com"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user?.role || "user"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

```

Now let me add authentication persistence and initialization. First, let me create an auth initialization hook:


```typescript
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "@/store/auth";
import authService from "@/core/services/api/auth-service";
import { jwtService } from "@/core/services";

export const useAuthInit = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a stored token
        const storedSession = jwtService.getAuthSession();
        
        if (storedSession?.token && !isLoggedIn) {
          // Try to get user details with the stored token
          const user = await authService.getUserDetailsByToken();
          
          if (user) {
            dispatch(authActions.setAuth({ 
              token: storedSession.token, 
              user 
            }));
          } else {
            // Token is invalid, clear it
            jwtService.clearSession();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear invalid session
        jwtService.clearSession();
      }
    };

    initializeAuth();
  }, [dispatch, isLoggedIn]);
};
```

Now let me update the main App.tsx to use the auth initialization:


```typescriptreact
import { Toaster } from "sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/shared/ui/dashboard.layout";
import Dashboard from "./pages/Dashboard";
import GroupFormation from "./pages/GroupFormation";
import Supervisors from "./pages/Supervisors";
import SupervisorFeed from "./pages/SupervisorFeed";
import Notifications from "./pages/Notifications";
import Collaboration from "./pages/Collaboration";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/auth/login.page";
import { authRoutes, studentRoutes, supervisorRoutes } from "./core/routes";
import SupervisorPosts from "./pages/SupervisorPosts";
import AdminNotifications from "./pages/AdminNotifications";
import { ForgotPasswordPage } from "./pages/auth/forgot-password.page";
import ProtectedRoute from "@/shared/components/protected-route";
import { useAuthInit } from "@/shared/hooks/use-auth-init";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Auth routes - no protection needed */}
            <Route path={authRoutes.LOGIN_ROUTE} element={<LoginPage />} />
            <Route
              path={authRoutes.FORGOT_PASSWORD_ROUTE}
              element={<ForgotPasswordPage />}
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              {/* Student-only routes */}
              <Route
                path={studentRoutes.CREATE_GROUP_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <GroupFormation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisors"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Supervisors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisor-feed"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SupervisorFeed />
                  </ProtectedRoute>
                }
              />
              
              {/* Supervisor-only routes */}
              <Route
                path={supervisorRoutes.SUP_POSTS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["supervisor"]}>
                    <SupervisorPosts />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin-only routes */}
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />
              
              {/* Common routes for all authenticated users */}
              <Route
                path={studentRoutes.NOTIFICATIONS_ROUTE}
                element={<Notifications />}
              />
              <Route path="/collaboration" element={<Collaboration />} />
              
              {/* Resource pages */}
              <Route
                path="/guidelines"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">FYP Guidelines</h1>
                    <p className="text-muted-foreground">
                      Project guidelines and requirements will be displayed
                      here...
                    </p>
                  </div>
                }
              />
              <Route
                path="/students"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Find Students</h1>
                    <p className="text-muted-foreground">
                      Student discovery and networking features coming soon...
                    </p>
                  </div>
                }
              />
              <Route
                path="/research"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Research Areas</h1>
                    <p className="text-muted-foreground">
                      Research area directory and exploration coming soon...
                    </p>
                  </div>
                }
              />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

```

```typescriptreact
import { Toaster } from "sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/shared/ui/dashboard.layout";
import Dashboard from "./pages/Dashboard";
import GroupFormation from "./pages/GroupFormation";
import Supervisors from "./pages/Supervisors";
import SupervisorFeed from "./pages/SupervisorFeed";
import Notifications from "./pages/Notifications";
import Collaboration from "./pages/Collaboration";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/auth/login.page";
import { authRoutes, studentRoutes, supervisorRoutes } from "./core/routes";
import SupervisorPosts from "./pages/SupervisorPosts";
import AdminNotifications from "./pages/AdminNotifications";
import { ForgotPasswordPage } from "./pages/auth/forgot-password.page";
import ProtectedRoute from "@/shared/components/protected-route";
import { useAuthInit } from "@/shared/hooks/use-auth-init";

const queryClient = new QueryClient();

const App = () => {
  // Initialize authentication
  useAuthInit();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Auth routes - no protection needed */}
            <Route path={authRoutes.LOGIN_ROUTE} element={<LoginPage />} />
            <Route
              path={authRoutes.FORGOT_PASSWORD_ROUTE}
              element={<ForgotPasswordPage />}
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              {/* Student-only routes */}
              <Route
                path={studentRoutes.CREATE_GROUP_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <GroupFormation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisors"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Supervisors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisor-feed"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SupervisorFeed />
                  </ProtectedRoute>
                }
              />
              
              {/* Supervisor-only routes */}
              <Route
                path={supervisorRoutes.SUP_POSTS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["supervisor"]}>
                    <SupervisorPosts />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin-only routes */}
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />
              
              {/* Common routes for all authenticated users */}
              <Route
                path={studentRoutes.NOTIFICATIONS_ROUTE}
                element={<Notifications />}
              />
              <Route path="/collaboration" element={<Collaboration />} />
              
              {/* Resource pages */}
              <Route
                path="/guidelines"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">FYP Guidelines</h1>
                    <p className="text-muted-foreground">
                      Project guidelines and requirements will be displayed
                      here...
                    </p>
                  </div>
                }
              />
              <Route
                path="/students"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Find Students</h1>
                    <p className="text-muted-foreground">
                      Student discovery and networking features coming soon...
                    </p>
                  </div>
                }
              />
              <Route
                path="/research"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Research Areas</h1>
                    <p className="text-muted-foreground">
                      Research area directory and exploration coming soon...
                    </p>
                  </div>
                }
              />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

```

Now let me check if we need to create a signup form as well. Let me check if there's already one:


Let me create a signup form for completeness. First, let me create the signup hook:


```typescript
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import authService from "@/core/services/api/auth-service";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { authActions } from "@/store/auth";
import { useNavigate } from "react-router-dom";

const signupFormSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required." })
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string({ required_error: "Last name is required." })
    .min(2, "Last name must be at least 2 characters"),
  email: z
    .string({ required_error: "Email is required." })
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required." })
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string({ required_error: "Please confirm your password." }),
  role: z.enum(["student", "supervisor", "admin"], {
    required_error: "Please select a role.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

const useSignupForm = () => {
  const form = useForm({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student" as const,
    },
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const { confirmPassword, ...signupData } = data;
      const res = await authService.signup(signupData);
      
      if (res.success && res.data) {
        const { token } = res.data;
        
        toast.success(res.msg || "Account created successfully!");
        
        // For signup, we need to get user details after getting the token
        const userDetails = await authService.getUserDetailsByToken();
        
        if (userDetails) {
          dispatch(authActions.setAuth({ token, user: userDetails }));
          
          // Navigate based on user role
          switch (userDetails.role) {
            case "student":
              navigate("/");
              break;
            case "supervisor":
              navigate("/");
              break;
            case "admin":
              navigate("/");
              break;
            default:
              navigate("/");
          }
        }
        
        return;
      }
      
      toast.error(res.msg || "Signup failed");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred during signup");
    }
  };

  return { form, onSubmit };
};

export default useSignupForm;
```

Now let me create the signup form component:


```typescriptreact
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { Mail, Lock, User, UserCheck } from "lucide-react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import useSignupForm from "../hooks/use-signup-form";
import { authRoutes } from "@/core/routes";

const SignupForm = () => {
  const { form, onSubmit } = useSignupForm();

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 lg:hidden">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FYP CONNECT
            </h1>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-600">
              Sign up to join FYP Connect
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                              <Input
                                {...field}
                                placeholder="John"
                                className="pl-10 h-12"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                              <Input
                                {...field}
                                placeholder="Doe"
                                className="pl-10 h-12"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="john.doe@university.edu"
                              className="pl-10 h-12"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          Role
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <div className="relative">
                              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                              <SelectTrigger className="pl-10 h-12">
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter your password"
                                className="pl-10 h-12"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="Confirm your password"
                              className="pl-10 h-12"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to={authRoutes.LOGIN_ROUTE}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupForm;
```

Now let me create the signup page:


```typescriptreact
import React from "react";
import DoubleColumnLayout from "@/shared/components/ui/double-column-layout";
import SignupForm from "@/features/auth/components/signup.form";

export const SignupPage: React.FC = () => {
  return (
    <DoubleColumnLayout>
      <SignupForm />
    </DoubleColumnLayout>
  );
};
```

Now let me add the signup route to the routes file and App.tsx. First, let me check the routes:


```typescript
export const LOGIN_ROUTE = "/login";
export const SIGNUP_ROUTE = "/signup";
export const FORGOT_PASSWORD_ROUTE = "/forgot-password";

```

Now let me add the signup route to App.tsx:


```typescriptreact
import { Toaster } from "sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/shared/ui/dashboard.layout";
import Dashboard from "./pages/Dashboard";
import GroupFormation from "./pages/GroupFormation";
import Supervisors from "./pages/Supervisors";
import SupervisorFeed from "./pages/SupervisorFeed";
import Notifications from "./pages/Notifications";
import Collaboration from "./pages/Collaboration";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/auth/login.page";
import { SignupPage } from "./pages/auth/signup.page";
import { authRoutes, studentRoutes, supervisorRoutes } from "./core/routes";
import SupervisorPosts from "./pages/SupervisorPosts";
import AdminNotifications from "./pages/AdminNotifications";
import { ForgotPasswordPage } from "./pages/auth/forgot-password.page";
import ProtectedRoute from "@/shared/components/protected-route";
import { useAuthInit } from "@/shared/hooks/use-auth-init";

const queryClient = new QueryClient();

const App = () => {
  // Initialize authentication
  useAuthInit();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Auth routes - no protection needed */}
            <Route path={authRoutes.LOGIN_ROUTE} element={<LoginPage />} />
            <Route
              path={authRoutes.FORGOT_PASSWORD_ROUTE}
              element={<ForgotPasswordPage />}
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              {/* Student-only routes */}
              <Route
                path={studentRoutes.CREATE_GROUP_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <GroupFormation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisors"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Supervisors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisor-feed"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SupervisorFeed />
                  </ProtectedRoute>
                }
              />
              
              {/* Supervisor-only routes */}
              <Route
                path={supervisorRoutes.SUP_POSTS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["supervisor"]}>
                    <SupervisorPosts />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin-only routes */}
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />
              
              {/* Common routes for all authenticated users */}
              <Route
                path={studentRoutes.NOTIFICATIONS_ROUTE}
                element={<Notifications />}
              />
              <Route path="/collaboration" element={<Collaboration />} />
              
              {/* Resource pages */}
              <Route
                path="/guidelines"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">FYP Guidelines</h1>
                    <p className="text-muted-foreground">
                      Project guidelines and requirements will be displayed
                      here...
                    </p>
                  </div>
                }
              />
              <Route
                path="/students"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Find Students</h1>
                    <p className="text-muted-foreground">
                      Student discovery and networking features coming soon...
                    </p>
                  </div>
                }
              />
              <Route
                path="/research"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Research Areas</h1>
                    <p className="text-muted-foreground">
                      Research area directory and exploration coming soon...
                    </p>
                  </div>
                }
              />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

```

```typescriptreact
import { Toaster } from "sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/shared/ui/dashboard.layout";
import Dashboard from "./pages/Dashboard";
import GroupFormation from "./pages/GroupFormation";
import Supervisors from "./pages/Supervisors";
import SupervisorFeed from "./pages/SupervisorFeed";
import Notifications from "./pages/Notifications";
import Collaboration from "./pages/Collaboration";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/auth/login.page";
import { SignupPage } from "./pages/auth/signup.page";
import { authRoutes, studentRoutes, supervisorRoutes } from "./core/routes";
import SupervisorPosts from "./pages/SupervisorPosts";
import AdminNotifications from "./pages/AdminNotifications";
import { ForgotPasswordPage } from "./pages/auth/forgot-password.page";
import ProtectedRoute from "@/shared/components/protected-route";
import { useAuthInit } from "@/shared/hooks/use-auth-init";

const queryClient = new QueryClient();

const App = () => {
  // Initialize authentication
  useAuthInit();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Auth routes - no protection needed */}
            <Route path={authRoutes.LOGIN_ROUTE} element={<LoginPage />} />
            <Route path={authRoutes.SIGNUP_ROUTE} element={<SignupPage />} />
            <Route
              path={authRoutes.FORGOT_PASSWORD_ROUTE}
              element={<ForgotPasswordPage />}
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              {/* Student-only routes */}
              <Route
                path={studentRoutes.CREATE_GROUP_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <GroupFormation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisors"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Supervisors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisor-feed"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SupervisorFeed />
                  </ProtectedRoute>
                }
              />
              
              {/* Supervisor-only routes */}
              <Route
                path={supervisorRoutes.SUP_POSTS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["supervisor"]}>
                    <SupervisorPosts />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin-only routes */}
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />
              
              {/* Common routes for all authenticated users */}
              <Route
                path={studentRoutes.NOTIFICATIONS_ROUTE}
                element={<Notifications />}
              />
              <Route path="/collaboration" element={<Collaboration />} />
              
              {/* Resource pages */}
              <Route
                path="/guidelines"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">FYP Guidelines</h1>
                    <p className="text-muted-foreground">
                      Project guidelines and requirements will be displayed
                      here...
                    </p>
                  </div>
                }
              />
              <Route
                path="/students"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Find Students</h1>
                    <p className="text-muted-foreground">
                      Student discovery and networking features coming soon...
                    </p>
                  </div>
                }
              />
              <Route
                path="/research"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Research Areas</h1>
                    <p className="text-muted-foreground">
                      Research area directory and exploration coming soon...
                    </p>
                  </div>
                }
              />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

```

Now let me add a link to signup in the login form:


```typescriptreact
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";
import { Car, Shield, Mail, Lock } from "lucide-react";
import DoubleColumnLayout from "@/shared/components/ui/double-column-layout";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import useLoginForm from "../hooks/use-login-form";
import { authRoutes } from "@/core/routes";

const LoginForm = () => {
  const { form, onSubmit } = useLoginForm();

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 lg:hidden">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FYP CONNECT
            </h1>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 h-12"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter your password"
                                className="pl-10 h-12"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Link
                        to={authRoutes.FORGOT_PASSWORD_ROUTE}
                        className="mt-1 text-red-600 hover:underline font-medium text-xs"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;

```

Now let me check for any linting errors in the files I've modified:


I need to fix the type issues in the auth service. Let me check the http types first:


Now I understand the issue. The HTTP service returns `IHttpResponse<T>` but I need to return the data directly. Let me fix the auth service:


```typescript
import { IUser } from "@/core/types/user";
import BaseService from "./base-service";
import jwtService from "../local/jwt-service";

interface LoginResponse {
  success: boolean;
  msg: string;
  data: {
    token: string;
    user: IUser;
  };
}

interface SignupResponse {
  success: boolean;
  msg: string;
  data: {
    token: string;
  };
}

interface UserDetailsResponse {
  success: boolean;
  msg: string;
  data: {
    user: IUser;
  };
}

class AuthService extends BaseService {
  async login(payload: { email: string; password: string }): Promise<LoginResponse> {
    const res = await this.httpService.post<LoginResponse>("/auth/login", payload);
    return res;
  }

  async signup(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "student" | "supervisor" | "admin";
    profileImg?: string;
  }): Promise<SignupResponse> {
    const res = await this.httpService.post<SignupResponse>("/auth/signup", payload);
    return res;
  }

  async continueWithGoogle(payload: { access_token: string }): Promise<LoginResponse> {
    const res = await this.httpService.post<LoginResponse>("/auth/google", payload);
    return res;
  }

  async getUserDetailsByToken(): Promise<IUser | null> {
    const res = await this.httpService.get<UserDetailsResponse>("/auth/me");

    if (res.success && res.data) {
      return res.data.user;
    }

    return null;
  }

  async refreshToken(): Promise<LoginResponse> {
    const res = await this.httpService.post<LoginResponse>("/auth/refresh");
    return res;
  }

  async sendResetPassOTP() {
    const res = await this.httpService.get<any>("/auth/send-otp");
    return res;
  }

  async verifyOtp(payload: any) {
    const res = await this.httpService.post<any>("/auth/verify-otp", payload);
    return res;
  }

  async resetPassword(payload: any) {
    const res = await this.httpService.post<any>(
      "/auth/reset-password",
      payload
    );
    return res;
  }
}

const authService = new AuthService();

export default authService;

```

The issue is that the HTTP service returns `IHttpResponse<T>` but I'm trying to return `T` directly. Let me check the base service to understand how it works:


Let me check the HTTP service:


I see the issue. The HTTP service returns `IHttpResponse<T>` but the auth service is trying to return `T` directly. I need to fix the auth service to properly handle the response structure. Let me update it:


```typescript
import { IUser } from "@/core/types/user";
import { IHttpResponse } from "@/core/types";
import BaseService from "./base-service";
import jwtService from "../local/jwt-service";

interface LoginData {
  token: string;
  user: IUser;
}

interface SignupData {
  token: string;
}

interface UserDetailsData {
  user: IUser;
}

class AuthService extends BaseService {
  async login(payload: { email: string; password: string }): Promise<IHttpResponse<LoginData>> {
    const res = await this.httpService.post<LoginData>("/auth/login", payload);
    return res;
  }

  async signup(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "student" | "supervisor" | "admin";
    profileImg?: string;
  }): Promise<IHttpResponse<SignupData>> {
    const res = await this.httpService.post<SignupData>("/auth/signup", payload);
    return res;
  }

  async continueWithGoogle(payload: { access_token: string }): Promise<IHttpResponse<LoginData>> {
    const res = await this.httpService.post<LoginData>("/auth/google", payload);
    return res;
  }

  async getUserDetailsByToken(): Promise<IUser | null> {
    const res = await this.httpService.get<UserDetailsData>("/auth/me");

    if (res.success && res.data) {
      return res.data.user;
    }

    return null;
  }

  async refreshToken(): Promise<IHttpResponse<LoginData>> {
    const res = await this.httpService.post<LoginData>("/auth/refresh");
    return res;
  }

  async sendResetPassOTP() {
    const res = await this.httpService.get<any>("/auth/send-otp");
    return res;
  }

  async verifyOtp(payload: any) {
    const res = await this.httpService.post<any>("/auth/verify-otp", payload);
    return res;
  }

  async resetPassword(payload: any) {
    const res = await this.httpService.post<any>(
      "/auth/reset-password",
      payload
    );
    return res;
  }
}

const authService = new AuthService();

export default authService;

```

Now let me check the linting errors again:


Great! Now let me check the other files:


Perfect! Let me update the TODO list and complete the integration:


Now let me create a simple test to verify the authentication flow works. Let me create a test user in the backend and test the login flow:


---

**User**

Now create mongoose models of "Student" and "Supervisor" to keep track separately.
On initial login (First login) of Student, student must have to Select his department, completed credit hours, skills and interests. Student can't navigate to other pages unless these are not set. Also give option in hamburger menu so student can update later also.

Similarly on initial login (First login) of Supervisor, supervisor must have to set his description, Select his department, level (like dean etc), skills and interests. Supervisor can't navigate to other pages unless these are not set. Also give option in hamburger menu so supervisor can update later also.



