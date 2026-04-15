import { useState } from 'react';
import { useAdminUIStore } from '../../store/useAdminUIStore';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAdminUIStore((state) => state.setAuth);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setGoogleLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      if (data.user.role === 'USER') {
        throw new Error('Access Denied: You do not have permission to access the admin portal.');
      }

      setAuth(data.user, data.access_token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.user.role === 'USER') {
        throw new Error('Access Denied: You do not have permission to access the admin portal.');
      }

      setAuth(data.user, data.access_token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    googleLoading,
    error,
    setError,
    handleGoogleSuccess,
    handleSubmit
  };
};
