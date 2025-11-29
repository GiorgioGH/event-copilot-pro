import { motion } from 'framer-motion';
import { useEvent } from '@/contexts/EventContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, Clock, Building, TreePine, Utensils, Accessibility } from 'lucide-react';

const EventRequirementsForm = () => {
  const { eventRequirements, setEventRequirements } = useEvent();

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Requirements</h2>
        <p className="text-muted-foreground">Define your constraints for optimal planning</p>
      </div>

      {/* Toggle Options */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-accent" />
            </div>
            <div>
              <Label className="text-foreground font-medium">Include Lunch</Label>
              <p className="text-sm text-muted-foreground">Catered meal service</p>
            </div>
          </div>
          <Switch
            checked={eventRequirements.includeLunch}
            onCheckedChange={(checked) => 
              setEventRequirements({ ...eventRequirements, includeLunch: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Accessibility className="w-5 h-5 text-accent" />
            </div>
            <div>
              <Label className="text-foreground font-medium">Accessibility Needed</Label>
              <p className="text-sm text-muted-foreground">Wheelchair accessible venue</p>
            </div>
          </div>
          <Switch
            checked={eventRequirements.accessibilityNeeded}
            onCheckedChange={(checked) => 
              setEventRequirements({ ...eventRequirements, accessibilityNeeded: checked })
            }
          />
        </div>
      </div>

      {/* Timeline Flexibility */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <Label className="text-foreground font-medium">Timeline Flexibility</Label>
            <p className="text-sm text-muted-foreground">How strict is your schedule?</p>
          </div>
        </div>
        <div className="px-2">
          <Slider
            value={[eventRequirements.timelineFlexibility || 50]}
            onValueChange={([value]) => 
              setEventRequirements({ ...eventRequirements, timelineFlexibility: value })
            }
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Strict</span>
            <span>Flexible</span>
          </div>
        </div>
      </div>

      {/* Preferred Timeframe */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <Label className="text-foreground font-medium mb-4 block">Preferred Timeframe</Label>
        <RadioGroup
          value={eventRequirements.preferredTimeframe || 'full-day'}
          onValueChange={(value) => 
            setEventRequirements({ ...eventRequirements, preferredTimeframe: value as any })
          }
          className="grid grid-cols-3 gap-4"
        >
          {[
            { value: 'morning', label: 'Morning', icon: Sun, time: '8AM - 12PM' },
            { value: 'afternoon', label: 'Afternoon', icon: Moon, time: '1PM - 5PM' },
            { value: 'full-day', label: 'Full Day', icon: Clock, time: '8AM - 5PM' },
          ].map((option) => (
            <Label
              key={option.value}
              className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                eventRequirements.preferredTimeframe === option.value
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <RadioGroupItem value={option.value} className="sr-only" />
              <option.icon className={`w-6 h-6 mb-2 ${
                eventRequirements.preferredTimeframe === option.value
                  ? 'text-accent'
                  : 'text-muted-foreground'
              }`} />
              <span className="font-medium text-foreground">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.time}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Venue Preference */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <Label className="text-foreground font-medium mb-4 block">Venue Preference</Label>
        <RadioGroup
          value={eventRequirements.venuePreference || 'either'}
          onValueChange={(value) => 
            setEventRequirements({ ...eventRequirements, venuePreference: value as any })
          }
          className="grid grid-cols-3 gap-4"
        >
          {[
            { value: 'indoor', label: 'Indoor', icon: Building },
            { value: 'outdoor', label: 'Outdoor', icon: TreePine },
            { value: 'either', label: 'Either', icon: Clock },
          ].map((option) => (
            <Label
              key={option.value}
              className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                eventRequirements.venuePreference === option.value
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <RadioGroupItem value={option.value} className="sr-only" />
              <option.icon className={`w-6 h-6 mb-2 ${
                eventRequirements.venuePreference === option.value
                  ? 'text-accent'
                  : 'text-muted-foreground'
              }`} />
              <span className="font-medium text-foreground">{option.label}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>
    </motion.div>
  );
};

export default EventRequirementsForm;
