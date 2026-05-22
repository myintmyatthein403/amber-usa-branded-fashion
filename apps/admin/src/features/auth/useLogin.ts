import { useState } from 'react';
import { useAdminUIStore } from '../../store/useAdminUIStore';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAdminUIStore((state) => state.setAuth);

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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Login failed');
      }

      const user = responseData.data?.user;
      const token = responseData.data?.access_token;

      if (!user) {
        throw new Error('Invalid response structure: User data missing.');
      }

      if (user.role === 'USER') {
        throw new Error('Access Denied: You do not have permission to access the admin portal.');
      }

      setAuth(user, token);
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
    error,
    setError,
    handleSubmit
  };
};
