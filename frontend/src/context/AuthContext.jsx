import { createContext, useContext, useState, useEffect } from 'react';
import { verifySession, loginAdmin, logoutAdmin } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        try {
            const res = await verifySession();
            if (res.data.authenticated) {
                setAdmin(res.data.admin);
            } else {
                setAdmin(null);
            }
        } catch {
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = async (email, password) => {
        const res = await loginAdmin(email, password);
        if (res.data.message === 'Login successful') {
            await checkSession();
            return { success: true };
        }
        return { success: false, message: res.data.message };
    };

    const logout = async () => {
        await logoutAdmin();
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, loading, login, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
