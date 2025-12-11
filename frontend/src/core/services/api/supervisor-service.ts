import { IHttpResponse } from "@/core/types";
import BaseService from "./base-service";

export interface ISupervisorProfile {
  userId: string;
  description?: string;
  department?: string;
  level?:
    | "professor"
    | "associate_professor"
    | "assistant_professor"
    | "dean"
    | "head_of_department"
    | "lecturer"
    | "other";
  skills: string[];
  interests: string[];
  profileCompleted: boolean;
}

interface SupervisorProfileResponse {
  supervisor: ISupervisorProfile;
}

interface ProfileCompleteResponse {
  profileCompleted: boolean;
}

class SupervisorService extends BaseService {
  async getProfile(): Promise<IHttpResponse<ISupervisorProfile>> {
    const res = await this.httpService.get<ISupervisorProfile>(
      "/supervisor/profile"
    );
    return res;
  }

  async updateProfile(data: {
    description?: string;
    department?: string;
    level?: string;
    skills?: string[];
    interests?: string[];
  }): Promise<IHttpResponse<ISupervisorProfile>> {
    const res = await this.httpService.put<ISupervisorProfile>(
      "/supervisor/profile",
      data
    );
    return res;
  }

  async checkProfileComplete(): Promise<
    IHttpResponse<ProfileCompleteResponse>
  > {
    const res = await this.httpService.get<ProfileCompleteResponse>(
      "/supervisor/profile/complete"
    );
    return res;
  }
}

const supervisorService = new SupervisorService();

export default supervisorService;
