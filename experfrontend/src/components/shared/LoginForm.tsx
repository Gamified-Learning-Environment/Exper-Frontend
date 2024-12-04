'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';

interface LoginFormProps { // LoginFormProps interface, defines props
    onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) { // LoginForm component, takes onClose as prop
    // State variables to keep track of error, loading, rememberMe and showPassword status, router, login function
    const router = useRouter();
    const { login } = useAuth(); // useAuth hook to access login function
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false); // Remember me checkbox
    const [showPassword, setShowPassword] = useState(false); // Show password checkbox

    // Function to handle form submit, logs in user
    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        // Get form data
        const formData = new FormData(event.currentTarget); 

        try { // Try to login user
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            await login(email, password, rememberMe); // Call login function from useAuth hook
            onClose();
            router.push('/'); // Redirect to home page after successful login
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to login');
        } finally {
            setLoading(false);
        }
    }

    return ( // Return login form
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute -right-4 -top-4 rounded-full bg-white/10 p-2 text-2xl text-gray-500 transition hover:rotate-90 hover:text-purple-500"
        >
          ×
        </button>
          
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-purple-900">Welcome Back! 🎮</h2>
          <p className="text-sm text-gray-600">Ready to continue your journey?</p>
        </div>

        {/* Login form with fields */}
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-purple-900">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-purple-100 p-2 shadow-inner focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
         
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-purple-900">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-lg border border-purple-100 p-2 pr-10 shadow-inner focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-500"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Remember Me checkbox */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="rememberMe" className="text-sm text-purple-900">
                Remember Me
              </label>
            </div>

            <button
              type="button"
              onClick={() => router.push('/forgot-password')} // Redirect to forgot password page
              className="text-sm text-purple-600 hover:text-purple-500 hover:underline"
            >
              Forgot Password? 🤔
            </button>
          </div>

          {/* Submit button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full transform rounded-full bg-gradient-to-r from-blue-500 to-red-500 py-2 font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl disabled:opacity-70"
          >
            {loading ? '🎲 Logging in...' : '🎮 Log In'} 
          </button>
        </form>
      </div>
  );
}