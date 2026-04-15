import React from 'react';
import { useLogin } from '../features/auth/useLogin';
import { LoginForm } from '../features/auth/LoginForm';

export const LoginPage: React.FC = () => {
  const {
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
  } = useLogin();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <LoginForm 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loading={loading}
        googleLoading={googleLoading}
        error={error}
        setError={setError}
        handleGoogleSuccess={handleGoogleSuccess}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};
