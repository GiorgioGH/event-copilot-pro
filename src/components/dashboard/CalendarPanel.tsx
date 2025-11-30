import { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import type { CopilotEvent } from '@/types/event';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loadEventsFromLocalStorage, saveEventsToLocalStorage } from '@/lib/events';
import { useEvent } from '@/contexts/EventContext';

function emptyEventForm(selectedDate?: Date): CopilotEvent {
  return {
    id: '',
    title: '',
    type: '',
    date: selectedDate ? selectedDate.toISOString().slice(0, 10) : '',
    time: '',
    description: '',
    location: '',
    budgetTotal: 0,
    budgetUsed: 0,
    attendees: [],
    status: 'future',
  };
}

export default function CalendarPanel() {
  const { events: eventContextEvents } = useEvent();
  const [events, setEvents] = useState<CopilotEvent[]>([]);
  const [selected, setSelected] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('add');
  const [modalEvent, setModalEvent] = useState<CopilotEvent | null>(null);
  const lastEventsCountRef = useRef(0);

  const loadAndMergeEvents = async () => {
    try {
      // Load from localStorage (newly created events)
      const localEvents = loadEventsFromLocalStorage();
      
      // Load from events.json (existing events)
      const response = await fetch('/events.json');
      const jsonEvents: CopilotEvent[] = response.ok ? await response.json() : [];
      
      // Merge: combine both sources, prioritizing localStorage (newer events)
      const eventMap = new Map<string, CopilotEvent>();
      
      // First add events.json events
      jsonEvents.forEach(event => {
        eventMap.set(event.id, event);
      });
      
      // Then add/update with localStorage events (these are newer)
      localEvents.forEach(event => {
        eventMap.set(event.id, event);
      });
      
      const mergedEvents = Array.from(eventMap.values());
      setEvents(mergedEvents);
      lastEventsCountRef.current = mergedEvents.length;
      setLoading(false);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAndMergeEvents();
    
    // Poll for changes every 1 second (to catch localStorage updates from same window)
    const pollInterval = setInterval(() => {
      const localEvents = loadEventsFromLocalStorage();
      const currentIds = new Set(events.map(e => e.id));
      const localIds = new Set(localEvents.map(e => e.id));
      
      // Check if there are new events or if count changed
      if (localEvents.length !== lastEventsCountRef.current || 
          localEvents.some(e => !currentIds.has(e.id))) {
        loadAndMergeEvents();
      }
    }, 1000);
    
    // Also listen for storage changes (from other tabs/windows)
    const handleStorageChange = () => {
      loadAndMergeEvents();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Also refresh when EventContext events change
  useEffect(() => {
    // Reload events when EventContext changes
    loadAndMergeEvents();
  }, [eventContextEvents.size]);

  const getEventsOnDay = (date: Date) => {
    return events.filter(evt => {
      const evtDate = new Date(evt.date);
      return evtDate.toDateString() === date.toDateString();
    });
  };

  const eventDates = events.map(evt => new Date(evt.date));
  const isFuture = (dateStr: string) => new Date(dateStr).getTime() >= new Date().setHours(0,0,0,0);

  // Edit handler: open modal in edit mode
  const handleEdit = (evt: CopilotEvent) => {
    setModalMode('edit');
    setModalEvent(evt);
    setModalOpen(true);
  };

  // View handler: open modal in view mode
  const handleView = (evt: CopilotEvent) => {
    setModalMode('view');
    setModalEvent(evt);
    setModalOpen(true);
  };

  // New event handler: open modal in add mode
  const handleAdd = () => {
    setModalMode('add');
    setModalEvent(emptyEventForm(selected));
    setModalOpen(true);
  };

  // Save event modals
  const handleChange = (k: keyof CopilotEvent, v: any) => {
    if (!modalEvent) return;
    setModalEvent({ ...modalEvent, [k]: k === 'budgetTotal' || k === 'budgetUsed' ? Number(v) : v });
  };
  const handleSave = () => {
    if (!modalEvent) return;
    const isPast = !isFuture(modalEvent.date);
    const obj = { ...modalEvent, status: isPast ? 'past' : 'future' };
    let updatedEvents: CopilotEvent[];
    if (modalMode === 'add') {
      obj.id = (Date.now() + Math.random()).toString(36);
      updatedEvents = [...events, obj];
    } else if (modalMode === 'edit') {
      updatedEvents = events.map(ev => ev.id === obj.id ? obj : ev);
    } else {
      updatedEvents = events;
    }
    setEvents(updatedEvents);
    // Save to localStorage in events.json format
    saveEventsToLocalStorage(updatedEvents);
    setModalOpen(false);
  };

  // Calendar click logic: open modal based on event/past/future
  const handleEventClick = (evt: CopilotEvent) => {
    if (isFuture(evt.date)) {
      handleEdit(evt);
    } else {
      handleView(evt);
    }
  };

  // Render modal fields
  const renderEventModal = () => {
    if (!modalEvent) return null;
    const viewOnly = modalMode === 'view';
    return (
      <Dialog open={modalOpen} onOpenChange={() => setModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'add'
                ? 'Create Event'
                : modalMode === 'edit'
                  ? 'Edit Event'
                  : 'Event Details'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Input disabled={viewOnly} placeholder="Title" value={modalEvent.title} onChange={e => handleChange('title', e.target.value)} />
            <Input disabled={viewOnly} placeholder="Type" value={modalEvent.type} onChange={e => handleChange('type', e.target.value)} />
            <Input disabled={viewOnly} type="date" value={modalEvent.date} onChange={e => handleChange('date', e.target.value)} />
            <Input disabled={viewOnly} type="time" value={modalEvent.time} onChange={e => handleChange('time', e.target.value)} />
            <Input disabled={viewOnly} placeholder="Location" value={modalEvent.location} onChange={e => handleChange('location', e.target.value)} />
            <Input disabled={viewOnly} placeholder="Description" value={modalEvent.description} onChange={e => handleChange('description', e.target.value)} />
            <Input disabled={viewOnly} placeholder="Total Budget" type="number" value={modalEvent.budgetTotal} onChange={e => handleChange('budgetTotal', e.target.value)} />
            <Input disabled={viewOnly} placeholder="Used Budget" type="number" value={modalEvent.budgetUsed} onChange={e => handleChange('budgetUsed', e.target.value)} />
            <Input disabled={viewOnly} placeholder="Attendees (comma separated)" value={modalEvent.attendees?.join(', ') || ''} onChange={e => handleChange('attendees', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />
          </div>
          {viewOnly ? (
            <DialogFooter>
              <Button onClick={() => setModalOpen(false)} type="button" variant="outline">Close</Button>
            </DialogFooter>
          ) : (
            <DialogFooter>
              <Button onClick={handleSave} type="button">Save</Button>
              <Button onClick={() => setModalOpen(false)} type="button" variant="outline">Cancel</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Events Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {loading ? (<div>Loading...</div>) : (
          <>
            <div className="flex justify-center mb-4">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={setSelected}
                modifiers={{ event: eventDates }}
                modifiersClassNames={{ event: 'bg-primary/30' }}
              />
            </div>
            {/* EVENT LIST/MODIFY/CREATE UI FOR SELECTED DAY */}
            {selected && (
              <div className="mt-2 flex-1 overflow-y-auto">
                <strong className="text-sm">Events on {selected.toLocaleDateString()}:</strong>
                <ul className="mt-2 space-y-2">
                  {getEventsOnDay(selected).length === 0 ? (
                    <li><Button onClick={handleAdd} type="button" size="sm">Create New Event</Button></li>
                  ) : (
                    getEventsOnDay(selected).map(evt => (
                      <li key={evt.id} className="border rounded p-2 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => handleEventClick(evt)}>
                        <div className="font-semibold text-sm">{evt.title}</div>
                        <div className="text-xs text-muted-foreground mb-1">{evt.type} • {evt.status}
                          {evt.time && <> • {evt.time}</>}
                          {evt.location && <> • {evt.location}</>}
                        </div>
                        <div className="text-xs mb-1 line-clamp-2">{evt.description}</div>
                        <div className="text-xs mb-1">
                          <strong>Budget:</strong> ${evt.budgetUsed?.toLocaleString() ?? 0} / ${evt.budgetTotal?.toLocaleString() ?? 0}
                        </div>
                        <Button size="sm" variant="outline" className="mt-1">{isFuture(evt.date) ? 'Edit' : 'View'}</Button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
            {/* MODAL */}
            {renderEventModal()}
          </>
        )}
      </CardContent>
    </Card>
  );
}
