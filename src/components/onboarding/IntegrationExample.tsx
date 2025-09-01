// Example: How to integrate the onboarding system into your app

import React from 'react';
import { OnboardingTrigger, OnboardingWizard } from '@/components/onboarding';
import { useAuth } from '@/hooks/useAuth';

// 1. Add to your main layout (automatic triggering)
export function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <>
      {children}

      {/* This will automatically show onboarding for new users */}
      {user && (
        <OnboardingTrigger
          userId={user.id}
          userRole={user.role}
          isNewUser={user.isNewUser}
          autoStart={true}
        />
      )}
    </>
  );
}

// 2. Add manual trigger button anywhere in your app
export function DashboardHeader() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  return (
    <div className="flex justify-between items-center">
      <h1>Dashboard</h1>

      <button
        onClick={() => setShowOnboarding(true)}
        className="bg-primary text-white px-4 py-2 rounded"
      >
        Complete Setup
      </button>

      <OnboardingWizard
        userId={user.id}
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          // Show success message or redirect
        }}
      />
    </div>
  );
}

// 3. Use the hook directly for custom implementations
export function CustomOnboardingPage() {
  const { user } = useAuth();
  const {
    status,
    progress,
    steps,
    currentStep,
    completeStep,
    startOnboarding
  } = useOnboarding(user.id);

  if (status === 'not-started') {
    return (
      <div className="text-center">
        <h1>Ready to get started?</h1>
        <button
          onClick={startOnboarding}
          className="bg-primary text-white px-6 py-3 rounded"
        >
          Start Onboarding
        </button>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="text-center">
        <h1>🎉 You're all set!</h1>
        <p>Welcome to ModernMen!</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Setup Progress</h1>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${progress?.progressPercentage || 0}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {progress?.completedCount || 0} of {progress?.totalSteps || 0} steps completed
        </p>
      </div>

      {currentStep && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{currentStep.title}</h2>

          {/* Render step content based on type */}
          <div className="mb-6">
            {currentStep.stepType === 'welcome' && (
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-lg mb-2">Welcome to ModernMen!</h3>
                <p>Let's get you set up...</p>
              </div>
            )}

            {currentStep.stepType === 'profile' && (
              <div>
                <h4>Tell us about yourself</h4>
                {/* Profile form would go here */}
                <p>Profile setup form...</p>
              </div>
            )}

            {/* Add more step types as needed */}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => completeStep(currentStep.id)}
              className="bg-primary text-white px-6 py-2 rounded"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 4. Add to specific pages for contextual onboarding
export function BookAppointmentPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Book an Appointment</h1>

      {/* Show booking-specific onboarding if user hasn't completed it */}
      <OnboardingTrigger
        userId={user.id}
        userRole={user.role}
        autoStart={false} // Manual trigger for specific context
      />

      {/* Rest of booking page */}
    </div>
  );
}
