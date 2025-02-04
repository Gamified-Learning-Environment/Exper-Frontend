'use client'

import UserProfile from "@/components/shared/UserProfile";
import UserStats from "@/components/shared/UserStats";
import { useAuth } from '@/contexts/auth.context';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <UserProfile />
      <UserStats userId={user._id}/>
    </div>
  );
}