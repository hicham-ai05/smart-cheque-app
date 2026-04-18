import axios from 'axios';

const api = axios.create({
  baseURL: 'https://hicham-smart-ai-api-99.loca.lt/api',
});

// Assuming a hardcoded companyId for testing/development
// In a real scenario, this would come from an auth context or local storage after login
const DEV_COMPANY_ID = 'dev-tenant-1'; 

api.interceptors.request.use((config) => {
  // Inject x-company-id header for all requests to satisfy the backend tenant requirement
  config.headers['x-company-id'] = localStorage.getItem('companyId') || DEV_COMPANY_ID;
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  return config;
});

export default api;
