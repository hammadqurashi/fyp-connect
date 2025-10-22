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
  user: IUser;
}

interface UserDetailsData {
  user: IUser;
}

class AuthService extends BaseService {
  async login(payload: {
    email: string;
    password: string;
  }): Promise<IHttpResponse<LoginData>> {
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
    const res = await this.httpService.post<SignupData>(
      "/auth/signup",
      payload
    );
    return res;
  }

  async continueWithGoogle(payload: {
    access_token: string;
  }): Promise<IHttpResponse<LoginData>> {
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
