import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sparkles, AlertTriangle, Coffee, Utensils, Users, Mic } from 'lucide-react';
import { AgendaItem } from '@/types/event';
import { useToast } from '@/hooks/use-toast';

const mockAgenda: AgendaItem[] = [
  { id: '1', time: '08:30', title: 'Registration & Coffee', duration: 30, room: 'Lobby', type: 'break' },
  { id: '2', time: '09:00', title: 'Opening Keynote', duration: 60, room: 'Main Hall', type: 'session', speaker: 'CEO' },
  { id: '3', time: '10:00', title: 'Strategy Workshop A', duration: 90, room: 'Room 101', type: 'session', speaker: 'Sarah M.' },
  { id: '4', time: '10:00', title: 'Innovation Lab B', duration: 90, room: 'Room 102', type: 'session', speaker: 'John D.', hasConflict: true },
  { id: '5', time: '11:30', title: 'Coffee Break', duration: 30, room: 'Lounge', type: 'break' },
  { id: '6', time: '12:00', title: 'Team Building Activities', duration: 90, room: 'Outdoor Area', type: 'session' },
  { id: '7', time: '13:30', title: 'Lunch', duration: 60, room: 'Restaurant', type: 'lunch' },
  { id: '8', time: '14:30', title: 'Networking Session', duration: 60, room: 'Main Hall', type: 'networking' },
  { id: '9', time: '15:30', title: 'Closing Remarks', duration: 30, room: 'Main Hall', type: 'session', speaker: 'CEO' },
];

const typeIcons = {
  session: Mic,
  break: Coffee,
  lunch: Utensils,
  networking: Users,
};

const typeColors = {
  session: 'bg-accent/10 text-accent border-accent/20',
  break: 'bg-muted text-muted-foreground border-border',
  lunch: 'bg-success/10 text-success border-success/20',
  networking: 'bg-info/10 text-info border-info/20',
};

const AgendaPanel = () => {
  const [agenda, setAgenda] = useState(mockAgenda);
  const { toast } = useToast();

  const optimizeAgenda = () => {
    // Simulate optimization: resolve conflicts and improve timing
    const optimized = agenda.map(item => {
      if (item.hasConflict) {
        // Resolve conflict by adjusting time
        const [hours, minutes] = item.time.split(':').map(Number);
        const newTime = `${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        return { ...item, time: newTime, hasConflict: false };
      }
      return item;
    }).sort((a, b) => {
      // Sort by time
      const [aHours, aMins] = a.time.split(':').map(Number);
      const [bHours, bMins] = b.time.split(':').map(Number);
      return aHours * 60 + aMins - (bHours * 60 + bMins);
    });
    
    setAgenda(optimized);
    toast({
      title: "Agenda Optimized",
      description: "Conflicts resolved and schedule optimized for better flow.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Agenda
            </CardTitle>
            <Button variant="outline" size="sm" onClick={optimizeAgenda}>
              <Sparkles className="w-4 h-4 mr-2" />
              Optimize
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {agenda.map((item, index) => {
              const Icon = typeIcons[item.type];
              return (
                <motion.div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${item.hasConflict ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card hover:bg-secondary/50'} transition-colors`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="text-center shrink-0 w-14">
                    <span className="text-sm font-semibold text-foreground">{item.time}</span>
                    <p className="text-xs text-muted-foreground">{item.duration}min</p>
                  </div>
                  
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[item.type].split(' ')[0]}`}>
                    <Icon className={`w-4 h-4 ${typeColors[item.type].split(' ')[1]}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
                      {item.hasConflict && (
                        <Badge variant="destructive" className="text-xs shrink-0">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Conflict
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      {item.room && <span>{item.room}</span>}
                      {item.speaker && (
                        <>
                          <span>•</span>
                          <span>{item.speaker}</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AgendaPanel;
