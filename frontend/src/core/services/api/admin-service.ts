import { IHttpResponse } from "@/core/types";
import BaseService from "./base-service";

class AdminService extends BaseService {
  // Dashboard
  async getDashboardData(): Promise<IHttpResponse<any>> {
    const res = await this.httpService.get<any>("/admin/dashboard");
    return res;
  }

  // Student management
  async getAllStudents(query?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<IHttpResponse<{ students: any[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    const res = await this.httpService.get<{ students: any[]; pagination: any }>(
      `/admin/students?${params.toString()}`
    );
    return res;
  }

  async getStudentById(
    studentId: string
  ): Promise<IHttpResponse<{ student: any }>> {
    const res = await this.httpService.get<{ student: any }>(
      `/admin/students/${studentId}`
    );
    return res;
  }

  async createStudent(data: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    department?: string;
    completedCreditHours?: number;
    skills?: string[];
    interests?: string[];
  }): Promise<IHttpResponse<any>> {
    const res = await this.httpService.post<any>("/admin/students", data);
    return res;
  }

  async updateStudent(
    studentId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      department?: string;
      completedCreditHours?: number;
      skills?: string[];
      interests?: string[];
    }
  ): Promise<IHttpResponse<any>> {
    const res = await this.httpService.put<any>(
      `/admin/students/${studentId}`,
      data
    );
    return res;
  }

  async toggleStudentStatus(
    studentId: string,
    isActive: boolean
  ): Promise<IHttpResponse<{ isActive: boolean }>> {
    const res = await this.httpService.patch<{ isActive: boolean }>(
      `/admin/students/${studentId}/status`,
      { isActive }
    );
    return res;
  }

  async deleteStudent(studentId: string): Promise<IHttpResponse<any>> {
    const res = await this.httpService.delete<any>(
      `/admin/students/${studentId}`
    );
    return res;
  }

  // Supervisor management
  async getAllSupervisors(query?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<IHttpResponse<{ supervisors: any[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    const res = await this.httpService.get<{
      supervisors: any[];
      pagination: any;
    }>(`/admin/supervisors?${params.toString()}`);
    return res;
  }

  async getSupervisorById(
    supervisorId: string
  ): Promise<IHttpResponse<{ supervisor: any }>> {
    const res = await this.httpService.get<{ supervisor: any }>(
      `/admin/supervisors/${supervisorId}`
    );
    return res;
  }

  async createSupervisor(data: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    description?: string;
    department?: string;
    level?: string;
    skills?: string[];
    interests?: string[];
  }): Promise<IHttpResponse<any>> {
    const res = await this.httpService.post<any>("/admin/supervisors", data);
    return res;
  }

  async updateSupervisor(
    supervisorId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      description?: string;
      department?: string;
      level?: string;
      skills?: string[];
      interests?: string[];
    }
  ): Promise<IHttpResponse<any>> {
    const res = await this.httpService.put<any>(
      `/admin/supervisors/${supervisorId}`,
      data
    );
    return res;
  }

  async toggleSupervisorStatus(
    supervisorId: string,
    isActive: boolean
  ): Promise<IHttpResponse<{ isActive: boolean }>> {
    const res = await this.httpService.patch<{ isActive: boolean }>(
      `/admin/supervisors/${supervisorId}/status`,
      { isActive }
    );
    return res;
  }

  async deleteSupervisor(supervisorId: string): Promise<IHttpResponse<any>> {
    const res = await this.httpService.delete<any>(
      `/admin/supervisors/${supervisorId}`
    );
    return res;
  }
}

const adminService = new AdminService();

export default adminService;

