import BaseService from "./base-service";

class NotificationService extends BaseService {
  async listMine() {
    return this.httpService.get<any>("/notification/me");
  }

  async markRead(id: string) {
    return this.httpService.post<any>(`/notification/${id}/read`);
  }

  async send(payload: { audience: "student" | "supervisor" | "both" | "specific"; recipientIds?: string[]; title: string; message: string; meta?: any }) {
    return this.httpService.post<any>("/notification/send", payload);
  }

  async markAllRead() {
    return this.httpService.post<any>("/notification/mark-all/read");
  }
}

const notificationService = new NotificationService();
export default notificationService;


