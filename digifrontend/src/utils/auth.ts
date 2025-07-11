const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

// API call helper
export const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || 'An error occurred' };
    }
    
    return { data };
  } catch (error) {
    console.error('API call failed:', error);
    return { error: 'Network error' };
  }
};

// Auth API functions
export const login = async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
  return apiCall<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<ApiResponse> => {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    }),
  });
};

export const getProfile = async (): Promise<ApiResponse<User>> => {
  return apiCall<User>('/auth/profile');
};

export const updateProfile = async (
  firstName: string,
  lastName: string
): Promise<ApiResponse<User>> => {
  return apiCall<User>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
    }),
  });
};

export const logout = (): void => {
  removeToken();
  window.location.href = '/login';
};
