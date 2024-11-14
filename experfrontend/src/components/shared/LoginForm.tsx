'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';

interface RegisterFormProps {
    onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);

        try {
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            await login(email, password, rememberMe);
            onClose();
            router.push('/'); // Redirect to home page after successful login
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to login');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative">
            <button
                onClick={onClose}
                className="absolute top-0 right-0 text-gray-500 hover:text-red-500"
            >
                &times;
            </button>
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

            <div className="flex items-center">
                <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="mr-2"
                />
                <label htmlFor="rememberMe">Remember Me</label>
            </div>
        
            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
                {loading ? 'Logging in...' : 'Log In'}
            </button>
            </form>
        </div>
      );
}