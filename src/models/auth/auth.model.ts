export type UserRole = "GUEST" | "CUSTOMER" | "ACCOUNTANT" | "WAREHOUSE" | "OWNER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED" | "PENDING_VERIFICATION";

export interface UserModel {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface UserProfileModel extends UserModel {
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: UserModel;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  verificationRequired: boolean;
  expireMinutes: number;
  redirectTo: string;
}

export interface VerifyRegistrationRequest {
  email: string;
  verificationCode: string;
}

export interface VerifyRegistrationResponse {
  userId: string;
  email: string;
  status: UserStatus;
  verified: boolean;
  redirectTo: string;
}

export interface ResendVerificationCodeRequest {
  email: string;
}

export interface ResendVerificationCodeResponse {
  userId: string;
  email: string;
  expireMinutes: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResetPasswordTokenValidationResponse {
  valid: boolean;
  expiredAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone?: string;
  address?: string;
}
