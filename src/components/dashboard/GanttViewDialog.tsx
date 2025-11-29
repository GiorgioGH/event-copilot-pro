import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/types/event';
import { format } from 'date-fns';

interface GanttViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
}

const GanttViewDialog = ({ open, onOpenChange, tasks }: GanttViewDialogProps) => {
  const today = new Date();
  const minDate = tasks.length > 0 
    ? new Date(Math.min(...tasks.map(t => t.dueDate.getTime())))
    : today;
  const maxDate = tasks.length > 0
    ? new Date(Math.max(...tasks.map(t => t.dueDate.getTime())))
    : new Date(today.getTime() + 86400000 * 60);
  
  const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const days = Array.from({ length: Math.min(daysDiff, 90) }, (_, i) => {
    const date = new Date(minDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  const getTaskPosition = (task: Task) => {
    const start = minDate.getTime();
    const taskDate = task.dueDate.getTime();
    // Show task as a point on the due date (small width)
    const total = maxDate.getTime() - start;
    const left = ((taskDate - start) / total) * 100;
    const width = 2; // Fixed small width to show as a point
    return { left: Math.max(0, left), width: Math.max(2, width) };
  };

  const priorityColors = {
    low: 'bg-muted',
    medium: 'bg-warning',
    high: 'bg-destructive',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Gantt Chart View</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Timeline header */}
              <div className="flex border-b border-border mb-2">
                <div className="w-48 shrink-0 p-2 font-medium text-sm">Task</div>
                <div className="flex-1 flex">
                  {days.filter((_, i) => i % 7 === 0).map((day, i) => (
                    <div key={i} className="flex-1 text-center text-xs text-muted-foreground p-1 border-l border-border">
                      {format(day, 'MMM d')}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tasks */}
              <div className="space-y-2">
                {tasks.map((task) => {
                  const { left, width } = getTaskPosition(task);
                  return (
                    <div key={task.id} className="flex items-center border-b border-border pb-2">
                      <div className="w-48 shrink-0 p-2 text-sm truncate">{task.title}</div>
                      <div className="flex-1 relative h-8 bg-secondary/30 rounded">
                        <div
                          className={`absolute h-6 top-1 rounded ${priorityColors[task.priority]} ${
                            task.status === 'completed' ? 'opacity-50' : ''
                          }`}
                          style={{ left: `${left}%`, width: `${width}%` }}
                        >
                          <div className="h-full flex items-center px-2 text-xs text-white">
                            {task.status === 'completed' && '✓'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GanttViewDialog;

