import { Task } from '@/types/event';

// Generate 6 common tasks for each event type
export const generateTasksForEventType = (
  eventType: string,
  eventDate: Date
): Task[] => {
  // Ensure all tasks are before the event date
  const baseDate = new Date(eventDate);
  baseDate.setHours(0, 0, 0, 0);
  
  const taskTemplates: Record<string, { title: string; daysBefore: number; priority: 'low' | 'medium' | 'high' }[]> = {
    'team-building': [
      { title: 'Book team building venue', daysBefore: 30, priority: 'high' },
      { title: 'Confirm activity materials and equipment', daysBefore: 14, priority: 'high' },
      { title: 'Send invitations to participants', daysBefore: 21, priority: 'high' },
      { title: 'Arrange catering for lunch', daysBefore: 14, priority: 'medium' },
      { title: 'Prepare team building activities', daysBefore: 7, priority: 'medium' },
      { title: 'Final confirmation with venue', daysBefore: 3, priority: 'high' },
    ],
    'seminar': [
      { title: 'Book seminar venue and AV equipment', daysBefore: 30, priority: 'high' },
      { title: 'Confirm speakers and presentations', daysBefore: 21, priority: 'high' },
      { title: 'Send registration invitations', daysBefore: 28, priority: 'high' },
      { title: 'Arrange catering and refreshments', daysBefore: 14, priority: 'medium' },
      { title: 'Prepare seminar materials and handouts', daysBefore: 7, priority: 'medium' },
      { title: 'Final AV and venue check', daysBefore: 2, priority: 'high' },
    ],
    'workshop': [
      { title: 'Secure workshop venue', daysBefore: 30, priority: 'high' },
      { title: 'Prepare workshop materials and tools', daysBefore: 14, priority: 'high' },
      { title: 'Send participant invitations', daysBefore: 21, priority: 'high' },
      { title: 'Arrange lunch and refreshments', daysBefore: 14, priority: 'medium' },
      { title: 'Finalize workshop agenda', daysBefore: 7, priority: 'medium' },
      { title: 'Confirm equipment and setup', daysBefore: 3, priority: 'high' },
    ],
    'offsite': [
      { title: 'Book offsite location', daysBefore: 45, priority: 'high' },
      { title: 'Arrange transportation', daysBefore: 21, priority: 'high' },
      { title: 'Send invitations with location details', daysBefore: 28, priority: 'high' },
      { title: 'Confirm catering arrangements', daysBefore: 14, priority: 'medium' },
      { title: 'Prepare offsite agenda and materials', daysBefore: 10, priority: 'medium' },
      { title: 'Final logistics confirmation', daysBefore: 3, priority: 'high' },
    ],
    'networking': [
      { title: 'Book networking venue', daysBefore: 21, priority: 'high' },
      { title: 'Arrange bar and refreshments', daysBefore: 14, priority: 'high' },
      { title: 'Send networking event invitations', daysBefore: 21, priority: 'high' },
      { title: 'Prepare name badges and materials', daysBefore: 7, priority: 'medium' },
      { title: 'Confirm catering menu', daysBefore: 7, priority: 'medium' },
      { title: 'Final venue and setup check', daysBefore: 2, priority: 'high' },
    ],
    'company-dinner': [
      { title: 'Book restaurant or venue', daysBefore: 30, priority: 'high' },
      { title: 'Finalize dinner menu with caterer', daysBefore: 14, priority: 'high' },
      { title: 'Send dinner invitations', daysBefore: 21, priority: 'high' },
      { title: 'Arrange seating plan', daysBefore: 7, priority: 'medium' },
      { title: 'Confirm entertainment or speakers', daysBefore: 10, priority: 'medium' },
      { title: 'Final venue and menu confirmation', daysBefore: 3, priority: 'high' },
    ],
  };

  const templates = taskTemplates[eventType] || taskTemplates['workshop'];
  
  return templates.map((template, index) => {
    const dueDate = new Date(baseDate);
    dueDate.setDate(dueDate.getDate() - template.daysBefore);
    
    return {
      id: `task-${index + 1}`,
      title: template.title,
      owner: '', // No owner shown
      dueDate,
      status: 'pending' as const,
      priority: template.priority,
    };
  });
};

