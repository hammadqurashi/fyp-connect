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

  // Post methods
  async getAllPosts(query?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<IHttpResponse<{ posts: any[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);
    const res = await this.httpService.get<{ posts: any[]; pagination: any }>(
      `/student/posts?${params.toString()}`
    );
    return res;
  }

  async toggleLike(postId: string): Promise<IHttpResponse<{ isLiked: boolean; likesCount: number }>> {
    const res = await this.httpService.post<{ isLiked: boolean; likesCount: number }>(
      `/student/posts/${postId}/like`
    );
    return res;
  }

  async getComments(
    postId: string,
    query?: { page?: number; limit?: number }
  ): Promise<IHttpResponse<{ comments: any[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    const res = await this.httpService.get<{ comments: any[]; pagination: any }>(
      `/student/posts/${postId}/comments?${params.toString()}`
    );
    return res;
  }

  async addComment(
    postId: string,
    content: string
  ): Promise<IHttpResponse<{ comment: any; commentsCount: number }>> {
    const res = await this.httpService.post<{ comment: any; commentsCount: number }>(
      `/student/posts/${postId}/comments`,
      { content }
    );
    return res;
  }

  async deleteComment(commentId: string): Promise<IHttpResponse<{ commentsCount: number }>> {
    const res = await this.httpService.delete<{ commentsCount: number }>(
      `/student/posts/comments/${commentId}`
    );
    return res;
  }
}

const studentService = new StudentService();

export default studentService;
