import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validasi sesi token saat aplikasi pertama kali dimuat
  useEffect(() => {
    async function validateSession() {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.success && response.data) {
          setUser(response.data);
          sessionStorage.setItem('auth_user', JSON.stringify(response.data));
        }
      } catch (err) {
        console.warn('[AUTH SESSION] Sesi token tidak valid atau kedaluwarsa:', err.message);
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
        setUser(null);
      } finally {
        setInitializing(false);
      }
    }

    validateSession();

    // Event listener untuk auto logout saat token 401
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(username, password);

      if (response.success && response.data?.token) {
        const { token, user: userData } = response.data;

        // Simpan token & profil aman di sessionStorage
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('auth_user', JSON.stringify(userData));

        setUser(userData);
        setLoading(false);
        return { success: true, user: userData };
      }

      setLoading(false);
      return { success: false, message: response.message || 'Login gagal.' };
    } catch (err) {
      setLoading(false);
      const errMsg = err.message || 'Username atau password salah.';
      setError(errMsg);

      // Tangani akun yang masih berstatus menunggu persetujuan
      if (err.data?.status_akun === 'menunggu' || err.status === 403) {
        return {
          success: false,
          status_akun: 'menunggu',
          message: errMsg,
          data: err.data,
        };
      }

      return {
        success: false,
        status_akun: err.data?.status_akun || null,
        message: errMsg,
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    setUser(null);
    setError('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        initializing,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
};
