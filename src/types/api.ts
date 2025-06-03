export interface Worker {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  departmentName: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  teamName: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  departmentCount: number;
}

export interface Habit {
  id: string;
  type: HabitType;
  notes?: string;
  amount?: number;
  completedAt?: string;
}

export enum HabitType {
  BibleStudy = 'BibleStudy',
  NLPPrayer = 'NLPPrayer',
  Giving = 'Giving',
  Fasting = 'Fasting',
  Devotionals = 'Devotionals'
}

export enum UserRole {
  Worker = 'Worker',
  NonWorker = 'NonWorker',
  Admin = 'Admin'
}

export interface Attendance {
  id: string;
  workerId: string;
  checkInTime: string;
}

export interface Devotional {
  id: string;
  title: string;
  fileUrl: string;
  uploadedAt: string;
}