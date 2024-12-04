'use client'; // use client to import modules from the client folder, helps to avoid SSR issues

import { useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';

interface RegisterFormProps { // RegisterFormProps interface, defines props
  onClose: () => void;
}

export default function RegisterForm({ onClose }: RegisterFormProps) { // RegisterForm component, takes onClose as prop
  // State variables to keep track of error, loading, showPassword, passwordMatch status, router, register function
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  // Function to handle form submit, registers user
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget); // Get form data
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string; 

    if (password !== confirmPassword) { // Check if password and confirm password match
      setPasswordMatch(false);
      return;
    }

    setLoading(true);
    setError('');

    
    try { // Try to register user
      const userData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        username: formData.get('username') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        imageUrl: formData.get('imageUrl') as string || undefined, // Optional profile image URL
      };
      await register(userData); // Call register function from useAuth hook
      onClose();
      router.push('/'); // Redirect to home page after successful registration
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return ( // Return register form
    <div className="relative w-full max-w-md">
      <button
        onClick={onClose}
        className="absolute -right-4 -top-4 rounded-full bg-white/10 p-2 text-2xl text-gray-500 transition hover:rotate-90 hover:text-purple-500"
      >
        ×
      </button>
      
      {/* Register form with fields */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-purple-900">Join the Game! 🎮</h2>
        <p className="text-sm text-gray-600">Create your player profile</p>
      </div>

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

        { /* Confirm Password field */ }
        <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-900">
              Confirm Password
            </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              className={`w-full rounded-lg border p-2 pr-10 shadow-inner focus:outline-none focus:ring-2 ${
                passwordMatch 
                  ? 'border-purple-100 focus:border-purple-500 focus:ring-purple-500/20' 
                  : 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              }`}
            />
            {!passwordMatch && ( // Show error message if passwords do not match
              <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-purple-900">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-purple-900">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="w-full rounded-lg border border-purple-100 p-2 shadow-inner focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-purple-900">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="w-full rounded-lg border border-purple-100 p-2 shadow-inner focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-purple-900">
            Profile Image URL (optional)
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            className="w-full rounded-lg border border-purple-100 p-2 shadow-inner focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full transform rounded-full bg-gradient-to-r from-blue-500 to-red-500 py-2 font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl disabled:opacity-70"
        >
          {loading ? '🎲 Creating account...' : '🎮 Create Account'}
        </button>
      </form>
    </div>
  );
}