import { useEvent } from '@/contexts/EventContext';
import { CopilotEvent } from '@/types/event';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SidebarEvents({ onEventClick }: { onEventClick?: (event: CopilotEvent) => void }) {
  const [events, setEvents] = useState<CopilotEvent[]>([]);
  const { setCurrentEventId, currentEventId } = useEvent();

  useEffect(() => {
    fetch('/events.json')
      .then(res => res.json())
      .then((data: CopilotEvent[]) => setEvents(data));
  }, []);

  // Helper to check future/past
  const today = new Date();
  const isFuture = (dateStr: string) => new Date(dateStr).getTime() >= today.setHours(0,0,0,0);
  const pastEvents = events.filter(e => (e.status === 'past' || !isFuture(e.date))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Render compact past event (no edit)
  const renderPastEvent = (evt: CopilotEvent) => (
    <div
      key={evt.id}
      className="w-full mb-1 border rounded px-1 py-1 flex flex-col items-start bg-muted/50"
      style={{ minWidth: 0 }}
    >
      <Button
        variant={evt.id === currentEventId ? 'default' : 'outline'}
        className="w-full text-left flex-1 px-1 py-1 h-auto min-h-0 text-xs font-medium truncate"
        onClick={() => { setCurrentEventId(evt.id); onEventClick?.(evt); }}
      >
        {evt.title}
        <span className="block text-[10px] text-muted-foreground truncate">{evt.date} • {evt.type}</span>
      </Button>
    </div>
  );

  return (
    <div style={{ width: '210px', minWidth: '130px' }}>
      <h2 className="text-lg font-bold my-4">Past Events</h2>
      {pastEvents.length === 0 ? <div className="text-muted-foreground">No past events</div> : pastEvents.map(renderPastEvent)}
    </div>
  );
}
