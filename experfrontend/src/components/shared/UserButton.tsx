import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';

// User button props for user data and sign out function
interface UserButtonProps {
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
  onSignOut: () => void;
}

export default function UserButton({ user, onSignOut }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img
            src={user.imageUrl || '/assets/images/default-avatar.png'}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm font-medium hidden md:block">
          {user.username}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                onSignOut();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}