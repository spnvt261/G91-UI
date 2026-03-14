import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserModel } from "../models/auth/auth.model";

export interface AuthState {
  accessToken: string | null;
  user: UserModel | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; user: UserModel }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    setUser: (state, action: PayloadAction<UserModel | null>) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload && state.accessToken);
    },
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
