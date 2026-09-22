const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('educontrol_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  login: async (email: string, pass: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  // Dashboard
  getDashboardMetrics: async (date?: string) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await fetch(`${API_BASE_URL}/dashboard/metrics${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },

  // Students
  getStudents: async (params?: { search?: string; department?: string; grade?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department) query.append('department', params.department);
    if (params?.grade) query.append('grade', params.grade);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE_URL}/students?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  getStudentById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Student not found');
    return res.json();
  },

  createStudent: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to create student' }));
      throw new Error(err.message || 'Failed to create student');
    }
    return res.json();
  },

  updateStudent: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to update student' }));
      throw new Error(err.message || 'Failed to update student');
    }
    return res.json();
  },

  deleteStudent: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete student');
    return res.json();
  },

  getStudentDescriptors: async () => {
    const res = await fetch(`${API_BASE_URL}/students/descriptors`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch face descriptors');
    return res.json();
  },

  // Cameras
  getCameras: async () => {
    const res = await fetch(`${API_BASE_URL}/cameras`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch cameras');
    return res.json();
  },

  createCamera: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/cameras`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create camera');
    return res.json();
  },

  updateCamera: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/cameras/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update camera');
    return res.json();
  },

  deleteCamera: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/cameras/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete camera');
    return res.json();
  },

  // Attendance
  getAttendanceRecords: async (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    studentId?: string;
    department?: string;
    grade?: string;
    status?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    const res = await fetch(`${API_BASE_URL}/attendance?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  recordDetection: async (data: {
    studentId?: string;
    studentCode?: string;
    cameraId: string;
    confidence: number;
    boundingBox?: number[];
    snapshotUrl?: string;
    actionType?: 'ARRIVAL' | 'DEPARTURE' | 'AUTO';
    lateCutoff?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/attendance/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to record detection');
    return res.json();
  },

  getRecentDetections: async (limit = 20) => {
    const res = await fetch(`${API_BASE_URL}/attendance/recent-detections?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch detections');
    return res.json();
  },

  updateAttendance: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update attendance');
    return res.json();
  },

  markAbsent: async (date?: string) => {
    const res = await fetch(`${API_BASE_URL}/attendance/mark-absent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ date }),
    });
    if (!res.ok) throw new Error('Failed to mark absent');
    return res.json();
  },
};
