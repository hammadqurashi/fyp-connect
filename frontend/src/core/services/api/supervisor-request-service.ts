import BaseService from "./base-service";

export interface GroupMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  completedCreditHours?: number;
  skills?: string[];
  interests?: string[];
}

export interface SupervisionRequest {
  _id: string;
  group: {
    _id: string;
    name: string;
    description?: string;
    createdAt?: string;
    createdBy: GroupMember & {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    members: GroupMember[];
  };
  supervisor: string;
  requestedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

class SupervisorRequestService extends BaseService {
  async getSupervisionRequests(): Promise<any> {
    return this.httpService.get<{ requests: SupervisionRequest[] }>(
      "/supervisor/requests"
    );
  }

  async respondToRequest(
    requestId: string,
    response: "accepted" | "rejected"
  ): Promise<any> {
    return this.httpService.post<any>(
      `/supervisor/requests/${requestId}/respond`,
      { response }
    );
  }
}

const supervisorRequestService = new SupervisorRequestService();

export default supervisorRequestService;
