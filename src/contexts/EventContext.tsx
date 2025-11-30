import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { EventBasics, EventRequirements, EventSpecialConditions, EventPlan, Task } from '@/types/event';
import { syncEventsToJson, saveEventsToLocalStorage } from '@/lib/events';

interface EventData {
  plan: EventPlan | null;
  selectedVendors: string[];
  tasks: Task[];
  invitedPeople: number[]; // Array of employee No (IDs)
}

interface EventContextType {
  // Current event management
  currentEventId: string | null;
  setCurrentEventId: (id: string | null) => void;
  events: Map<string, EventData>;
  createEvent: (plan: EventPlan) => string;
  deleteEvent: (id: string) => void;
  
  // Current event data (convenience getters)
  currentPlan: EventPlan | null;
  setCurrentPlan: (plan: EventPlan | null) => void;
  updateEventPlan: (plan: EventPlan) => void;
  selectedVendors: string[];
  setSelectedVendors: (vendors: string[] | ((prev: string[]) => string[])) => void;
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  invitedPeople: number[];
  setInvitedPeople: (people: number[] | ((prev: number[]) => number[])) => void;
  
  // Onboarding state
  currentStep: number;
  setCurrentStep: (step: number) => void;
  eventBasics: Partial<EventBasics>;
  setEventBasics: (basics: Partial<EventBasics>) => void;
  eventRequirements: Partial<EventRequirements>;
  setEventRequirements: (requirements: Partial<EventRequirements>) => void;
  eventSpecialConditions: Partial<EventSpecialConditions>;
  setEventSpecialConditions: (conditions: Partial<EventSpecialConditions>) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Multi-event management
  const [events, setEvents] = useState<Map<string, EventData>>(new Map());
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  
  // Onboarding state
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
  const [isGenerating, setIsGenerating] = useState(false);

  // Load events from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const eventsMap = new Map<string, EventData>();
        Object.entries(parsed).forEach(([id, data]: [string, any]) => {
          const plan = data.plan ? {
            ...data.plan,
            createdAt: new Date(data.plan.createdAt),
            updatedAt: new Date(data.plan.updatedAt),
            // Ensure specialConditions has proper structure
            specialConditions: data.plan.specialConditions ? {
              speakerNames: data.plan.specialConditions.speakerNames || [],
              dietaryRestrictions: data.plan.specialConditions.dietaryRestrictions || [],
              equipment: data.plan.specialConditions.equipment || [],
              preferredVendors: data.plan.specialConditions.preferredVendors || [],
            } : {
              speakerNames: [],
              dietaryRestrictions: [],
              equipment: [],
              preferredVendors: [],
            },
          } : null;
          eventsMap.set(id, {
            plan,
            selectedVendors: data.selectedVendors || [],
            tasks: (data.tasks || []).map((t: any) => ({ ...t, dueDate: new Date(t.dueDate) })),
            invitedPeople: data.invitedPeople || [],
          });
        });
        setEvents(eventsMap);
        const currentId = localStorage.getItem('currentEventId');
        if (currentId && eventsMap.has(currentId)) {
          setCurrentEventId(currentId);
        } else if (eventsMap.size > 0) {
          setCurrentEventId(Array.from(eventsMap.keys())[0]);
        }
      } catch (e) {
        console.error('Failed to load events:', e);
      }
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.size > 0) {
      try {
        const toSave: Record<string, any> = {};
        events.forEach((data, id) => {
          toSave[id] = {
            plan: data.plan,
            selectedVendors: data.selectedVendors,
            tasks: data.tasks,
            invitedPeople: data.invitedPeople,
          };
        });
        localStorage.setItem('events', JSON.stringify(toSave));
        if (currentEventId) {
          localStorage.setItem('currentEventId', currentEventId);
        }
        
        // Also sync to events.json format (with error handling)
        try {
          const copilotEvents = syncEventsToJson(events);
          saveEventsToLocalStorage(copilotEvents);
        } catch (syncError) {
          console.error('Error syncing events to JSON format:', syncError);
          // Don't crash the app if sync fails
        }
      } catch (error) {
        console.error('Error saving events to localStorage:', error);
        // Don't crash the app if localStorage fails
      }
    }
  }, [events, currentEventId]);

  // Get current event data
  const currentEvent = currentEventId ? events.get(currentEventId) : null;
  const currentPlan = currentEvent?.plan || null;
  const selectedVendors = currentEvent?.selectedVendors || [];
  const tasks = currentEvent?.tasks || [];
  const invitedPeople = currentEvent?.invitedPeople || [];

  // Create new event
  const createEvent = (plan: EventPlan): string => {
    const id = plan.id || `event-${Date.now()}`;
    const newEvent: EventData = {
      plan,
      selectedVendors: [],
      tasks: [],
      invitedPeople: [],
    };
    setEvents(prev => new Map(prev).set(id, newEvent));
    setCurrentEventId(id);
    return id;
  };

  // Delete event
  const deleteEvent = (id: string) => {
    setEvents(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    if (currentEventId === id) {
      const remaining = Array.from(events.keys()).filter(eid => eid !== id);
      setCurrentEventId(remaining.length > 0 ? remaining[0] : null);
    }
  };

  // Update current plan
  const setCurrentPlan = (plan: EventPlan | null) => {
    if (!currentEventId) return;
    setEvents(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(currentEventId) || { plan: null, selectedVendors: [], tasks: [], invitedPeople: [] };
      newMap.set(currentEventId, { ...current, plan });
      return newMap;
    });
  };

  // Update event plan (alias for setCurrentPlan for clarity)
  const updateEventPlan = (plan: EventPlan) => {
    setCurrentPlan(plan);
  };

  // Update selected vendors
  const setSelectedVendors = (vendors: string[] | ((prev: string[]) => string[])) => {
    if (!currentEventId) return;
    setEvents(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(currentEventId) || { plan: null, selectedVendors: [], tasks: [], invitedPeople: [] };
      const newVendors = typeof vendors === 'function' ? vendors(current.selectedVendors) : vendors;
      newMap.set(currentEventId, { ...current, selectedVendors: newVendors });
      return newMap;
    });
  };

  // Update tasks
  const setTasks = (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
    if (!currentEventId) return;
    setEvents(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(currentEventId) || { plan: null, selectedVendors: [], tasks: [], invitedPeople: [] };
      const updatedTasks = typeof newTasks === 'function' ? newTasks(current.tasks) : newTasks;
      newMap.set(currentEventId, { ...current, tasks: updatedTasks });
      return newMap;
    });
  };

  // Update invited people
  const setInvitedPeople = (people: number[] | ((prev: number[]) => number[])) => {
    if (!currentEventId) return;
    setEvents(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(currentEventId) || { plan: null, selectedVendors: [], tasks: [], invitedPeople: [] };
      const newPeople = typeof people === 'function' ? people(current.invitedPeople) : people;
      newMap.set(currentEventId, { ...current, invitedPeople: newPeople });
      return newMap;
    });
  };

  return (
    <EventContext.Provider
      value={{
        currentEventId,
        setCurrentEventId,
        events,
        createEvent,
        deleteEvent,
        currentPlan,
        setCurrentPlan,
        updateEventPlan,
        selectedVendors,
        setSelectedVendors,
        tasks,
        setTasks,
        invitedPeople,
        setInvitedPeople,
        currentStep,
        setCurrentStep,
        eventBasics,
        setEventBasics,
        eventRequirements,
        setEventRequirements,
        eventSpecialConditions,
        setEventSpecialConditions,
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
