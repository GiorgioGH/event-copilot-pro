import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EventBasics, EventRequirements, EventSpecialConditions, EventPlan } from '@/types/event';

interface EventContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  eventBasics: Partial<EventBasics>;
  setEventBasics: (basics: Partial<EventBasics>) => void;
  eventRequirements: Partial<EventRequirements>;
  setEventRequirements: (requirements: Partial<EventRequirements>) => void;
  eventSpecialConditions: Partial<EventSpecialConditions>;
  setEventSpecialConditions: (conditions: Partial<EventSpecialConditions>) => void;
  currentPlan: EventPlan | null;
  setCurrentPlan: (plan: EventPlan | null) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventBasics, setEventBasics] = useState<Partial<EventBasics>>({});
  const [eventRequirements, setEventRequirements] = useState<Partial<EventRequirements>>({
    includeLunch: true,
    accessibilityNeeded: false,
    timelineFlexibility: 50,
    preferredTimeframe: 'full-day',
    venuePreference: 'either',
  });
  const [eventSpecialConditions, setEventSpecialConditions] = useState<Partial<EventSpecialConditions>>({
    speakerNames: [],
    dietaryRestrictions: [],
    equipment: [],
    preferredVendors: [],
  });
  const [currentPlan, setCurrentPlan] = useState<EventPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <EventContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        eventBasics,
        setEventBasics,
        eventRequirements,
        setEventRequirements,
        eventSpecialConditions,
        setEventSpecialConditions,
        currentPlan,
        setCurrentPlan,
        isGenerating,
        setIsGenerating,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
