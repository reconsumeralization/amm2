'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Settings, BookOpen, Star, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepData {
  id: string;
  title: string;
  description?: string;
  stepType: string;
  isRequired: boolean;
  isSkippable: boolean;
  status: 'pending' | 'current' | 'completed' | 'skipped';
  estimatedDuration?: number;
  content?: {
    heading?: string;
    subheading?: string;
    body?: any;
    media?: any;
    actionButton?: {
      text: string;
      variant: string;
    };
  };
}

interface OnboardingStepProps {
  step: OnboardingStepData;
  onComplete: () => void;
  onDataChange?: (data: any) => void;
  className?: string;
}

export function OnboardingStep({
  step,
  onComplete,
  onDataChange,
  className
}: OnboardingStepProps) {
  const [stepData, setStepData] = useState<any>({});
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate step based on requirements
  useEffect(() => {
    const validateStep = () => {
      switch (step.stepType) {
        case 'profile':
          return stepData.name && stepData.email;
        case 'preferences':
          return Object.keys(stepData).length > 0;
        case 'booking':
          return stepData.hasViewedBookings !== undefined;
        case 'services':
          return stepData.hasViewedServices !== undefined;
        case 'team':
          return stepData.hasViewedTeam !== undefined;
        case 'loyalty':
          return stepData.hasViewedLoyalty !== undefined;
        case 'settings':
          return stepData.hasConfiguredSettings !== undefined;
        case 'first-booking':
          return stepData.hasMadeFirstBooking !== undefined;
        case 'staff-schedule':
          return stepData.hasViewedSchedule !== undefined;
        case 'admin-dashboard':
          return stepData.hasViewedDashboard !== undefined;
        case 'business-setup':
          return stepData.hasConfiguredBusiness !== undefined;
        default:
          return true;
      }
    };

    setIsValid(validateStep());
  }, [step.stepType, stepData]);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...stepData, [field]: value };
    setStepData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      if (onDataChange) {
        await onDataChange(stepData);
      }
      onComplete();
    } catch (error) {
      console.error('Error completing step:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step.stepType) {
      case 'welcome':
        return <WelcomeStep onDataChange={handleInputChange} />;

      case 'profile':
        return <ProfileStep data={stepData} onChange={handleInputChange} />;

      case 'preferences':
        return <PreferencesStep data={stepData} onChange={handleInputChange} />;

      case 'booking':
        return <BookingTutorialStep data={stepData} onChange={handleInputChange} />;

      case 'services':
        return <ServicesOverviewStep data={stepData} onChange={handleInputChange} />;

      case 'team':
        return <TeamIntroductionStep data={stepData} onChange={handleInputChange} />;

      case 'loyalty':
        return <LoyaltyProgramStep data={stepData} onChange={handleInputChange} />;

      case 'settings':
        return <SettingsStep data={stepData} onChange={handleInputChange} />;

      case 'first-booking':
        return <FirstBookingStep data={stepData} onChange={handleInputChange} />;

      case 'staff-schedule':
        return <StaffScheduleStep data={stepData} onChange={handleInputChange} />;

      case 'admin-dashboard':
        return <AdminDashboardStep data={stepData} onChange={handleInputChange} />;

      case 'business-setup':
        return <BusinessSetupStep data={stepData} onChange={handleInputChange} />;

      default:
        return <GenericStep step={step} data={stepData} onChange={handleInputChange} />;
    }
  };

  const getStepIcon = () => {
    switch (step.stepType) {
      case 'welcome':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'profile':
        return <User className="h-6 w-6 text-blue-500" />;
      case 'preferences':
        return <Settings className="h-6 w-6 text-purple-500" />;
      case 'booking':
        return <Calendar className="h-6 w-6 text-orange-500" />;
      case 'services':
        return <BookOpen className="h-6 w-6 text-indigo-500" />;
      case 'team':
        return <User className="h-6 w-6 text-teal-500" />;
      case 'loyalty':
        return <Star className="h-6 w-6 text-yellow-500" />;
      case 'settings':
        return <Settings className="h-6 w-6 text-gray-500" />;
      default:
        return <CheckCircle className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getStepIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{step.title}</CardTitle>
              {!step.isRequired && (
                <Badge variant="outline">Optional</Badge>
              )}
              {step.estimatedDuration && (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  ~{Math.ceil(step.estimatedDuration / 60)}min
                </Badge>
              )}
            </div>
            {step.description && (
              <p className="text-muted-foreground">{step.description}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-6">
          {step.content?.heading && (
            <h3 className="text-lg font-semibold">{step.content.heading}</h3>
          )}

          {step.content?.subheading && (
            <p className="text-muted-foreground">{step.content.subheading}</p>
          )}

          {renderStepContent()}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleComplete}
              disabled={!isValid || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing...
                </>
              ) : (
                step.content?.actionButton?.text || 'Continue'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Individual step components
function WelcomeStep({ onDataChange }: { onDataChange: (field: string, value: any) => void }) {
  return (
    <div className="text-center space-y-4">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-bold">Welcome to ModernMen!</h3>
      <p className="text-lg text-muted-foreground">
        We're excited to have you join our community. Let's get you set up with everything you need.
      </p>
      <div className="bg-muted/50 rounded-lg p-4 mt-6">
        <p className="text-sm">
          This quick setup will take about 5-10 minutes and will help us personalize your experience.
        </p>
      </div>
    </div>
  );
}

function ProfileStep({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={data.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={data.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={data.dateOfBirth || ''}
          onChange={(e) => onChange('dateOfBirth', e.target.value)}
        />
      </div>
    </div>
  );
}

function PreferencesStep({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium">Hair Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Hair Type</Label>
            <RadioGroup
              value={data.hairType || ''}
              onValueChange={(value) => onChange('hairType', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="straight" id="straight" />
                <Label htmlFor="straight">Straight</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wavy" id="wavy" />
                <Label htmlFor="wavy">Wavy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="curly" id="curly" />
                <Label htmlFor="curly">Curly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="coily" id="coily" />
                <Label htmlFor="coily">Coily</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Hair Length</Label>
            <RadioGroup
              value={data.hairLength || ''}
              onValueChange={(value) => onChange('hairLength', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short" id="short" />
                <Label htmlFor="short">Short</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="long" id="long" />
                <Label htmlFor="long">Long</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Beard Style</h4>
        <RadioGroup
          value={data.beardStyle || ''}
          onValueChange={(value) => onChange('beardStyle', value)}
        >
          <div className="grid grid-cols-2 gap-2">
            {['Clean Shaven', 'Stubble', 'Short Beard', 'Long Beard', 'Goatee', 'Mustache'].map((style) => (
              <div key={style} className="flex items-center space-x-2">
                <RadioGroupItem value={style.toLowerCase().replace(' ', '-')} id={style.toLowerCase().replace(' ', '-')} />
                <Label htmlFor={style.toLowerCase().replace(' ', '-')}>{style}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Communication Preferences</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailNotifications"
              checked={data.emailNotifications || false}
              onCheckedChange={(checked) => onChange('emailNotifications', checked)}
            />
            <Label htmlFor="emailNotifications">Email notifications for appointments</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="smsNotifications"
              checked={data.smsNotifications || false}
              onCheckedChange={(checked) => onChange('smsNotifications', checked)}
            />
            <Label htmlFor="smsNotifications">SMS notifications for appointments</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="marketingEmails"
              checked={data.marketingEmails || false}
              onCheckedChange={(checked) => onChange('marketingEmails', checked)}
            />
            <Label htmlFor="marketingEmails">Marketing emails and promotions</Label>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingTutorialStep({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">How to Book an Appointment</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click on "Book Appointment" from the main menu</li>
          <li>Select your preferred service</li>
          <li>Choose a date and time that works for you</li>
          <li>Confirm your booking details</li>
          <li>Receive confirmation via email/SMS</li>
        </ol>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasViewedBookings"
          checked={data.hasViewedBookings || false}
          onCheckedChange={(checked) => onChange('hasViewedBookings', checked)}
        />
        <Label htmlFor="hasViewedBookings">I understand how to book appointments</Label>
      </div>
    </div>
  );
}

function ServicesOverviewStep({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Hair Services</h4>
          <ul className="text-sm space-y-1">
            <li>• Haircuts & Styling</li>
            <li>• Hair Coloring</li>
            <li>• Hair Treatments</li>
            <li>• Shampoo & Conditioning</li>
          </ul>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Beard Services</h4>
          <ul className="text-sm space-y-1">
            <li>• Beard Trims</li>
            <li>• Beard Shaping</li>
            <li>• Hot Towel Shave</li>
            <li>• Beard Coloring</li>
          </ul>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasViewedServices"
          checked={data.hasViewedServices || false}
          onCheckedChange={(checked) => onChange('hasViewedServices', checked)}
        />
        <Label htmlFor="hasViewedServices">I have reviewed the available services</Label>
      </div>
    </div>
  );
}

function TeamIntroductionStep({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium mb-2">Meet Our Expert Team</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Our skilled barbers are here to provide you with the best grooming experience.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasViewedTeam"
          checked={data.hasViewedTeam || false}
          onCheckedChange={(checked) => onChange('hasViewedTeam', checked)}
        />
        <Label htmlFor="hasViewedTeam">I have been introduced to the team</Label>
      </div>
    </div>
  );
}

function LoyaltyProgramStep({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
        <h4 className="font-medium mb-2 flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-2" />
          Loyalty Program Benefits
        </h4>
        <ul className="text-sm space-y-1">
          <li>• Earn points on every service</li>
          <li>• Redeem points for discounts</li>
          <li>• Unlock exclusive member benefits</li>
          <li>• Birthday special offers</li>
        </ul>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasViewedLoyalty"
          checked={data.hasViewedLoyalty || false}
          onCheckedChange={(checked) => onChange('hasViewedLoyalty', checked)}
        />
        <Label htmlFor="hasViewedLoyalty">I want to join the loyalty program</Label>
      </div>
    </div>
  );
}

function SettingsStep({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Configure Your Preferences</h4>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preferredLocation">Preferred Location</Label>
          <Select value={data.preferredLocation || ''} onValueChange={(value) => onChange('preferredLocation', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your preferred location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Main Location</SelectItem>
              <SelectItem value="downtown">Downtown</SelectItem>
              <SelectItem value="mall">Mall Location</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredTime">Preferred Time of Day</Label>
          <Select value={data.preferredTime || ''} onValueChange={(value) => onChange('preferredTime', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your preferred time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
              <SelectItem value="evening">Evening (5PM - 9PM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasConfiguredSettings"
          checked={data.hasConfiguredSettings || false}
          onCheckedChange={(checked) => onChange('hasConfiguredSettings', checked)}
        />
        <Label htmlFor="hasConfiguredSettings">I have configured my preferences</Label>
      </div>
    </div>
  );
}

function FirstBookingStep({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium mb-2">Ready for Your First Booking?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Take the next step and book your first appointment with us.
        </p>
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm mb-2">As a new customer, you'll receive:</p>
        <ul className="text-sm space-y-1">
          <li>• 10% discount on your first service</li>
          <li>• Complimentary consultation</li>
          <li>• Welcome gift with your first visit</li>
        </ul>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasMadeFirstBooking"
          checked={data.hasMadeFirstBooking || false}
          onCheckedChange={(checked) => onChange('hasMadeFirstBooking', checked)}
        />
        <Label htmlFor="hasMadeFirstBooking">I have booked my first appointment</Label>
      </div>
    </div>
  );
}

function StaffScheduleStep({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Your Schedule Overview</h4>
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm mb-2">You can view and manage:</p>
        <ul className="text-sm space-y-1">
          <li>• Your daily schedule</li>
          <li>• Upcoming appointments</li>
          <li>• Time off requests</li>
          <li>• Schedule preferences</li>
        </ul>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasViewedSchedule"
          checked={data.hasViewedSchedule || false}
          onCheckedChange={(checked) => onChange('hasViewedSchedule', checked)}
        />
        <Label htmlFor="hasViewedSchedule">I have reviewed my schedule</Label>
      </div>
    </div>
  );
}

function AdminDashboardStep({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Admin Dashboard Features</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <h5 className="font-medium text-sm mb-2">Business Management</h5>
          <ul className="text-xs space-y-1">
            <li>• Staff management</li>
            <li>• Service configuration</li>
            <li>• Business settings</li>
          </ul>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <h5 className="font-medium text-sm mb-2">Analytics & Reports</h5>
          <ul className="text-xs space-y-1">
            <li>• Revenue tracking</li>
            <li>• Customer insights</li>
            <li>• Performance metrics</li>
          </ul>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasViewedDashboard"
          checked={data.hasViewedDashboard || false}
          onCheckedChange={(checked) => onChange('hasViewedDashboard', checked)}
        />
        <Label htmlFor="hasViewedDashboard">I have explored the admin dashboard</Label>
      </div>
    </div>
  );
}

function BusinessSetupStep({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Business Configuration</h4>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            value={data.businessName || ''}
            onChange={(e) => onChange('businessName', e.target.value)}
            placeholder="Enter your business name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessHours">Business Hours</Label>
          <Textarea
            id="businessHours"
            value={data.businessHours || ''}
            onChange={(e) => onChange('businessHours', e.target.value)}
            placeholder="Enter your business hours"
            rows={3}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasConfiguredBusiness"
          checked={data.hasConfiguredBusiness || false}
          onCheckedChange={(checked) => onChange('hasConfiguredBusiness', checked)}
        />
        <Label htmlFor="hasConfiguredBusiness">I have configured business settings</Label>
      </div>
    </div>
  );
}

function GenericStep({ step, data, onChange }: { step: OnboardingStepData; data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          This is a custom onboarding step. Please complete the required information below.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={data.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Enter any additional information..."
          rows={3}
        />
      </div>
    </div>
  );
}
