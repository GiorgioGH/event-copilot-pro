import { motion } from 'framer-motion';
import { useEvent } from '@/contexts/EventContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MapPin, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const eventTypes = [
  { value: 'team-building', label: 'Team Building' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'offsite', label: 'Offsite' },
  { value: 'networking', label: 'Networking' },
  { value: 'company-dinner', label: 'Company Dinner' },
];

const EventBasicsForm = () => {
  const { eventBasics, setEventBasics } = useEvent();

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Event Basics</h2>
        <p className="text-muted-foreground">Let's start with the fundamental details of your event</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Name */}
        <div className="md:col-span-2">
          <Label htmlFor="eventName" className="text-foreground font-medium">Event Name</Label>
          <Input
            id="eventName"
            placeholder="Annual Strategy Summit 2024"
            value={eventBasics.name || ''}
            onChange={(e) => setEventBasics({ ...eventBasics, name: e.target.value })}
            className="mt-2"
          />
        </div>

        {/* Event Type */}
        <div>
          <Label className="text-foreground font-medium">Event Type</Label>
          <Select
            value={eventBasics.type || ''}
            onValueChange={(value) => setEventBasics({ ...eventBasics, type: value as any })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div>
          <Label className="text-foreground font-medium">Event Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full mt-2 justify-start text-left font-normal',
                  !eventBasics.dateRange?.start && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {eventBasics.dateRange?.start ? (
                  format(eventBasics.dateRange.start, 'PPP')
                ) : (
                  'Pick a date'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={eventBasics.dateRange?.start || undefined}
                onSelect={(date) => setEventBasics({ 
                  ...eventBasics, 
                  dateRange: { start: date || null, end: date || null } 
                })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Participants */}
        <div>
          <Label htmlFor="participants" className="text-foreground font-medium">
            <Users className="w-4 h-4 inline mr-2" />
            Expected Participants
          </Label>
          <Input
            id="participants"
            type="number"
            placeholder="50"
            value={eventBasics.participants || ''}
            onChange={(e) => setEventBasics({ ...eventBasics, participants: parseInt(e.target.value) || 0 })}
            className="mt-2"
          />
        </div>

        {/* Budget */}
        <div>
          <Label htmlFor="budget" className="text-foreground font-medium">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Budget (USD)
          </Label>
          <Input
            id="budget"
            type="number"
            placeholder="10000"
            value={eventBasics.budget || ''}
            onChange={(e) => setEventBasics({ ...eventBasics, budget: parseInt(e.target.value) || 0 })}
            className="mt-2"
          />
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <Label htmlFor="location" className="text-foreground font-medium">
            <MapPin className="w-4 h-4 inline mr-2" />
            Location
          </Label>
          <Input
            id="location"
            placeholder="San Francisco, CA or Office Address"
            value={eventBasics.location || ''}
            onChange={(e) => setEventBasics({ ...eventBasics, location: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default EventBasicsForm;
