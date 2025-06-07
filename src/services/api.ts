import api from '../lib/api';
import { 
  Worker, 
  Department, 
  Team, 
  Habit, 
  HabitType, 
  UserRole, 
  Attendance, 
  Devotional 
} from '../types/api';

// Request/Response Types
export interface CreateWorkerRequest {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  departmentName: string;
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

// Admin API Functions

/**
 * Creates a new worker
 * @param workerData - Worker creation data
 * @returns Promise<void>
 */
export const createWorker = async (workerData: CreateWorkerRequest): Promise<void> => {
  try {
    await api.post('/api/Admin/create-worker', workerData);
  } catch (error) {
    throw new Error(`Failed to create worker: ${error}`);
  }
};

/**
 * Deletes a worker by ID
 * @param id - Worker ID
 * @returns Promise<void>
 */
export const deleteWorker = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/Admin/delete-worker/${id}`);
  } catch (error) {
    throw new Error(`Failed to delete worker: ${error}`);
  }
};

/**
 * Retrieves all workers
 * @returns Promise<Worker[]>
 */
export const getWorkers = async (): Promise<Worker[]> => {
  try {
    const response = await api.get('/api/Admin/get-workers');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch workers: ${error}`);
  }
};

/**
 * Retrieves a specific worker by ID
 * @param id - Worker ID
 * @returns Promise<Worker>
 */
export const getWorkerById = async (id: string): Promise<Worker> => {
  try {
    const response = await api.get(`/api/Admin/workers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch worker: ${error}`);
  }
};

/**
 * Updates a worker by ID
 * @param id - Worker ID
 * @param workerData - Updated worker data
 * @returns Promise<void>
 */
export const updateWorker = async (id: string, workerData: UpdateWorkerRequest): Promise<void> => {
  try {
    await api.put(`/api/Admin/update-worker/${id}`, workerData);
  } catch (error) {
    throw new Error(`Failed to update worker: ${error}`);
  }
};

// Attendance API Functions

/**
 * Marks worker attendance using QR code
 * @param qrCodeData - QR code string data
 * @returns Promise<void>
 */
export const markWorkerAttendance = async (qrCodeData: string): Promise<void> => {
  try {
    await api.post('/api/Attendance/mark-workers-attendance', qrCodeData, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to mark attendance: ${error}`);
  }
};

/**
 * Saves attendance record
 * @param workerId - Worker ID
 * @param checkInTime - Check-in timestamp
 * @returns Promise<void>
 */
export const saveAttendance = async (workerId: string, checkInTime: string): Promise<void> => {
  try {
    await api.post('/api/Attendance/save', null, {
      params: { workerId, checkInTime }
    });
  } catch (error) {
    throw new Error(`Failed to save attendance: ${error}`);
  }
};

/**
 * Retrieves attendance records for a specific worker
 * @param workerId - Worker ID
 * @param startDate - Optional start date filter
 * @returns Promise<Attendance[]>
 */
export const getWorkerAttendance = async (workerId: string, startDate?: string): Promise<Attendance[]> => {
  try {
    const response = await api.get(`/api/Attendance/worker/${workerId}`, {
      params: startDate ? { startDate } : {}
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch worker attendance: ${error}`);
  }
};

/**
 * Retrieves all attendance records within date range
 * @param startDate - Start date filter
 * @param endDate - End date filter
 * @returns Promise<Attendance[]>
 */
export const getAttendanceRecords = async (startDate?: string, endDate?: string): Promise<Attendance[]> => {
  try {
    const response = await api.get('/api/Attendance', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch attendance records: ${error}`);
  }
};

// Barcode/QR Code API Functions

/**
 * Generates and downloads barcode for a worker
 * @param workerId - Worker ID
 * @returns Promise<Blob>
 */
export const generateWorkerBarcode = async (workerId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/api/BarCode/generate-download-barcode/${workerId}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to generate barcode: ${error}`);
  }
};

/**
 * Assigns a barcode to a worker
 * @param qrCodeId - QR Code ID
 * @param workerId - Worker ID
 * @returns Promise<void>
 */
export const assignWorkerBarcode = async (qrCodeId: string, workerId: string): Promise<void> => {
  try {
    await api.put('/api/BarCode/assign-worker-barcode', null, {
      params: { qrCodeId, workerId }
    });
  } catch (error) {
    throw new Error(`Failed to assign barcode: ${error}`);
  }
};

/**
 * Disables a worker's barcode
 * @param workerId - Worker ID
 * @returns Promise<void>
 */
export const disableWorkerBarcode = async (workerId: string): Promise<void> => {
  try {
    await api.delete(`/api/BarCode/disable-worker-barcode/${workerId}`);
  } catch (error) {
    throw new Error(`Failed to disable barcode: ${error}`);
  }
};

/**
 * Retrieves worker information by QR code ID
 * @param qrCodeId - QR Code ID
 * @returns Promise<Worker>
 */
export const getWorkerByBarcode = async (qrCodeId: string): Promise<Worker> => {
  try {
    const response = await api.get(`/api/BarCode/get-worker-barcode/${qrCodeId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch worker by barcode: ${error}`);
  }
};

// Dashboard API Functions

/**
 * Retrieves dashboard data for a specific worker
 * @param workerId - Worker ID
 * @returns Promise<any>
 */
export const getWorkerDashboard = async (workerId: string): Promise<any> => {
  try {
    const response = await api.get(`/api/Dashboard/${workerId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch dashboard data: ${error}`);
  }
};

// Department API Functions

/**
 * Retrieves all departments
 * @returns Promise<Department[]>
 */
export const getAllDepartments = async (): Promise<Department[]> => {
  try {
    const response = await api.get('/api/Department/all-departments');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch departments: ${error}`);
  }
};

/**
 * Creates a new department
 * @param departmentData - Department creation data
 * @returns Promise<void>
 */
export const createDepartment = async (departmentData: CreateDepartmentRequest): Promise<void> => {
  try {
    await api.post('/api/Department/add-department', departmentData);
  } catch (error) {
    throw new Error(`Failed to create department: ${error}`);
  }
};

/**
 * Retrieves a department by name
 * @param departmentName - Department name
 * @returns Promise<Department>
 */
export const getDepartmentByName = async (departmentName: string): Promise<Department> => {
  try {
    const response = await api.get(`/api/Department/get-department/${departmentName}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch department: ${error}`);
  }
};

/**
 * Updates a department by ID
 * @param id - Department ID
 * @param departmentData - Updated department data
 * @returns Promise<void>
 */
export const updateDepartment = async (id: string, departmentData: UpdateDepartmentRequest): Promise<void> => {
  try {
    await api.put(`/api/Department/update-department/${id}`, departmentData);
  } catch (error) {
    throw new Error(`Failed to update department: ${error}`);
  }
};

/**
 * Deletes a department by ID
 * @param id - Department ID
 * @returns Promise<void>
 */
export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/Department/delete-department/${id}`);
  } catch (error) {
    throw new Error(`Failed to delete department: ${error}`);
  }
};

// Devotional API Functions

/**
 * Uploads a devotional file
 * @param file - File to upload
 * @returns Promise<void>
 */
export const uploadDevotional = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('File', file);
    
    await api.post('/api/Devotional/upload-devotionals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } catch (error) {
    throw new Error(`Failed to upload devotional: ${error}`);
  }
};

/**
 * Downloads a devotional file
 * @param id - Devotional ID
 * @returns Promise<Blob>
 */
export const downloadDevotional = async (id: string): Promise<Blob> => {
  try {
    const response = await api.get(`/api/Devotional/download/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to download devotional: ${error}`);
  }
};

/**
 * Retrieves all devotionals
 * @returns Promise<Devotional[]>
 */
export const getAllDevotionals = async (): Promise<Devotional[]> => {
  try {
    const response = await api.get('/api/Devotional/get-all-devotionals');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch devotionals: ${error}`);
  }
};

/**
 * Deletes a devotional by ID
 * @param id - Devotional ID
 * @returns Promise<void>
 */
export const deleteDevotional = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/Devotional/delete-devotional/${id}`);
  } catch (error) {
    throw new Error(`Failed to delete devotional: ${error}`);
  }
};

// Habit API Functions

/**
 * Retrieves all habits
 * @returns Promise<Habit[]>
 */
export const getHabits = async (): Promise<Habit[]> => {
  try {
    const response = await api.get('/api/Habit/get-habits');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch habits: ${error}`);
  }
};

/**
 * Adds a new habit
 * @param habitData - Habit creation data
 * @returns Promise<void>
 */
export const addHabit = async (habitData: AddHabitRequest): Promise<void> => {
  try {
    await api.post('/api/Habit/add-habit', habitData);
  } catch (error) {
    throw new Error(`Failed to add habit: ${error}`);
  }
};

/**
 * Updates a habit by ID
 * @param id - Habit ID
 * @param habitData - Updated habit data
 * @returns Promise<void>
 */
export const updateHabit = async (id: string, habitData: UpdateHabitRequest): Promise<void> => {
  try {
    await api.put(`/api/Habit/update-habit/${id}`, habitData);
  } catch (error) {
    throw new Error(`Failed to update habit: ${error}`);
  }
};

/**
 * Deletes a habit by ID
 * @param id - Habit ID
 * @returns Promise<void>
 */
export const deleteHabit = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/Habit/delete-habit/${id}`, {
      data: { id }
    });
  } catch (error) {
    throw new Error(`Failed to delete habit: ${error}`);
  }
};

/**
 * Assigns a habit to a worker
 * @param habitId - Habit ID
 * @param workerId - Worker ID
 * @returns Promise<void>
 */
export const assignHabitToWorker = async (habitId: string, workerId: string): Promise<void> => {
  try {
    await api.put('/api/Habit/assign-worker', { habitId, workerId });
  } catch (error) {
    throw new Error(`Failed to assign habit to worker: ${error}`);
  }
};

// Report API Functions

/**
 * Retrieves worker activity summary report
 * @param params - Report parameters
 * @returns Promise<any>
 */
export const getWorkerActivitySummary = async (params: ReportParams): Promise<any> => {
  try {
    const response = await api.get('/api/Report/worker-activity-summary', { params });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch activity summary: ${error}`);
  }
};

/**
 * Exports attendance report
 * @param params - Report parameters
 * @returns Promise<Blob>
 */
export const exportAttendanceReport = async (params: ReportParams): Promise<Blob> => {
  try {
    const response = await api.get('/api/Report/export-attendance', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to export attendance report: ${error}`);
  }
};

/**
 * Exports summary report
 * @param params - Report parameters
 * @returns Promise<Blob>
 */
export const exportSummaryReport = async (params: ReportParams): Promise<Blob> => {
  try {
    const response = await api.get('/api/Report/export-summary', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to export summary report: ${error}`);
  }
};

// Team API Functions

/**
 * Creates a new team
 * @param teamData - Team creation data
 * @returns Promise<void>
 */
export const createTeam = async (teamData: CreateTeamRequest): Promise<void> => {
  try {
    await api.post('/api/Team/create-team', teamData);
  } catch (error) {
    throw new Error(`Failed to create team: ${error}`);
  }
};

/**
 * Retrieves all teams
 * @returns Promise<Team[]>
 */
export const getTeams = async (): Promise<Team[]> => {
  try {
    const response = await api.get('/api/Team/get-teams');
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch teams: ${error}`);
  }
};

/**
 * Retrieves a team by name
 * @param teamName - Team name
 * @returns Promise<Team>
 */
export const getTeamByName = async (teamName: string): Promise<Team> => {
  try {
    const response = await api.get(`/api/Team/get-teams/${teamName}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch team: ${error}`);
  }
};

/**
 * Updates a team by ID
 * @param id - Team ID
 * @param teamData - Updated team data
 * @returns Promise<void>
 */
export const updateTeam = async (id: string, teamData: UpdateTeamRequest): Promise<void> => {
  try {
    await api.put(`/api/Team/update-team/${id}`, teamData);
  } catch (error) {
    throw new Error(`Failed to update team: ${error}`);
  }
};

/**
 * Deletes a team by ID
 * @param id - Team ID
 * @returns Promise<void>
 */
export const deleteTeam = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/Team/delete-team/${id}`);
  } catch (error) {
    throw new Error(`Failed to delete team: ${error}`);
  }
};