'use client';

import PreferencesForm from '@/components/shared/PreferencesForm';

export default function PreferencesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Quiz Preferences</h1>
      <PreferencesForm />
    </div>
  );
}