// Mock API service implementation for development environment
import {
  mockWorkers,
  mockDepartments,
  mockTeams,
  mockHabits,
  mockAttendance,
  mockDevotionals,
  mockDashboardData,
  mockWorkerDashboardData
} from './mockData';
import {
  CreateWorkerRequest,
  UpdateWorkerRequest,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddHabitRequest,
  UpdateHabitRequest,
  ReportParams
} from '../types';
import { Worker, Department, Team, Habit, Attendance, Devotional } from '../../types/api';

// Utility function to simulate API delay and log mock calls
const mockApiCall = async <T>(
  operation: string,
  data?: any,
  delay: number = 500
): Promise<T> => {
  console.log(`🔧 [MOCK API] ${operation}`, data ? { data } : '');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return data;
};

// Admin API Functions

export const createWorker = async (workerData: CreateWorkerRequest): Promise<void> => {
  await mockApiCall('POST /api/Admin/create-worker', workerData);
  
  // Simulate adding to mock data
  const newWorker: Worker = {
    id: `550e8400-e29b-41d4-a716-${Date.now()}`,
    ...workerData
  };
  mockWorkers.push(newWorker);
};

export const deleteWorker = async (id: string): Promise<void> => {
  await mockApiCall('DELETE /api/Admin/delete-worker', { id });
  
  // Simulate removal from mock data
  const index = mockWorkers.findIndex(w => w.id === id);
  if (index > -1) {
    mockWorkers.splice(index, 1);
  }
};

export const getWorkers = async (): Promise<Worker[]> => {
  return await mockApiCall('GET /api/Admin/get-workers', mockWorkers);
};

export const getWorkerById = async (id: string): Promise<Worker> => {
  const worker = mockWorkers.find(w => w.id === id);
  if (!worker) {
    throw new Error(`Worker with id ${id} not found`);
  }
  return await mockApiCall('GET /api/Admin/workers/:id', worker);
};

export const updateWorker = async (id: string, workerData: UpdateWorkerRequest): Promise<void> => {
  await mockApiCall('PUT /api/Admin/update-worker', { id, ...workerData });
  
  // Simulate update in mock data
  const index = mockWorkers.findIndex(w => w.id === id);
  if (index > -1) {
    mockWorkers[index] = { ...mockWorkers[index], ...workerData };
  }
};

// Attendance API Functions

export const markWorkerAttendance = async (qrCodeData: string): Promise<void> => {
  await mockApiCall('POST /api/Attendance/mark-workers-attendance', { qrCodeData });
};

export const saveAttendance = async (workerId: string, checkInTime: string): Promise<void> => {
  await mockApiCall('POST /api/Attendance/save', { workerId, checkInTime });
  
  // Simulate adding to mock data
  const newAttendance: Attendance = {
    id: `990e8400-e29b-41d4-a716-${Date.now()}`,
    workerId,
    checkInTime
  };
  mockAttendance.push(newAttendance);
};

export const getWorkerAttendance = async (workerId: string, startDate?: string): Promise<Attendance[]> => {
  const workerAttendance = mockAttendance.filter(a => a.workerId === workerId);
  return await mockApiCall('GET /api/Attendance/worker/:workerId', workerAttendance);
};

export const getAttendanceRecords = async (startDate?: string, endDate?: string): Promise<Attendance[]> => {
  return await mockApiCall('GET /api/Attendance', mockAttendance);
};

// Barcode/QR Code API Functions

export const generateWorkerBarcode = async (workerId: string): Promise<Blob> => {
  await mockApiCall('GET /api/BarCode/generate-download-barcode', { workerId });
  
  // Return a mock blob
  return new Blob(['mock-barcode-data'], { type: 'image/png' });
};

export const assignWorkerBarcode = async (qrCodeId: string, workerId: string): Promise<void> => {
  await mockApiCall('PUT /api/BarCode/assign-worker-barcode', { qrCodeId, workerId });
};

export const disableWorkerBarcode = async (workerId: string): Promise<void> => {
  await mockApiCall('DELETE /api/BarCode/disable-worker-barcode', { workerId });
};

export const getWorkerByBarcode = async (qrCodeId: string): Promise<Worker> => {
  // Return first worker as mock
  const worker = mockWorkers[0];
  return await mockApiCall('GET /api/BarCode/get-worker-barcode', worker);
};

// Dashboard API Functions

export const getWorkerDashboard = async (workerId: string): Promise<any> => {
  return await mockApiCall('GET /api/Dashboard/:workerId', mockWorkerDashboardData);
};

// Department API Functions

export const getAllDepartments = async (): Promise<Department[]> => {
  return await mockApiCall('GET /api/Department/all-departments', mockDepartments);
};

export const createDepartment = async (departmentData: CreateDepartmentRequest): Promise<void> => {
  await mockApiCall('POST /api/Department/add-department', departmentData);
  
  // Simulate adding to mock data
  const newDepartment: Department = {
    id: `660e8400-e29b-41d4-a716-${Date.now()}`,
    ...departmentData
  };
  mockDepartments.push(newDepartment);
};

export const getDepartmentByName = async (departmentName: string): Promise<Department> => {
  const department = mockDepartments.find(d => d.name === departmentName);
  if (!department) {
    throw new Error(`Department ${departmentName} not found`);
  }
  return await mockApiCall('GET /api/Department/get-department/:name', department);
};

export const updateDepartment = async (id: string, departmentData: UpdateDepartmentRequest): Promise<void> => {
  await mockApiCall('PUT /api/Department/update-department', { id, ...departmentData });
  
  // Simulate update in mock data
  const index = mockDepartments.findIndex(d => d.id === id);
  if (index > -1) {
    mockDepartments[index] = { ...mockDepartments[index], ...departmentData };
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await mockApiCall('DELETE /api/Department/delete-department', { id });
  
  // Simulate removal from mock data
  const index = mockDepartments.findIndex(d => d.id === id);
  if (index > -1) {
    mockDepartments.splice(index, 1);
  }
};

// Devotional API Functions

export const uploadDevotional = async (file: File): Promise<void> => {
  await mockApiCall('POST /api/Devotional/upload-devotionals', { fileName: file.name });
  
  // Simulate adding to mock data
  const newDevotional: Devotional = {
    id: `aa0e8400-e29b-41d4-a716-${Date.now()}`,
    title: file.name,
    fileUrl: `https://mock.example.com/${file.name}`,
    uploadedAt: new Date().toISOString()
  };
  mockDevotionals.push(newDevotional);
};

export const downloadDevotional = async (id: string): Promise<Blob> => {
  await mockApiCall('GET /api/Devotional/download/:id', { id });
  
  // Return a mock blob
  return new Blob(['mock-devotional-content'], { type: 'application/pdf' });
};

export const getAllDevotionals = async (): Promise<Devotional[]> => {
  return await mockApiCall('GET /api/Devotional/get-all-devotionals', mockDevotionals);
};

export const deleteDevotional = async (id: string): Promise<void> => {
  await mockApiCall('DELETE /api/Devotional/delete-devotional', { id });
  
  // Simulate removal from mock data
  const index = mockDevotionals.findIndex(d => d.id === id);
  if (index > -1) {
    mockDevotionals.splice(index, 1);
  }
};

// Habit API Functions

export const getHabits = async (): Promise<Habit[]> => {
  return await mockApiCall('GET /api/Habit/get-habits', mockHabits);
};

export const addHabit = async (habitData: AddHabitRequest): Promise<void> => {
  await mockApiCall('POST /api/Habit/add-habit', habitData);
  
  // Simulate adding to mock data
  const newHabit: Habit = {
    id: `880e8400-e29b-41d4-a716-${Date.now()}`,
    ...habitData
  };
  mockHabits.push(newHabit);
};

export const updateHabit = async (id: string, habitData: UpdateHabitRequest): Promise<void> => {
  await mockApiCall('PUT /api/Habit/update-habit', { id, ...habitData });
  
  // Simulate update in mock data
  const index = mockHabits.findIndex(h => h.id === id);
  if (index > -1) {
    mockHabits[index] = { ...mockHabits[index], ...habitData };
  }
};

export const deleteHabit = async (id: string): Promise<void> => {
  await mockApiCall('DELETE /api/Habit/delete-habit', { id });
  
  // Simulate removal from mock data
  const index = mockHabits.findIndex(h => h.id === id);
  if (index > -1) {
    mockHabits.splice(index, 1);
  }
};

export const assignHabitToWorker = async (habitId: string, workerId: string): Promise<void> => {
  await mockApiCall('PUT /api/Habit/assign-worker', { habitId, workerId });
};

// Report API Functions

export const getWorkerActivitySummary = async (params: ReportParams): Promise<any> => {
  return await mockApiCall('GET /api/Report/worker-activity-summary', mockDashboardData);
};

export const exportAttendanceReport = async (params: ReportParams): Promise<Blob> => {
  await mockApiCall('GET /api/Report/export-attendance', params);
  
  // Return a mock CSV blob
  const csvContent = 'Date,Worker,Department,CheckIn\n2024-01-01,John Doe,Worship,09:00:00';
  return new Blob([csvContent], { type: 'text/csv' });
};

export const exportSummaryReport = async (params: ReportParams): Promise<Blob> => {
  await mockApiCall('GET /api/Report/export-summary', params);
  
  // Return a mock CSV blob
  const csvContent = 'Summary,Count\nTotal Workers,4\nTotal Departments,4\nTotal Teams,3';
  return new Blob([csvContent], { type: 'text/csv' });
};

// Team API Functions

export const createTeam = async (teamData: CreateTeamRequest): Promise<void> => {
  await mockApiCall('POST /api/Team/create-team', teamData);
  
  // Simulate adding to mock data
  const newTeam: Team = {
    id: `770e8400-e29b-41d4-a716-${Date.now()}`,
    departmentCount: 0,
    ...teamData
  };
  mockTeams.push(newTeam);
};

export const getTeams = async (): Promise<Team[]> => {
  return await mockApiCall('GET /api/Team/get-teams', mockTeams);
};

export const getTeamByName = async (teamName: string): Promise<Team> => {
  const team = mockTeams.find(t => t.name === teamName);
  if (!team) {
    throw new Error(`Team ${teamName} not found`);
  }
  return await mockApiCall('GET /api/Team/get-teams/:name', team);
};

export const updateTeam = async (id: string, teamData: UpdateTeamRequest): Promise<void> => {
  await mockApiCall('PUT /api/Team/update-team', { id, ...teamData });
  
  // Simulate update in mock data
  const index = mockTeams.findIndex(t => t.id === id);
  if (index > -1) {
    mockTeams[index] = { ...mockTeams[index], ...teamData };
  }
};

export const deleteTeam = async (id: string): Promise<void> => {
  await mockApiCall('DELETE /api/Team/delete-team', { id });
  
  // Simulate removal from mock data
  const index = mockTeams.findIndex(t => t.id === id);
  if (index > -1) {
    mockTeams.splice(index, 1);
  }
};