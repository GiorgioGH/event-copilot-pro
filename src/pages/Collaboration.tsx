import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { 
  Users, 
  UserPlus, 
  Mail, 
  MessageSquare,
  Bell,
  DollarSign,
  Calendar,
  ListTodo,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';

const teamMembers = [
  { id: '1', name: 'Sarah Mitchell', email: 'sarah@company.com', role: 'Event Lead', avatar: 'SM', tasks: 5, completed: 3 },
  { id: '2', name: 'John Davis', email: 'john@company.com', role: 'Coordinator', avatar: 'JD', tasks: 4, completed: 2 },
  { id: '3', name: 'Emily Roberts', email: 'emily@company.com', role: 'Marketing', avatar: 'ER', tasks: 3, completed: 3 },
  { id: '4', name: 'Mike Thompson', email: 'mike@company.com', role: 'Logistics', avatar: 'MT', tasks: 6, completed: 4 },
];

const notificationSettings = [
  { id: 'vendor-deadlines', label: 'Vendor Deadlines', description: 'Get notified when vendor confirmations are due', icon: Calendar },
  { id: 'budget-overrun', label: 'Budget Overrun Alerts', description: 'Alert when budget exceeds thresholds', icon: DollarSign },
  { id: 'agenda-changes', label: 'Agenda Changes', description: 'Updates when schedule is modified', icon: Calendar },
  { id: 'task-assigned', label: 'New Tasks Assigned', description: 'When tasks are assigned to team members', icon: ListTodo },
  { id: 'critical-risk', label: 'Critical Risk Notifications', description: 'Immediate alerts for high-priority risks', icon: AlertTriangle },
];

const Collaboration = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    'vendor-deadlines': true,
    'budget-overrun': true,
    'agenda-changes': false,
    'task-assigned': true,
    'critical-risk': true,
  });

  const toggleNotification = (id: string) => {
    setNotifications(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <Helmet>
        <title>Team Collaboration - SME Event Copilot</title>
        <meta name="description" content="Collaborate with your team on event planning." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Team Collaboration</h1>
          <p className="text-muted-foreground">Manage your team and notification preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Members */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-accent" />
                      Team Members
                    </CardTitle>
                    <CardDescription>{teamMembers.length} people on this event</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Invite form */}
                <div className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="accent">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>

                {/* Team list */}
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-accent/20 text-accent text-sm">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {member.completed}/{member.tasks} tasks
                          </p>
                          <div className="flex items-center gap-1 justify-end">
                            {member.completed === member.tasks ? (
                              <CheckCircle2 className="w-3 h-3 text-success" />
                            ) : (
                              <Clock className="w-3 h-3 text-warning" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {member.completed === member.tasks ? 'Complete' : 'In progress'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Integration Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Slack/Teams Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  Integrations
                </CardTitle>
                <CardDescription>Connect your communication tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center text-white font-bold text-sm">
                      S
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Slack</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#5059C9] flex items-center justify-center text-white font-bold text-sm">
                      T
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Microsoft Teams</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-accent" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose what updates to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notificationSettings.map((setting) => (
                  <div 
                    key={setting.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <setting.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-foreground font-medium">{setting.label}</Label>
                        <p className="text-xs text-muted-foreground">{setting.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[setting.id]}
                      onCheckedChange={() => toggleNotification(setting.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Collaboration;
