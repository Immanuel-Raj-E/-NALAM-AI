import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('nalamToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nalamToken');
      localStorage.removeItem('nalamUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// Patients
export const patientAPI = {
  getAll: (params) => API.get('/patients', { params }),
  getOne: (id) => API.get(`/patients/${id}`),
  create: (data) => API.post('/patients', data),
  update: (id, data) => API.put(`/patients/${id}`, data),
  delete: (id) => API.delete(`/patients/${id}`),
  getStats: () => API.get('/patients/stats'),
};

// Health Records
export const healthRecordAPI = {
  getByPatient: (patientId) => API.get(`/health-records/patient/${patientId}`),
  create: (patientId, data) => API.post(`/health-records/patient/${patientId}`, data),
  update: (id, data) => API.put(`/health-records/${id}`, data),
  delete: (id) => API.delete(`/health-records/${id}`),
};

// Prescriptions
export const prescriptionAPI = {
  getAll: (params) => API.get('/prescriptions', { params }),
  getOne: (id) => API.get(`/prescriptions/${id}`),
  create: (formData) => API.post('/prescriptions', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/prescriptions/${id}`),
};

// Medical Reports
export const reportAPI = {
  getAll: (params) => API.get('/reports', { params }),
  getOne: (id) => API.get(`/reports/${id}`),
  create: (formData) => API.post('/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/reports/${id}`),
};

// Appointments
export const appointmentAPI = {
  getAll: (params) => API.get('/appointments', { params }),
  getOne: (id) => API.get(`/appointments/${id}`),
  create: (data) => API.post('/appointments', data),
  update: (id, data) => API.put(`/appointments/${id}`, data),
  delete: (id) => API.delete(`/appointments/${id}`),
  getUpcomingCount: () => API.get('/appointments/upcoming-count'),
};

// Medicines
export const medicineAPI = {
  getAll: (params) => API.get('/medicines', { params }),
  getOne: (id) => API.get(`/medicines/${id}`),
  create: (data) => API.post('/medicines', data),
  update: (id, data) => API.put(`/medicines/${id}`, data),
  delete: (id) => API.delete(`/medicines/${id}`),
  getLowStockCount: () => API.get('/medicines/low-stock-count'),
};

// Vaccinations
export const vaccinationAPI = {
  getAll: (params) => API.get('/vaccinations', { params }),
  create: (data) => API.post('/vaccinations', data),
  update: (id, data) => API.put(`/vaccinations/${id}`, data),
  delete: (id) => API.delete(`/vaccinations/${id}`),
};

// Reminders
export const reminderAPI = {
  getAll: (params) => API.get('/reminders', { params }),
  create: (data) => API.post('/reminders', data),
  update: (id, data) => API.put(`/reminders/${id}`, data),
  delete: (id) => API.delete(`/reminders/${id}`),
};

// AI
export const aiAPI = {
  symptomCheck: (data) => API.post('/ai/symptom-check', data),
  predictDisease: (data) => API.post('/ai/predict-disease', data),
  chat: (data) => API.post('/ai/chat', data),
  generatePrescription: (data) => API.post('/ai/generate-prescription', data),
};

// Doctors
export const doctorAPI = {
  getAll: (params) => API.get('/doctors', { params }),
};

// Hospitals
export const hospitalAPI = {
  getAll: (params) => API.get('/hospitals', { params }),
  getOne: (id) => API.get(`/hospitals/${id}`),
};

export default API;
