import jwtService from "@/core/services/local/jwt-service";
import { IAuthUser } from "@/core/types";
import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isLoggedIn: boolean;
  user: IAuthUser | null;
  token: string;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  token: "",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      const { token, user } = action.payload;

      state.isLoggedIn = true;
      state.token = token;
      state.user = user || null;

      jwtService.setAuthSession({ token });
    },

    setUser(state, action) {
      const { user } = action.payload;

      state.user = user;
    },

    updateToken(state, action) {
      const { token } = action.payload;
      state.token = token;
      jwtService.setAuthSession({ token });
    },

    logout(state) {
      state.isLoggedIn = false;
      state.token = "";
      state.user = null;

      jwtService.clearSession();
    },
  },
});

export const { setAuth, setUser, updateToken, logout } = authSlice.actions;
