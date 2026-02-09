import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  console.log(`[API] Request Interceptor: ${config.method?.toUpperCase()} ${config.url}`);
  try {
    console.log('[API] Getting session...');
    const { data } = await supabase.auth.getSession();
    console.log('[API] Session retrieved', !!data.session);
    const token = data.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('[API] Interceptor error:', err);
  }
  return config;
}, (error) => {
  console.error('[API] Request Error:', error);
  return Promise.reject(error);
});

// Handle 401 response (logout)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  },
);

export default api;
