import axios from 'axios';

const api = axios.create({
  baseURL: '/',          // Vite proxy forwards /api/* → http://localhost:8000
  withCredentials: true, // keep cookies working for auth
});

export default api;
