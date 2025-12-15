import { IHttpResponse } from "@/core/types";
import BaseService from "./base-service";

export interface IGroup {
  _id: string;
  name: string;
  description: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  members: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  supervisor?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isFormed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IInvitation {
  _id: string;
  group: string | IGroup;
  sender: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  receiver: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
  updatedAt: string;
}

export interface IStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImg?: string;
  department?: string;
  completedCreditHours?: number;
  skills: string[];
  interests: string[];
}

interface CreateGroupResponse {
  group: IGroup;
  invitations: IInvitation[];
}

interface GetMyGroupResponse {
  group: IGroup | null;
  invitations: IInvitation[];
}

interface SearchStudentsResponse {
  students: IStudent[];
}

interface RespondToInvitationResponse {
  invitation: IInvitation;
  canRecreateGroup: boolean;
}

class StudentGroupService extends BaseService {
  async createGroup(data: {
    name: string;
    description: string;
    invitedStudentIds: string[];
  }): Promise<IHttpResponse<CreateGroupResponse>> {
    const res = await this.httpService.post<CreateGroupResponse>(
      "/student/group",
      data
    );
    return res;
  }

  async getMyGroup(): Promise<IHttpResponse<GetMyGroupResponse>> {
    const res = await this.httpService.get<GetMyGroupResponse>(
      "/student/group"
    );
    return res;
  }

  async searchStudents(filters: {
    department?: string;
    minCreditHours?: number;
    maxCreditHours?: number;
    skills?: string[];
    interests?: string[];
    search?: string;
  }): Promise<IHttpResponse<SearchStudentsResponse>> {
    const queryParams = new URLSearchParams();
    if (filters.department) queryParams.append("department", filters.department);
    if (filters.minCreditHours !== undefined)
      queryParams.append("minCreditHours", filters.minCreditHours.toString());
    if (filters.maxCreditHours !== undefined)
      queryParams.append("maxCreditHours", filters.maxCreditHours.toString());
    if (filters.skills && filters.skills.length > 0)
      queryParams.append("skills", filters.skills.join(","));
    if (filters.interests && filters.interests.length > 0)
      queryParams.append("interests", filters.interests.join(","));
    if (filters.search) queryParams.append("search", filters.search);

    const res = await this.httpService.get<SearchStudentsResponse>(
      `/student/students/search?${queryParams.toString()}`
    );
    return res;
  }

  async respondToInvitation(
    invitationId: string,
    response: "accepted" | "rejected"
  ): Promise<IHttpResponse<RespondToInvitationResponse>> {
    const res = await this.httpService.post<RespondToInvitationResponse>(
      `/student/invitation/${invitationId}/respond`,
      { response }
    );
    return res;
  }

  async deleteGroup(groupId: string): Promise<IHttpResponse<void>> {
    const res = await this.httpService.delete<void>(
      `/student/group/${groupId}`
    );
    return res;
  }

  async getReceivedInvitations(): Promise<IHttpResponse<{ invitations: IInvitation[] }>> {
    const res = await this.httpService.get<{ invitations: IInvitation[] }>(
      "/student/invitations/received"
    );
    return res;
  }
}

const studentGroupService = new StudentGroupService();

export default studentGroupService;

