import { IHttpResponse } from "@/core/types";
import BaseService from "./base-service";

export interface IStudentProfile {
  userId: string;
  department?: string;
  completedCreditHours?: number;
  skills: string[];
  interests: string[];
  profileCompleted: boolean;
}

interface ProfileCompleteResponse {
  profileCompleted: boolean;
}

class StudentService extends BaseService {
  async getProfile(): Promise<IHttpResponse<IStudentProfile>> {
    const res = await this.httpService.get<IStudentProfile>("/student/profile");
    return res;
  }

  async updateProfile(data: {
    department?: string;
    completedCreditHours?: number;
    skills?: string[];
    interests?: string[];
  }): Promise<IHttpResponse<IStudentProfile>> {
    const res = await this.httpService.put<IStudentProfile>(
      "/student/profile",
      data
    );
    return res;
  }

  async checkProfileComplete(): Promise<
    IHttpResponse<ProfileCompleteResponse>
  > {
    const res = await this.httpService.get<ProfileCompleteResponse>(
      "/student/profile/complete"
    );
    return res;
  }
}

const studentService = new StudentService();

export default studentService;
