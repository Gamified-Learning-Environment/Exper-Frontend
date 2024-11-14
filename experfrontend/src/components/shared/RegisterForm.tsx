// src/components/auth/RegisterForm.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    
    try {
      const userData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        username: formData.get('username') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        imageUrl: formData.get('imageUrl') as string || undefined,
      };

      await register(userData);
      router.push('/'); // Redirect to home page after successful registration
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="imageUrl">Profile Image URL (optional)</label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          className="w-full p-2 border rounded"
        />
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}