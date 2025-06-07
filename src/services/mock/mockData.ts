// Mock data for development environment
import { Worker, Department, Team, Habit, HabitType, UserRole, Attendance, Devotional } from '../../types/api';

// Mock Workers
export const mockWorkers: Worker[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'john.doe@example.com',
    role: UserRole.Worker,
    firstName: 'John',
    lastName: 'Doe',
    departmentName: 'Worship'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'jane.smith@example.com',
    role: UserRole.Admin,
    firstName: 'Jane',
    lastName: 'Smith',
    departmentName: 'Administration'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'mike.johnson@example.com',
    role: UserRole.Worker,
    firstName: 'Mike',
    lastName: 'Johnson',
    departmentName: 'Youth Ministry'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'sarah.wilson@example.com',
    role: UserRole.NonWorker,
    firstName: 'Sarah',
    lastName: 'Wilson',
    departmentName: 'Children Ministry'
  }
];

// Mock Departments
export const mockDepartments: Department[] = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: 'Worship',
    description: 'Music and worship services',
    teamName: 'Creative Arts'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    name: 'Administration',
    description: 'Church administration and management',
    teamName: 'Leadership'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    name: 'Youth Ministry',
    description: 'Ministry for teenagers and young adults',
    teamName: 'Pastoral Care'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440004',
    name: 'Children Ministry',
    description: 'Ministry for children and families',
    teamName: 'Pastoral Care'
  }
];

// Mock Teams
export const mockTeams: Team[] = [
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    name: 'Creative Arts',
    description: 'Music, media, and creative expression',
    departmentCount: 2
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    name: 'Leadership',
    description: 'Church leadership and governance',
    departmentCount: 1
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440003',
    name: 'Pastoral Care',
    description: 'Spiritual care and ministry',
    departmentCount: 2
  }
];

// Mock Habits
export const mockHabits: Habit[] = [
  {
    id: '880e8400-e29b-41d4-a716-446655440001',
    type: HabitType.BibleStudy,
    notes: 'Daily Bible reading plan',
    amount: 30,
    completedAt: new Date().toISOString()
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440002',
    type: HabitType.NLPPrayer,
    notes: 'Morning prayer session',
    amount: 15,
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440003',
    type: HabitType.Giving,
    notes: 'Monthly tithe',
    amount: 500,
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440004',
    type: HabitType.Fasting,
    notes: 'Weekly fast',
    amount: 24,
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock Attendance Records
export const mockAttendance: Attendance[] = [
  {
    id: '990e8400-e29b-41d4-a716-446655440001',
    workerId: '550e8400-e29b-41d4-a716-446655440001',
    checkInTime: new Date().toISOString()
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440002',
    workerId: '550e8400-e29b-41d4-a716-446655440002',
    checkInTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440003',
    workerId: '550e8400-e29b-41d4-a716-446655440003',
    checkInTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock Devotionals
export const mockDevotionals: Devotional[] = [
  {
    id: 'aa0e8400-e29b-41d4-a716-446655440001',
    title: 'Daily Bread - Week 1',
    fileUrl: 'https://example.com/devotionals/week1.pdf',
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'aa0e8400-e29b-41d4-a716-446655440002',
    title: 'Walking with God',
    fileUrl: 'https://example.com/devotionals/walking.pdf',
    uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'aa0e8400-e29b-41d4-a716-446655440003',
    title: 'Faith in Action',
    fileUrl: 'https://example.com/devotionals/faith.pdf',
    uploadedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock Dashboard Data
export const mockDashboardData = {
  totalWorkers: 4,
  totalDepartments: 4,
  totalTeams: 3,
  attendanceRate: 85,
  departmentStats: [
    { name: 'Worship', count: 1 },
    { name: 'Administration', count: 1 },
    { name: 'Youth Ministry', count: 1 },
    { name: 'Children Ministry', count: 1 }
  ],
  activityTimeline: [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), attendance: 12, habits: 8 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), attendance: 15, habits: 10 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), attendance: 18, habits: 12 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), attendance: 14, habits: 9 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), attendance: 20, habits: 15 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), attendance: 16, habits: 11 },
    { date: new Date().toISOString(), attendance: 22, habits: 18 }
  ]
};

// Mock Worker Dashboard Data
export const mockWorkerDashboardData = {
  totalAttendance: 12,
  habitCompletion: 75,
  devotionalCount: 8,
  recentActivity: [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), count: 2 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), count: 3 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), count: 1 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), count: 4 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), count: 2 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), count: 3 },
    { date: new Date().toISOString(), count: 5 }
  ]
};