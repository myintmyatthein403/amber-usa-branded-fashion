import React from 'react';
import { ShoppingBag, Lock, Mail, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  googleLoading: boolean;
  error: string;
  setError: (error: string) => void;
  handleGoogleSuccess: (credentialResponse: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
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
}) => {
  return (
    <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl border border-border shadow-xl">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
          <ShoppingBag size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Amber Admin</h1>
        <p className="text-muted-foreground">Sign in to manage your Myanmar Heritage store</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="admin@amber.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground h-10 px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
        </button>

        <div className="relative py-2 flex items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase tracking-widest">Or</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            useOneTap
            theme="outline"
            shape="rectangular"
            width="100%"
          />
        </div>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Protected by Amber Brand Fashion Security. 2026.
      </p>
    </div>
  );
};
