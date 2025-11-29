import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart3, Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Task } from '@/types/event';

const mockTasks: Task[] = [
  { id: '1', title: 'Confirm venue booking', owner: 'Sarah M.', dueDate: new Date(Date.now() + 86400000 * 7), status: 'pending', priority: 'high' },
  { id: '2', title: 'Finalize catering menu', owner: 'John D.', dueDate: new Date(Date.now() + 86400000 * 14), status: 'in-progress', priority: 'medium' },
  { id: '3', title: 'Send invitations', owner: 'Emily R.', dueDate: new Date(Date.now() + 86400000 * 21), status: 'pending', priority: 'high' },
  { id: '4', title: 'Book AV equipment', owner: 'Mike T.', dueDate: new Date(Date.now() + 86400000 * 28), status: 'completed', priority: 'medium' },
  { id: '5', title: 'Arrange transportation', owner: 'Lisa K.', dueDate: new Date(Date.now() + 86400000 * 35), status: 'pending', priority: 'low' },
  { id: '6', title: 'Create event badges', owner: 'Chris P.', dueDate: new Date(Date.now() + 86400000 * 42), status: 'pending', priority: 'low' },
];

const statusColors = {
  pending: 'bg-secondary text-muted-foreground',
  'in-progress': 'bg-info/10 text-info border-info/20',
  completed: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

const priorityColors = {
  low: 'border-l-muted-foreground',
  medium: 'border-l-warning',
  high: 'border-l-destructive',
};

const TasksTimeline = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Tasks & Timeline
            </CardTitle>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Gantt View
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTasks.map((task, index) => (
              <motion.div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors border-l-4 ${priorityColors[task.priority]}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Checkbox 
                  checked={task.status === 'completed'}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.owner}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className={`${statusColors[task.status]} text-xs shrink-0`}>
                  {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {task.status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
                  {task.status.replace('-', ' ')}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TasksTimeline;
