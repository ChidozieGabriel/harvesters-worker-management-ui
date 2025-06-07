import { MockMethod } from 'vite-plugin-mock';
import {
  mockAttendance,
  mockDashboardData,
  mockDepartments,
  mockDevotionals,
  mockHabits,
  mockTeams,
  mockWorkerDashboardData,
  mockWorkers
} from './mockData';

// Helper function to generate mock JWT tokens
function generateMockJwt(payload: any, expiresInSeconds: number = 3600): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now, // issued at
    exp: now + expiresInSeconds // expires in 1 hour by default
  };

  // Base64Url encode (simplified for mock)
  const encodedHeader = btoa(JSON.stringify(header)).replace(/[+/]/g, (m) => ({ '+': '-', '/': '_' }[m]!)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(tokenPayload)).replace(/[+/]/g, (m) => ({ '+': '-', '/': '_' }[m]!)).replace(/=/g, '');

  // Mock signature (in real implementation, this would be properly signed)
  const signature = 'mock_signature_' + Date.now();

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export default [
  // WorkerAuth API endpoints
  {
    url: '/api/WorkerAuth/worker-login',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/WorkerAuth/worker-login', body);

      // Find worker by email and validate password
      const worker = mockWorkers.find(w => w.email === body.email);

      // Mock password validation (in real app, this would be properly hashed)
      const validPassword = body.password === 'password123';

      if (!worker || !validPassword) {
        return { error: 'Invalid credentials', status: 401 };
      }

      // Generate dynamic JWT token with worker information
      const token = generateMockJwt(worker, 3600); // 1 hour expiration

      return {
        token,
        user: worker
      };
    },
  },
  {
    url: '/api/WorkerAuth/worker-logout',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/WorkerAuth/worker-logout', body);
      return { success: true, message: 'Logged out successfully' };
    },
  },
  {
    url: '/api/WorkerAuth/request-password-reset',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/WorkerAuth/request-password-reset', body);
      return { success: true, message: 'Password reset email sent' };
    },
  },
  {
    url: '/api/WorkerAuth/forgot-password',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/WorkerAuth/forgot-password', body);
      return { success: true, message: 'Password reset instructions sent' };
    },
  },
  {
    url: '/api/WorkerAuth/verify-token',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/WorkerAuth/verify-token', body);
      // Mock token verification - accept any token for demo
      return { success: true, valid: true };
    },
  },
  {
    url: '/api/WorkerAuth/reset-password',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/WorkerAuth/reset-password', body);
      return { success: true, message: 'Password reset successfully' };
    },
  },

  // Admin API endpoints
  {
    url: '/api/Admin/create-worker',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/Admin/create-worker', body);
      const newWorker = {
        id: `550e8400-e29b-41d4-a716-${Date.now()}`,
        ...body
      };
      mockWorkers.push(newWorker);
      return { success: true };
    },
  },
  {
    url: '/api/Admin/delete-worker/:id',
    method: 'delete',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] DELETE /api/Admin/delete-worker', query);
      const index = mockWorkers.findIndex(w => w.id === query.id);
      if (index > -1) {
        mockWorkers.splice(index, 1);
      }
      return { success: true };
    },
  },
  {
    url: '/api/Admin/get-workers',
    method: 'get',
    response: () => {
      console.log('🔧 [MOCK API] GET /api/Admin/get-workers');
      return mockWorkers;
    },
  },
  {
    url: '/api/Admin/workers/:id',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/Admin/workers/:id', query);
      const worker = mockWorkers.find(w => w.id === query.id);
      if (!worker) {
        return { error: 'Worker not found', status: 404 };
      }
      return worker;
    },
  },
  {
    url: '/api/Admin/update-worker/:id',
    method: 'put',
    response: ({ query, body }) => {
      console.log('🔧 [MOCK API] PUT /api/Admin/update-worker', { id: query.id, ...body });
      const index = mockWorkers.findIndex(w => w.id === query.id);
      if (index > -1) {
        mockWorkers[index] = { ...mockWorkers[index], ...body };
      }
      return { success: true };
    },
  },

  // Attendance API endpoints
  {
    url: '/api/Attendance/mark-workers-attendance',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/Attendance/mark-workers-attendance', body);
      return { success: true };
    },
  },
  {
    url: '/api/Attendance/save',
    method: 'post',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] POST /api/Attendance/save', query);
      const newAttendance = {
        id: `990e8400-e29b-41d4-a716-${Date.now()}`,
        workerId: query.workerId,
        checkInTime: query.checkInTime
      };
      mockAttendance.push(newAttendance);
      return { success: true };
    },
  },
  {
    url: '/api/Attendance/worker/:workerId',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/Attendance/worker/:workerId', query);
      const workerAttendance = mockAttendance.filter(a => a.workerId === query.workerId);
      return workerAttendance;
    },
  },
  {
    url: '/api/Attendance',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/Attendance', query);
      return mockAttendance;
    },
  },

  // Dashboard API endpoints
  {
    url: '/api/Dashboard/:workerId',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/Dashboard/:workerId', query);
      return mockWorkerDashboardData;
    },
  },

  // Department API endpoints
  {
    url: '/api/Department/all-departments',
    method: 'get',
    response: () => {
      console.log('🔧 [MOCK API] GET /api/Department/all-departments');
      return mockDepartments;
    },
  },
  {
    url: '/api/Department/add-department',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/Department/add-department', body);
      const newDepartment = {
        id: `660e8400-e29b-41d4-a716-${Date.now()}`,
        ...body
      };
      mockDepartments.push(newDepartment);
      return { success: true };
    },
  },
  {
    url: '/api/Department/get-department/:departmentName',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/Department/get-department/:departmentName', query);
      const department = mockDepartments.find(d => d.name === query.departmentName);
      if (!department) {
        return { error: 'Department not found', status: 404 };
      }
      return department;
    },
  },
  {
    url: '/api/Department/update-department/:id',
    method: 'put',
    response: ({ query, body }) => {
      console.log('🔧 [MOCK API] PUT /api/Department/update-department', { id: query.id, ...body });
      const index = mockDepartments.findIndex(d => d.id === query.id);
      if (index > -1) {
        mockDepartments[index] = { ...mockDepartments[index], ...body };
      }
      return { success: true };
    },
  },
  {
    url: '/api/Department/delete-department/:id',
    method: 'delete',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] DELETE /api/Department/delete-department', query);
      const index = mockDepartments.findIndex(d => d.id === query.id);
      if (index > -1) {
        mockDepartments.splice(index, 1);
      }
      return { success: true };
    },
  },

  // Team API endpoints
  {
    url: '/api/Team/create-team',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/Team/create-team', body);
      const newTeam = {
        id: `770e8400-e29b-41d4-a716-${Date.now()}`,
        departmentCount: 0,
        ...body
      };
      mockTeams.push(newTeam);
      return { success: true };
    },
  },
  {
    url: '/api/Team/get-teams',
    method: 'get',
    response: () => {
      console.log('🔧 [MOCK API] GET /api/Team/get-teams');
      return mockTeams;
    },
  },
  {
    url: '/api/Team/get-teams/:teamName',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/Team/get-teams/:teamName', query);
      const team = mockTeams.find(t => t.name === query.teamName);
      if (!team) {
        return { error: 'Team not found', status: 404 };
      }
      return team;
    },
  },
  {
    url: '/api/Team/update-team/:id',
    method: 'put',
    response: ({ query, body }) => {
      console.log('🔧 [MOCK API] PUT /api/Team/update-team', { id: query.id, ...body });
      const index = mockTeams.findIndex(t => t.id === query.id);
      if (index > -1) {
        mockTeams[index] = { ...mockTeams[index], ...body };
      }
      return { success: true };
    },
  },
  {
    url: '/api/Team/delete-team/:id',
    method: 'delete',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] DELETE /api/Team/delete-team', query);
      const index = mockTeams.findIndex(t => t.id === query.id);
      if (index > -1) {
        mockTeams.splice(index, 1);
      }
      return { success: true };
    },
  },

  // Habit API endpoints
  {
    url: '/api/Habit/get-habits',
    method: 'get',
    response: () => {
      console.log('🔧 [MOCK API] GET /api/Habit/get-habits');
      return mockHabits;
    },
  },
  {
    url: '/api/Habit/add-habit',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/Habit/add-habit', body);
      const newHabit = {
        id: `880e8400-e29b-41d4-a716-${Date.now()}`,
        ...body
      };
      mockHabits.push(newHabit);
      return { success: true };
    },
  },
  {
    url: '/api/Habit/update-habit/:id',
    method: 'put',
    response: ({ query, body }) => {
      console.log('🔧 [MOCK API] PUT /api/Habit/update-habit', { id: query.id, ...body });
      const index = mockHabits.findIndex(h => h.id === query.id);
      if (index > -1) {
        mockHabits[index] = { ...mockHabits[index], ...body };
      }
      return { success: true };
    },
  },
  {
    url: '/api/Habit/delete-habit/:id',
    method: 'delete',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] DELETE /api/Habit/delete-habit', query);
      const index = mockHabits.findIndex(h => h.id === query.id);
      if (index > -1) {
        mockHabits.splice(index, 1);
      }
      return { success: true };
    },
  },
  {
    url: '/api/Habit/assign-worker',
    method: 'put',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] PUT /api/Habit/assign-worker', body);
      return { success: true };
    },
  },

  // Devotional API endpoints
  {
    url: '/api/Devotional/upload-devotionals',
    method: 'post',
    response: ({ body }) => {
      console.log('🔧 [MOCK API] POST /api/Devotional/upload-devotionals', body);
      const newDevotional = {
        id: `aa0e8400-e29b-41d4-a716-${Date.now()}`,
        title: 'Uploaded Devotional',
        fileUrl: `https://mock.example.com/devotional-${Date.now()}.pdf`,
        uploadedAt: new Date().toISOString()
      };
      mockDevotionals.push(newDevotional);
      return { success: true };
    },
  },
  {
    url: '/api/Devotional/download/:id',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/Devotional/download/:id', query);
      // Return mock file content
      return new Blob(['mock-devotional-content'], { type: 'application/pdf' });
    },
  },
  {
    url: '/api/Devotional/get-all-devotionals',
    method: 'get',
    response: () => {
      console.log('🔧 [MOCK API] GET /api/Devotional/get-all-devotionals');
      return mockDevotionals;
    },
  },
  {
    url: '/api/Devotional/delete-devotional/:id',
    method: 'delete',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] DELETE /api/Devotional/delete-devotional', query);
      const index = mockDevotionals.findIndex(d => d.id === query.id);
      if (index > -1) {
        mockDevotionals.splice(index, 1);
      }
      return { success: true };
    },
  },

  // Report API endpoints
  {
    url: '/api/Report/worker-activity-summary',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/Report/worker-activity-summary', query);
      return mockDashboardData;
    },
  },
  {
    url: '/api/Report/export-attendance',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/Report/export-attendance', query);
      const csvContent = 'Date,Worker,Department,CheckIn\n2024-01-01,John Doe,Worship,09:00:00';
      return new Blob([csvContent], { type: 'text/csv' });
    },
  },
  {
    url: '/api/Report/export-summary',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/Report/export-summary', query);
      const csvContent = 'Summary,Count\nTotal Workers,4\nTotal Departments,4\nTotal Teams,3';
      return new Blob([csvContent], { type: 'text/csv' });
    },
  },

  // Barcode API endpoints
  {
    url: '/api/BarCode/generate-download-barcode/:workerId',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/BarCode/generate-download-barcode', query);
      return new Blob(['mock-barcode-data'], { type: 'image/png' });
    },
  },
  {
    url: '/api/BarCode/assign-worker-barcode',
    method: 'put',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] PUT /api/BarCode/assign-worker-barcode', query);
      return { success: true };
    },
  },
  {
    url: '/api/BarCode/disable-worker-barcode/:workerId',
    method: 'delete',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] DELETE /api/BarCode/disable-worker-barcode', query);
      return { success: true };
    },
  },
  {
    url: '/api/BarCode/get-worker-barcode/:qrCodeId',
    method: 'get',
    response: ({ query }) => {
      console.log('🔧 [MOCK API] GET /api/BarCode/get-worker-barcode', query);
      return mockWorkers[0]; // Return first worker as mock
    },
  },
] as MockMethod[];