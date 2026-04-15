import api from "../../apiConfig/axiosConfig";
import { API } from "../../api/URL_const";
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationCodeRequest,
  ResendVerificationCodeResponse,
  ResetPasswordRequest,
  ResetPasswordTokenValidationResponse,
  UpdateProfileRequest,
  UserProfileModel,
  VerifyRegistrationRequest,
  VerifyRegistrationResponse,
} from "../../models/auth/auth.model";

export const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(API.AUTH.LOGIN, request);
    return response.data;
  },

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>(API.AUTH.REGISTER, request);
    return response.data;
  },

  async verifyRegistration(request: VerifyRegistrationRequest): Promise<VerifyRegistrationResponse> {
    const response = await api.post<VerifyRegistrationResponse>(API.AUTH.VERIFY_REGISTRATION, request);
    return response.data;
  },

  async resendVerificationCode(request: ResendVerificationCodeRequest): Promise<ResendVerificationCodeResponse> {
    const response = await api.post<ResendVerificationCodeResponse>(API.AUTH.RESEND_VERIFICATION_CODE, request);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post<void>(API.AUTH.LOGOUT);
  },

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await api.post<void>(API.AUTH.CHANGE_PASSWORD, request);
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await api.post<void>(API.AUTH.FORGOT_PASSWORD, request);
  },

  async validateResetPasswordToken(token: string): Promise<ResetPasswordTokenValidationResponse> {
    const response = await api.get<ResetPasswordTokenValidationResponse>(API.AUTH.RESET_PASSWORD_VALIDATE, {
      params: { token },
    });
    return response.data;
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await api.post<void>(API.AUTH.RESET_PASSWORD, request);
  },

  async getProfile(): Promise<UserProfileModel> {
    const response = await api.get<UserProfileModel>(API.USER.ME);
    return response.data;
  },

  async updateProfile(request: UpdateProfileRequest): Promise<UserProfileModel> {
    const response = await api.put<UserProfileModel>(API.USER.ME, request);
    return response.data;
  },
};
