import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { 
  Smartphone, 
  Phone, 
  AlertTriangle, 
  Users, 
  CheckCircle2,
  Clock,
  MapPin,
  Bell,
  MessageSquare,
  FileText
} from 'lucide-react';

const timeline = [
  { id: '1', time: '07:30', task: 'Venue setup begins', completed: true, critical: false },
  { id: '2', time: '08:00', task: 'AV equipment check', completed: true, critical: true },
  { id: '3', time: '08:30', task: 'Catering arrives', completed: true, critical: true },
  { id: '4', time: '08:45', task: 'Registration desk ready', completed: false, critical: true },
  { id: '5', time: '09:00', task: 'Guest registration begins', completed: false, critical: false },
  { id: '6', time: '09:30', task: 'Welcome drinks served', completed: false, critical: false },
  { id: '7', time: '10:00', task: 'Opening keynote starts', completed: false, critical: true },
  { id: '8', time: '11:30', task: 'Coffee break setup', completed: false, critical: false },
  { id: '9', time: '13:00', task: 'Lunch service begins', completed: false, critical: true },
];

const contacts = [
  { name: 'Venue Manager', phone: '+1 (555) 123-4567', role: 'Grand Conference Center' },
  { name: 'Head Chef', phone: '+1 (555) 234-5678', role: 'Elite Catering' },
  { name: 'AV Technician', phone: '+1 (555) 345-6789', role: 'TechAV Solutions' },
  { name: 'Event Lead', phone: '+1 (555) 456-7890', role: 'Internal Team' },
];

const DayOf = () => {
  const [tasks, setTasks] = useState(timeline);
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedTasks / tasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <>
      <Helmet>
        <title>Day-of Mode - SME Event Copilot</title>
        <meta name="description" content="Real-time event management for the day of your event." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-6 py-8 max-w-3xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge className="mb-4 bg-success/10 text-success border-success/20 text-sm px-4 py-1">
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile-Optimized View
          </Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2">Day-of Mode</h1>
          <p className="text-muted-foreground">Real-time event checklist</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-accent/10 to-success/10 border-accent/20">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-foreground">Event Progress</span>
                <span className="text-2xl font-bold text-accent">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-4 mb-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{completedTasks} of {tasks.length} tasks completed</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Next: {tasks.find(t => !t.completed)?.time || 'Done!'}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Real-time Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    task.completed 
                      ? 'bg-success/5 border-success/20' 
                      : task.critical 
                      ? 'bg-warning/5 border-warning/20'
                      : 'bg-card border-border hover:border-accent/50'
                  }`}
                  onClick={() => toggleTask(task.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Checkbox 
                    checked={task.completed} 
                    className="w-6 h-6"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{task.time}</span>
                      {task.critical && !task.completed && (
                        <Badge variant="outline" className="text-warning border-warning/30 text-xs">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.task}
                    </p>
                  </div>
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <Button variant="destructive" size="lg" className="h-16">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Report Delay
          </Button>
          <Button variant="outline" size="lg" className="h-16">
            <MessageSquare className="w-5 h-5 mr-2" />
            Notify Team
          </Button>
        </motion.div>

        {/* Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Quick Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contacts.map((contact, index) => (
                <motion.a
                  key={contact.name}
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + index * 0.05 }}
                >
                  <div>
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                  </div>
                  <Button variant="accent" size="icon">
                    <Phone className="w-4 h-4" />
                  </Button>
                </motion.a>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Contingency Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-warning/30 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <FileText className="w-5 h-5" />
                AI Contingency Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <p className="font-medium text-foreground mb-1">Weather Backup</p>
                  <p className="text-muted-foreground">Indoor space reserved at Ballroom B. Contact venue manager to switch.</p>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <p className="font-medium text-foreground mb-1">Catering Delay</p>
                  <p className="text-muted-foreground">Coffee service can be extended. Backup caterer on standby: Gourmet Events.</p>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <p className="font-medium text-foreground mb-1">Speaker No-Show</p>
                  <p className="text-muted-foreground">Team building activity can be moved up. Facilitator briefed.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </>
  );
};

export default DayOf;
