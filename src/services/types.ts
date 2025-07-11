// Shared types for API service functions
import { HabitType, UserRole } from '../types/api';

export interface CreateWorkerRequest {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  departmentName: string;
  password?: string;
}

export interface UpdateWorkerRequest {
  role: UserRole;
  firstName: string;
  lastName: string;
  departmentName: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description: string;
  teamName: string;
}

export interface UpdateDepartmentRequest {
  id: string;
  name: string;
  description: string;
  teamName: string;
}

export interface CreateTeamRequest {
  name: string;
  description: string;
}

export interface UpdateTeamRequest {
  id: string;
  name: string;
  description: string;
  departmentCount: number;
}

export interface AddHabitRequest {
  type: HabitType;
  notes?: string;
  amount?: number;
}

export interface UpdateHabitRequest {
  id: string;
  type: HabitType;
  completedAt: string;
  notes?: string;
  amount?: number;
}

export interface MapHabitToWorkerRequest {
  habitId: string;
  workerId: string;
}

export interface AttendanceRequest {
  workerId: string;
  checkInTime: string;
}

export interface ReportParams {
  isAdmin?: boolean;
  startDate?: string;
  endDate?: string;
  teamName?: string;
  departmentName?: string;
}

// Authentication request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LogoutRequest {
  email: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyTokenRequest {
  email: string;
  token: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Authentication response types
export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  departmentName: string;
}
