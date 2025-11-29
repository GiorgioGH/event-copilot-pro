import { EventPlan, CopilotEvent } from '@/types/event';

/**
 * Convert EventPlan to CopilotEvent format (for events.json)
 */
export function eventPlanToCopilotEvent(plan: EventPlan): CopilotEvent {
  // Safely access dateRange with null checks
  const dateRange = plan.basics?.dateRange;
  const startDate = dateRange?.start;
  
  // Handle date conversion safely
  let dateStr: string;
  let eventDate: Date;
  
  if (startDate) {
    // If startDate is a Date object, use it directly
    // If it's a string (from JSON), parse it
    const date = startDate instanceof Date ? startDate : new Date(startDate);
    if (!isNaN(date.getTime())) {
      dateStr = date.toISOString().split('T')[0];
      eventDate = date;
    } else {
      dateStr = new Date().toISOString().split('T')[0];
      eventDate = new Date();
    }
  } else {
    dateStr = new Date().toISOString().split('T')[0];
    eventDate = new Date();
  }
  
  // Determine status based on date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const status: 'future' | 'past' = eventDate >= today ? 'future' : 'past';

  // Valid event types - map to valid ones
  const validEventTypes = ['team-building', 'seminar', 'workshop', 'offsite', 'networking', 'company-dinner'];
  const eventType = plan.basics?.type && validEventTypes.includes(plan.basics.type) 
    ? plan.basics.type 
    : 'workshop';

  return {
    id: plan.id || `event-${Date.now()}`,
    title: plan.basics?.name || 'Untitled Event',
    type: eventType,
    date: dateStr,
    time: '10:00', // Default time, could be extracted from plan if available
    description: plan.basics?.participants 
      ? `Event for ${plan.basics.participants} participants`
      : 'Event details',
    location: plan.basics?.location || 'TBD',
    budgetTotal: plan.basics?.budget || 0,
    budgetUsed: plan.estimatedCost || 0,
    attendees: [], // Could be populated from invited people
    status,
  };
}

/**
 * Sync events from EventContext format to events.json format
 * This prepares the data that should be written to events.json
 */
export function syncEventsToJson(events: Map<string, { plan: EventPlan | null; selectedVendors: string[]; tasks: any[] }>): CopilotEvent[] {
  const copilotEvents: CopilotEvent[] = [];
  
  events.forEach((eventData, id) => {
    if (eventData?.plan) {
      try {
        copilotEvents.push(eventPlanToCopilotEvent(eventData.plan));
      } catch (error) {
        console.error('Error converting event plan to CopilotEvent:', error, eventData.plan);
        // Skip invalid events instead of crashing
      }
    }
  });
  
  return copilotEvents;
}

/**
 * Save events to localStorage in events.json format
 * This can be used by CalendarPanel or exported
 */
export function saveEventsToLocalStorage(events: CopilotEvent[]) {
  try {
    localStorage.setItem('events_json_format', JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save events to localStorage:', error);
  }
}

/**
 * Load events from localStorage in events.json format
 */
export function loadEventsFromLocalStorage(): CopilotEvent[] {
  try {
    const saved = localStorage.getItem('events_json_format');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load events from localStorage:', error);
  }
  return [];
}

