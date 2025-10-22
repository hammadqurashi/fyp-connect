import BaseService from "./base-service";

class SupervisorService extends BaseService {
  async listPosts() {
    return this.httpService.get<any>("/supervisor/posts");
  }

  async createPost(payload: { title: string; content: string; tags?: string[]; projectType?: string }) {
    return this.httpService.post<any>("/supervisor/posts", payload);
  }

  async requestSupervision(payload: { supervisorId: string }) {
    return this.httpService.post<any>("/supervisor/requests", payload);
  }

  async respondRequest(requestId: string, response: "accepted" | "rejected") {
    return this.httpService.post<any>(`/supervisor/requests/${requestId}/respond`, { response });
  }
}

const supervisorService = new SupervisorService();
export default supervisorService;


