import BaseService from "./base-service";

class GroupService extends BaseService {
  async createGroup(payload: { name: string; description?: string }) {
    return this.httpService.post<any>("/group", payload);
  }

  async sendInvitations(groupId: string, receivers: string[]) {
    return this.httpService.post<any>(`/group/${groupId}/invitations`, { receivers });
  }

  async respondInvitation(invitationId: string, response: "accepted" | "rejected") {
    return this.httpService.post<any>(`/group/invitations/${invitationId}/respond`, { response });
  }
}

const groupService = new GroupService();
export default groupService;



