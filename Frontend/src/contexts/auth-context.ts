import { createContext, useContext } from 'react';
import type { User } from '../api';

export interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>');
    return ctx;
}
