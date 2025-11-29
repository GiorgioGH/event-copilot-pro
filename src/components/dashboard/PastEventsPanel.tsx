import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { CopilotEvent } from '@/types/event';
import { loadEventsFromLocalStorage } from '@/lib/events';
import { useEvent } from '@/contexts/EventContext';
import { format } from 'date-fns';

const PastEventsPanel = () => {
  const [pastEvents, setPastEvents] = useState<CopilotEvent[]>([]);
  const { setCurrentEventId } = useEvent();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Load from localStorage
        const localEvents = loadEventsFromLocalStorage();
        
        // Load from events.json
        const response = await fetch('/events.json');
        const jsonEvents: CopilotEvent[] = response.ok ? await response.json() : [];
        
        // Merge events
        const eventMap = new Map<string, CopilotEvent>();
        jsonEvents.forEach(event => eventMap.set(event.id, event));
        localEvents.forEach(event => eventMap.set(event.id, event));
        
        const allEvents = Array.from(eventMap.values());
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter past events
        const past = allEvents.filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate < today || event.status === 'past';
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setPastEvents(past.slice(0, 5)); // Show last 5 past events
      } catch (error) {
        console.error('Error loading past events:', error);
      }
    };
    
    loadEvents();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-accent" />
          Past Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pastEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No past events
          </p>
        ) : (
          <div className="space-y-2">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => setCurrentEventId(event.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs capitalize">
                      {event.type?.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PastEventsPanel;

