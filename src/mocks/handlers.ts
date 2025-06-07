import { http, HttpResponse } from 'msw';
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

export const handlers = [
  // WorkerAuth API endpoints
  http.post('/api/WorkerAuth/worker-login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    console.log('🔧 [MSW] POST /api/WorkerAuth/worker-login', body);

    // Find worker by email and validate password
    const worker = mockWorkers.find(w => w.email === body.email);

    // Mock password validation (in real app, this would be properly hashed)
    const validPassword = body.password === 'password123';

    if (!worker || !validPassword) {
      return HttpResponse.json({ error: 'Invalid credentials', status: 401 }, { status: 401 });
    }

    // Generate dynamic JWT token with worker information
    const token = generateMockJwt(worker, 3600); // 1 hour expiration

    return HttpResponse.json({
      token,
      user: worker
    });
  }),

  http.post('/api/WorkerAuth/worker-logout', async ({ request }) => {
    const body = await request.json();
    console.log('🔧 [MSW] POST /api/WorkerAuth/worker-logout', body);
    return HttpResponse.json({ success: true, message: 'Logged out successfully' });
  }),

  http.post('/api/WorkerAuth/request-password-reset', async ({ request }) => {
    const body = await request.json();
    console.log('🔧 [MSW] POST /api/WorkerAuth/request-password-reset', body);
    return HttpResponse.json({ success: true, message: 'Password reset email sent' });
  }),

  http.post('/api/WorkerAuth/forgot-password', async ({ request }) => {
    const body = await request.json();
    console.log('🔧 [MSW] POST /api/WorkerAuth/forgot-password', body);
    return HttpResponse.json({ success: true, message: 'Password reset instructions sent' });
  }),

  http.post('/api/WorkerAuth/verify-token', async ({ request }) => {
    const body = await request.json();
    console.log('🔧 [MSW] POST /api/WorkerAuth/verify-token', body);
    // Mock token verification - accept any token for demo
    return HttpResponse.json({ success: true, valid: true });
  }),

  http.post('/api/WorkerAuth/reset-password', async ({ request }) => {
    const body = await request.json();
    console.log('🔧 [MSW] POST /api/WorkerAuth/reset-password', body);
    return HttpResponse.json({ success: true, message: 'Password reset successfully' });
  }),

  // Admin API endpoints
  http.post('/api/Admin/create-worker', async ({ request }) => {
    const body = await request.json() as any;
    console.log('🔧 [MSW] POST /api/Admin/create-worker', body);
    const newWorker = {
      id: `550e8400-e29b-41d4-a716-${Date.now()}`,
      ...body
    };
    mockWorkers.push(newWorker);
    return HttpResponse.json({ success: true });
  }),

  http.delete('/api/Admin/delete-worker/:id', ({ params }) => {
    const { id } = params;
    console.log('🔧 [MSW] DELETE /api/Admin/delete-worker', id);
    const index = mockWorkers.findIndex(w => w.id === id);
    if (index > -1) {
      mockWorkers.splice(index, 1);
    }
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/Admin/get-workers', () => {
    console.log('🔧 [MSW] GET /api/Admin/get-workers');
    return HttpResponse.json(mockWorkers);
  }),

  http.get('/api/Admin/workers/:id', ({ params }) => {
    const { id } = params;
    console.log('🔧 [MSW] GET /api/Admin/workers/:id', id);
    const worker = mockWorkers.find(w => w.id === id);
    if (!worker) {
      return HttpResponse.json({ error: 'Worker not found', status: 404 }, { status: 404 });
    }
    return HttpResponse.json(worker);
  }),

  http.put('/api/Admin/update-worker/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    console.log('🔧 [MSW] PUT /api/Admin/update-worker', { id, ...body });
    const index = mockWorkers.findIndex(w => w.id === id);
    if (index > -1) {
      mockWorkers[index] = { ...mockWorkers[index], ...body };
    }
    return HttpResponse.json({ success: true });
  }),

  // Attendance API endpoints
  http.post('/api/Attendance/mark-workers-attendance', async ({ request }) => {
    const body = await request.json();
    console.log('🔧 [MSW] POST /api/Attendance/mark-workers-attendance', body);
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/Attendance/save', ({ request }) => {
    const url = new URL(request.url);
    const workerId = url.searchParams.get('workerId');
    const checkInTime = url.searchParams.get('checkInTime');
    console.log('🔧 [MSW] POST /api/Attendance/save', { workerId, checkInTime });
    const newAttendance = {
      id: `990e8400-e29b-41d4-a716-${Date.now()}`,
      workerId: workerId || '',
      checkInTime: checkInTime || ''
    };
    mockAttendance.push(newAttendance);
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/Attendance/worker/:workerId', ({ params }) => {
    const { workerId } = params;
    console.log('🔧 [MSW] GET /api/Attendance/worker/:workerId', workerId);
    const workerAttendance = mockAttendance.filter(a => a.workerId === workerId);
    return HttpResponse.json(workerAttendance);
  }),

  http.get('/api/Attendance', ({ request }) => {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    console.log('🔧 [MSW] GET /api/Attendance', { startDate, endDate });
    return HttpResponse.json(mockAttendance);
  }),

  // Dashboard API endpoints
  http.get('/api/Dashboard/:workerId', ({ params }) => {
    const { workerId } = params;
    console.log('🔧 [MSW] GET /api/Dashboard/:workerId', workerId);
    return HttpResponse.json(mockWorkerDashboardData);
  }),

  // Department API endpoints
  http.get('/api/Department/all-departments', () => {
    console.log('🔧 [MSW] GET /api/Department/all-departments');
    return HttpResponse.json(mockDepartments);
  }),

  http.post('/api/Department/add-department', async ({ request }) => {
    const body = await request.json() as any;
    console.log('🔧 [MSW] POST /api/Department/add-department', body);
    const newDepartment = {
      id: `660e8400-e29b-41d4-a716-${Date.now()}`,
      ...body
    };
    mockDepartments.push(newDepartment);
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/Department/get-department/:departmentName', ({ params }) => {
    const { departmentName } = params;
    console.log('🔧 [MSW] GET /api/Department/get-department/:departmentName', departmentName);
    const department = mockDepartments.find(d => d.name === departmentName);
    if (!department) {
      return HttpResponse.json({ error: 'Department not found', status: 404 }, { status: 404 });
    }
    return HttpResponse.json(department);
  }),

  http.put('/api/Department/update-department/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    console.log('🔧 [MSW] PUT /api/Department/update-department', { id, ...body });
    const index = mockDepartments.findIndex(d => d.id === id);
    if (index > -1) {
      mockDepartments[index] = { ...mockDepartments[index], ...body };
    }
    return HttpResponse.json({ success: true });
  }),

  http.delete('/api/Department/delete-department/:id', ({ params }) => {
    const { id } = params;
    console.log('🔧 [MSW] DELETE /api/Department/delete-department', id);
    const index = mockDepartments.findIndex(d => d.id === id);
    if (index > -1) {
      mockDepartments.splice(index, 1);
    }
    return HttpResponse.json({ success: true });
  }),

  // Team API endpoints
  http.post('/api/Team/create-team', async ({ request }) => {
    const body = await request.json() as any;
    console.log('🔧 [MSW] POST /api/Team/create-team', body);
    const newTeam = {
      id: `770e8400-e29b-41d4-a716-${Date.now()}`,
      departmentCount: 0,
      ...body
    };
    mockTeams.push(newTeam);
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/Team/get-teams', () => {
    console.log('🔧 [MSW] GET /api/Team/get-teams');
    return HttpResponse.json(mockTeams);
  }),

  http.get('/api/Team/get-teams/:teamName', ({ params }) => {
    const { teamName } = params;
    console.log('🔧 [MSW] GET /api/Team/get-teams/:teamName', teamName);
    const team = mockTeams.find(t => t.name === teamName);
    if (!team) {
      return HttpResponse.json({ error: 'Team not found', status: 404 }, { status: 404 });
    }
    return HttpResponse.json(team);
  }),

  http.put('/api/Team/update-team/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    console.log('🔧 [MSW] PUT /api/Team/update-team', { id, ...body });
    const index = mockTeams.findIndex(t => t.id === id);
    if (index > -1) {
      mockTeams[index] = { ...mockTeams[index], ...body };
    }
    return HttpResponse.json({ success: true });
  }),

  http.delete('/api/Team/delete-team/:id', ({ params }) => {
    const { id } = params;
    console.log('🔧 [MSW] DELETE /api/Team/delete-team', id);
    const index = mockTeams.findIndex(t => t.id === id);
    if (index > -1) {
      mockTeams.splice(index, 1);
    }
    return HttpResponse.json({ success: true });
  }),

  // Habit API endpoints
  http.get('/api/Habit/get-habits', () => {
    console.log('🔧 [MSW] GET /api/Habit/get-habits');
    return HttpResponse.json(mockHabits);
  }),

  http.post('/api/Habit/add-habit', async ({ request }) => {
    const body = await request.json() as any;
    console.log('🔧 [MSW] POST /api/Habit/add-habit', body);
    const newHabit = {
      id: `880e8400-e29b-41d4-a716-${Date.now()}`,
      ...body
    };
    mockHabits.push(newHabit);
    return HttpResponse.json({ success: true });
  }),

  http.put('/api/Habit/update-habit/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    console.log('🔧 [MSW] PUT /api/Habit/update-habit', { id, ...body });
    const index = mockHabits.findIndex(h => h.id === id);
    if (index > -1) {
      mockHabits[index] = { ...mockHabits[index], ...body };
    }
    return HttpResponse.json({ success: true });
  }),

  http.delete('/api/Habit/delete-habit/:id', ({ params }) => {
    const { id } = params;
    console.log('🔧 [MSW] DELETE /api/Habit/delete-habit', id);
    const index = mockHabits.findIndex(h => h.id === id);
    if (index > -1) {
      mockHabits.splice(index, 1);
    }
    return HttpResponse.json({ success: true });
  }),

  http.put('/api/Habit/assign-worker', async ({ request }) => {
    const body = await request.json();
    console.log('🔧 [MSW] PUT /api/Habit/assign-worker', body);
    return HttpResponse.json({ success: true });
  }),

  // Devotional API endpoints
  http.post('/api/Devotional/upload-devotionals', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('File');
    console.log('🔧 [MSW] POST /api/Devotional/upload-devotionals', file);
    const newDevotional = {
      id: `aa0e8400-e29b-41d4-a716-${Date.now()}`,
      title: 'Uploaded Devotional',
      fileUrl: `https://mock.example.com/devotional-${Date.now()}.pdf`,
      uploadedAt: new Date().toISOString()
    };
    mockDevotionals.push(newDevotional);
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/Devotional/download/:id', ({ params }) => {
    const { id } = params;
    console.log('🔧 [MSW] GET /api/Devotional/download/:id', id);
    // Return mock file content
    return new HttpResponse('mock-devotional-content', {
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
  }),

  http.get('/api/Devotional/get-all-devotionals', () => {
    console.log('🔧 [MSW] GET /api/Devotional/get-all-devotionals');
    return HttpResponse.json(mockDevotionals);
  }),

  http.delete('/api/Devotional/delete-devotional/:id', ({ params }) => {
    const { id } = params;
    console.log('🔧 [MSW] DELETE /api/Devotional/delete-devotional', id);
    const index = mockDevotionals.findIndex(d => d.id === id);
    if (index > -1) {
      mockDevotionals.splice(index, 1);
    }
    return HttpResponse.json({ success: true });
  }),

  // Report API endpoints
  http.get('/api/Report/worker-activity-summary', ({ request }) => {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('isAdmin');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const teamName = url.searchParams.get('teamName');
    const departmentName = url.searchParams.get('departmentName');
    console.log('🔧 [MSW] GET /api/Report/worker-activity-summary', { isAdmin, startDate, endDate, teamName, departmentName });
    return HttpResponse.json(mockDashboardData);
  }),

  http.get('/api/Report/export-attendance', ({ request }) => {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('isAdmin');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const teamName = url.searchParams.get('teamName');
    const departmentName = url.searchParams.get('departmentName');
    console.log('🔧 [MSW] GET /api/Report/export-attendance', { isAdmin, startDate, endDate, teamName, departmentName });
    const csvContent = 'Date,Worker,Department,CheckIn\n2024-01-01,John Doe,Worship,09:00:00';
    return new HttpResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
      },
    });
  }),

  http.get('/api/Report/export-summary', ({ request }) => {
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('isAdmin');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    console.log('🔧 [MSW] GET /api/Report/export-summary', { isAdmin, startDate, endDate });
    const csvContent = 'Summary,Count\nTotal Workers,4\nTotal Departments,4\nTotal Teams,3';
    return new HttpResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
      },
    });
  }),

  // Barcode API endpoints
  http.get('/api/BarCode/generate-download-barcode/:workerId', ({ params }) => {
    const { workerId } = params;
    console.log('🔧 [MSW] GET /api/BarCode/generate-download-barcode', workerId);
    return new HttpResponse('mock-barcode-data', {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  }),

  http.put('/api/BarCode/assign-worker-barcode', ({ request }) => {
    const url = new URL(request.url);
    const qrCodeId = url.searchParams.get('qrCodeId');
    const workerId = url.searchParams.get('workerId');
    console.log('🔧 [MSW] PUT /api/BarCode/assign-worker-barcode', { qrCodeId, workerId });
    return HttpResponse.json({ success: true });
  }),

  http.delete('/api/BarCode/disable-worker-barcode/:workerId', ({ params }) => {
    const { workerId } = params;
    console.log('🔧 [MSW] DELETE /api/BarCode/disable-worker-barcode', workerId);
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/BarCode/get-worker-barcode/:qrCodeId', ({ params }) => {
    const { qrCodeId } = params;
    console.log('🔧 [MSW] GET /api/BarCode/get-worker-barcode', qrCodeId);
    return HttpResponse.json(mockWorkers[0]); // Return first worker as mock
  }),
];