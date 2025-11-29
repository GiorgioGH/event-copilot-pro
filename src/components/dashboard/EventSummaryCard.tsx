import { motion } from 'framer-motion';
import { useEvent } from '@/contexts/EventContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, MapPin, DollarSign, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

const EventSummaryCard = () => {
  const { currentPlan } = useEvent();

  if (!currentPlan) return null;

  const riskColors = {
    low: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    high: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const riskIcons = {
    low: CheckCircle,
    medium: Clock,
    high: AlertTriangle,
  };

  const RiskIcon = riskIcons[currentPlan.riskScore];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-card to-secondary/30 border-border shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {currentPlan.basics.name || 'Your Event'}
              </CardTitle>
              <p className="text-muted-foreground mt-1 capitalize">
                {currentPlan.basics.type?.replace('-', ' ') || 'Corporate Event'}
              </p>
            </div>
            <Badge className={`${riskColors[currentPlan.riskScore]} border`}>
              <RiskIcon className="w-3 h-3 mr-1" />
              {currentPlan.riskScore.charAt(0).toUpperCase() + currentPlan.riskScore.slice(1)} Risk
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground">
                  {currentPlan.basics.dateRange?.start 
                    ? format(new Date(currentPlan.basics.dateRange.start), 'MMM d, yyyy')
                    : 'TBD'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Participants</p>
                <p className="text-sm font-medium text-foreground">
                  {currentPlan.basics.participants || 0} attendees
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estimated Cost</p>
                <p className="text-sm font-medium text-foreground">
                  ${currentPlan.estimatedCost.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                  {currentPlan.basics.location || 'TBD'}
                </p>
              </div>
            </div>
          </div>

          <Button className="w-full" variant="default">
            <Eye className="w-4 h-4" />
            View Full Plan
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventSummaryCard;
