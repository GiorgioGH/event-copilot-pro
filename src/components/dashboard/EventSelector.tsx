import { useState } from 'react';
import { useEvent } from '@/contexts/EventContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, Plus, Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const EventSelector = () => {
  const { 
    currentEventId, 
    setCurrentEventId, 
    events, 
    currentPlan,
    deleteEvent 
  } = useEvent();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id);
      toast({
        title: "Event Deleted",
        description: "The event has been removed.",
      });
    }
  };

  const eventList = Array.from(events.entries());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          <span className="max-w-[200px] truncate">
            {currentPlan?.basics.name || 'No Event Selected'}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel>Your Events</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {eventList.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No events yet. Create your first event!
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            {eventList.map(([id, eventData]) => {
            const isCurrent = id === currentEventId;
            const plan = eventData.plan;
            
            return (
              <DropdownMenuItem
                key={id}
                onClick={() => setCurrentEventId(id)}
                className="flex items-start gap-3 p-3 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">
                      {plan?.basics.name || 'Unnamed Event'}
                    </span>
                    {isCurrent && (
                      <Badge variant="default" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {plan?.basics.dateRange?.start && (
                      <div>
                        {format(new Date(plan.basics.dateRange.start), 'MMM d, yyyy')}
                      </div>
                    )}
                    <div>
                      {plan?.basics.participants || 0} participants • {eventData.selectedVendors.length} vendors • {eventData.tasks.length} tasks
                    </div>
                    <div className="capitalize">
                      Status: {plan?.status || 'draft'}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => handleDelete(id, e)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </DropdownMenuItem>
            );
          })}
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate('/onboarding')}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Event
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EventSelector;

