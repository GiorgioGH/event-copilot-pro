// Event-type specific schedules for Day of page

export interface DayOfTask {
  id: string;
  time: string;
  task: string;
  completed: boolean;
  critical: boolean;
}

export const getScheduleForEventType = (eventType: string): DayOfTask[] => {
  const schedules: Record<string, DayOfTask[]> = {
    'team-building': [
      { id: '1', time: '08:00', task: 'Venue setup and equipment check', completed: false, critical: true },
      { id: '2', time: '08:30', task: 'Activity materials preparation', completed: false, critical: true },
      { id: '3', time: '09:00', task: 'Team arrival and registration', completed: false, critical: false },
      { id: '4', time: '09:15', task: 'Welcome briefing and icebreaker', completed: false, critical: false },
      { id: '5', time: '10:00', task: 'Team building activities begin', completed: false, critical: true },
      { id: '6', time: '12:00', task: 'Lunch break', completed: false, critical: true },
      { id: '7', time: '13:00', task: 'Afternoon activities resume', completed: false, critical: true },
      { id: '8', time: '15:30', task: 'Coffee break', completed: false, critical: false },
      { id: '9', time: '16:00', task: 'Debrief and reflection session', completed: false, critical: false },
      { id: '10', time: '17:00', task: 'Event wrap-up and departure', completed: false, critical: false },
    ],
    'seminar': [
      { id: '1', time: '07:30', task: 'Venue setup and AV equipment check', completed: false, critical: true },
      { id: '2', time: '08:00', task: 'Registration desk setup', completed: false, critical: true },
      { id: '3', time: '08:30', task: 'Speaker preparation and sound check', completed: false, critical: true },
      { id: '4', time: '09:00', task: 'Guest registration begins', completed: false, critical: false },
      { id: '5', time: '09:30', task: 'Welcome coffee and networking', completed: false, critical: false },
      { id: '6', time: '10:00', task: 'Opening keynote starts', completed: false, critical: true },
      { id: '7', time: '11:00', task: 'First session begins', completed: false, critical: true },
      { id: '8', time: '11:30', task: 'Coffee break', completed: false, critical: false },
      { id: '9', time: '12:00', task: 'Second session', completed: false, critical: true },
      { id: '10', time: '13:00', task: 'Lunch service', completed: false, critical: true },
      { id: '11', time: '14:00', task: 'Afternoon sessions', completed: false, critical: true },
      { id: '12', time: '15:30', task: 'Closing remarks', completed: false, critical: false },
    ],
    'workshop': [
      { id: '1', time: '08:00', task: 'Workshop materials setup', completed: false, critical: true },
      { id: '2', time: '08:30', task: 'Equipment and tools preparation', completed: false, critical: true },
      { id: '3', time: '09:00', task: 'Participant check-in', completed: false, critical: false },
      { id: '4', time: '09:15', task: 'Workshop introduction', completed: false, critical: false },
      { id: '5', time: '09:30', task: 'Hands-on session begins', completed: false, critical: true },
      { id: '6', time: '11:00', task: 'Break and refreshments', completed: false, critical: false },
      { id: '7', time: '11:15', task: 'Workshop continues', completed: false, critical: true },
      { id: '8', time: '12:30', task: 'Lunch break', completed: false, critical: true },
      { id: '9', time: '13:30', task: 'Afternoon workshop session', completed: false, critical: true },
      { id: '10', time: '15:00', task: 'Final Q&A and wrap-up', completed: false, critical: false },
    ],
    'offsite': [
      { id: '1', time: '07:00', task: 'Transportation departure check', completed: false, critical: true },
      { id: '2', time: '08:00', task: 'Arrival at offsite location', completed: false, critical: true },
      { id: '3', time: '08:30', task: 'Venue setup and orientation', completed: false, critical: true },
      { id: '4', time: '09:00', task: 'Welcome and agenda overview', completed: false, critical: false },
      { id: '5', time: '09:30', task: 'Morning activities begin', completed: false, critical: true },
      { id: '6', time: '12:00', task: 'Lunch service', completed: false, critical: true },
      { id: '7', time: '13:00', task: 'Afternoon program', completed: false, critical: true },
      { id: '8', time: '15:00', task: 'Break and networking', completed: false, critical: false },
      { id: '9', time: '15:30', task: 'Closing session', completed: false, critical: false },
      { id: '10', time: '16:30', task: 'Departure preparation', completed: false, critical: true },
    ],
    'networking': [
      { id: '1', time: '17:00', task: 'Venue setup and bar preparation', completed: false, critical: true },
      { id: '2', time: '17:30', task: 'Catering and refreshments setup', completed: false, critical: true },
      { id: '3', time: '18:00', task: 'Registration desk ready', completed: false, critical: true },
      { id: '4', time: '18:30', task: 'Guest arrival and check-in', completed: false, critical: false },
      { id: '5', time: '19:00', task: 'Welcome drinks and mingling', completed: false, critical: false },
      { id: '6', time: '19:30', task: 'Opening remarks', completed: false, critical: false },
      { id: '7', time: '20:00', task: 'Networking activities', completed: false, critical: true },
      { id: '8', time: '21:00', task: 'Light refreshments served', completed: false, critical: false },
      { id: '9', time: '21:30', task: 'Continued networking', completed: false, critical: false },
      { id: '10', time: '22:30', task: 'Event concludes', completed: false, critical: false },
    ],
    'company-dinner': [
      { id: '1', time: '17:00', task: 'Venue preparation and table setup', completed: false, critical: true },
      { id: '2', time: '17:30', task: 'Catering final preparations', completed: false, critical: true },
      { id: '3', time: '18:00', task: 'Guest arrival and welcome drinks', completed: false, critical: false },
      { id: '4', time: '18:30', task: 'Seating and introductions', completed: false, critical: false },
      { id: '5', time: '19:00', task: 'Dinner service begins', completed: false, critical: true },
      { id: '6', time: '20:00', task: 'Main course service', completed: false, critical: true },
      { id: '7', time: '20:30', task: 'Speeches and presentations', completed: false, critical: false },
      { id: '8', time: '21:00', task: 'Dessert service', completed: false, critical: false },
      { id: '9', time: '21:30', task: 'Entertainment or activities', completed: false, critical: false },
      { id: '10', time: '22:30', task: 'Event concludes', completed: false, critical: false },
    ],
  };

  return schedules[eventType] || schedules['workshop']; // Default to workshop if type not found
};

