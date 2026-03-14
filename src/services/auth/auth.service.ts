import api from "../../apiConfig/axiosConfig";
import { API } from "../../api/URL_const";
import type { ApiResponse } from "../../models/common/api.model";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UserProfileModel,
} from "../../models/auth/auth.model";

const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>(API.AUTH.LOGIN, request);
    return unwrap(response);
  },

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<ApiResponse<RegisterResponse>>(API.AUTH.REGISTER, request);
    return unwrap(response);
  },

  async logout(): Promise<void> {
    await api.post<ApiResponse<null>>(API.AUTH.LOGOUT);
  },

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await api.post<ApiResponse<null>>(API.AUTH.CHANGE_PASSWORD, request);
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await api.post<ApiResponse<null>>(API.AUTH.FORGOT_PASSWORD, request);
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await api.post<ApiResponse<null>>(API.AUTH.RESET_PASSWORD, request);
  },

  async getProfile(): Promise<UserProfileModel> {
    const response = await api.get<ApiResponse<UserProfileModel>>(API.USER.ME);
    return unwrap(response);
  },

  async updateProfile(request: UpdateProfileRequest): Promise<UserProfileModel> {
    const response = await api.put<ApiResponse<UserProfileModel>>(API.USER.ME, request);
    return unwrap(response);
  },
};
