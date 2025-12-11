export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImg: string | null;
  role: "student" | "supervisor" | "admin";
}

export interface IAuthUser extends IUser {}

export interface IAuthSession {
  token: string;
}


