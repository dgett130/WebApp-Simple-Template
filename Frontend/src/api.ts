import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export interface User {
    username: string;
    email: string;
}

export const api = axios.create({ baseURL: API_URL });

// Allega il token a ogni richiesta (serve a /vehicles)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export function getErrorMessage(error: unknown, fallback = "Qualcosa e` andato storto. Riprova."): string {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            return 'Server non raggiungibile';
        }
        const detail = error.response.data?.detail;
        if (typeof detail === 'string') {
            return detail;
        }
        if (Array.isArray(detail) && detail[0]?.msg) {
            return detail[0].msg;
        }
    }
    return fallback;
}

export const loginUser =async (credentials: Record<string, string>) => {
    const params = new URLSearchParams(credentials);
    const response = await api.post<{ access_token: string }>('/auth/token', params);
    return response.data;
};

export const registerUser = async (userData: { username: string; email: string; password: string }) => {
    await api.post('/auth/register', userData);
};

export const fetchUserProfile = async (token: string) => {
    const response = await api.get<User>('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export default api;
