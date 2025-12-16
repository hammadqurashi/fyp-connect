import BaseService from "./base-service";

export interface Supervisor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  title?: string;
  description?: string;
  researchInterests: string[];
  tools: string[];
  matchPercentage: number;
  isAssigned: boolean;
  requestStatus: "pending" | "accepted" | "rejected" | null;
  hasReachedMax: boolean;
  currentGroups: number;
  maxGroups: number;
}

export interface SupervisorProfile extends Supervisor {
  firstName: string;
  lastName: string;
  level?: string;
  skills: string[];
  interests: string[];
}

class StudentSupervisorService extends BaseService {
  async getAllSupervisors(): Promise<any> {
    return this.httpService.get<{ supervisors: Supervisor[] }>(
      "/student/supervisors"
    );
  }

  async getSupervisorProfile(supervisorId: string): Promise<any> {
    return this.httpService.get<{ supervisor: SupervisorProfile }>(
      `/student/supervisors/${supervisorId}`
    );
  }

  async requestSupervision(supervisorId: string): Promise<any> {
    return this.httpService.post<any>("/student/supervisors/request", {
      supervisorId,
    });
  }

  async cancelRequest(supervisorId: string): Promise<any> {
    return this.httpService.post<any>("/student/supervisors/cancel-request", {
      supervisorId,
    });
  }
}

const studentSupervisorService = new StudentSupervisorService();

export default studentSupervisorService;
