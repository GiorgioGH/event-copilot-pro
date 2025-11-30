import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEvent } from '@/contexts/EventContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Users, UtensilsCrossed, Projector } from 'lucide-react';

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Nut-Free', 'Dairy-Free'
];

const equipmentOptions = [
  'Projector', 'Microphone', 'Breakout Rooms', 'Whiteboard', 'Video Conferencing', 'Sound System'
];

const SpecialConditionsForm = () => {
  const { eventSpecialConditions, setEventSpecialConditions } = useEvent();
  const [newSpeaker, setNewSpeaker] = useState('');
  const [customDietary, setCustomDietary] = useState('');

  const addSpeaker = () => {
    if (newSpeaker.trim()) {
      setEventSpecialConditions({
        ...eventSpecialConditions,
        speakerNames: [...(eventSpecialConditions.speakerNames || []), newSpeaker.trim()]
      });
      setNewSpeaker('');
    }
  };

  const removeSpeaker = (index: number) => {
    const updated = [...(eventSpecialConditions.speakerNames || [])];
    updated.splice(index, 1);
    setEventSpecialConditions({ ...eventSpecialConditions, speakerNames: updated });
  };

  const toggleDietary = (option: string) => {
    const current = eventSpecialConditions.dietaryRestrictions || [];
    const updated = current.includes(option)
      ? current.filter(d => d !== option)
      : [...current, option];
    setEventSpecialConditions({ ...eventSpecialConditions, dietaryRestrictions: updated });
  };

  const addCustomDietary = () => {
    if (customDietary.trim()) {
      const current = eventSpecialConditions.dietaryRestrictions || [];
      if (!current.includes(customDietary.trim())) {
        setEventSpecialConditions({
          ...eventSpecialConditions,
          dietaryRestrictions: [...current, customDietary.trim()]
        });
      }
      setCustomDietary('');
    }
  };

  const toggleEquipment = (option: string) => {
    const current = eventSpecialConditions.equipment || [];
    const updated = current.includes(option)
      ? current.filter(e => e !== option)
      : [...current, option];
    setEventSpecialConditions({ ...eventSpecialConditions, equipment: updated });
  };


  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Special Conditions</h2>
        <p className="text-muted-foreground">Add any specific requirements for your event</p>
      </div>

      {/* Speakers */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div>
            <Label className="text-foreground font-medium">Speaker Names</Label>
            <p className="text-sm text-muted-foreground">Optional: Add keynote speakers or presenters</p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Speaker name"
            value={newSpeaker}
            onChange={(e) => setNewSpeaker(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSpeaker()}
          />
          <Button onClick={addSpeaker} size="icon" variant="secondary">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {(eventSpecialConditions.speakerNames || []).map((speaker, index) => (
            <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1">
              {speaker}
              <button
                onClick={() => removeSpeaker(index)}
                className="ml-2 hover:bg-muted rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-accent" />
          </div>
          <div>
            <Label className="text-foreground font-medium">Dietary Restrictions</Label>
            <p className="text-sm text-muted-foreground">Select all that apply</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {dietaryOptions.map((option) => (
            <Badge
              key={option}
              variant={(eventSpecialConditions.dietaryRestrictions || []).includes(option) ? 'default' : 'outline'}
              className="cursor-pointer transition-colors"
              onClick={() => toggleDietary(option)}
            >
              {option}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Add custom restriction"
            value={customDietary}
            onChange={(e) => setCustomDietary(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomDietary()}
          />
          <Button onClick={addCustomDietary} size="icon" variant="secondary">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Equipment */}
      <div className="p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Projector className="w-5 h-5 text-accent" />
          </div>
          <div>
            <Label className="text-foreground font-medium">Equipment Needs</Label>
            <p className="text-sm text-muted-foreground">Select required equipment</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {equipmentOptions.map((option) => (
            <Badge
              key={option}
              variant={(eventSpecialConditions.equipment || []).includes(option) ? 'default' : 'outline'}
              className="cursor-pointer transition-colors"
              onClick={() => toggleEquipment(option)}
            >
              {option}
            </Badge>
          ))}
        </div>
      </div>

    </motion.div>
  );
};

export default SpecialConditionsForm;
