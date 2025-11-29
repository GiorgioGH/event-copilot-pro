import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '@/contexts/EventContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Users, MapPin, DollarSign, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

const EventSummaryCard = () => {
  const { currentPlan } = useEvent();
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const navigate = useNavigate();

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

          <Button 
            className="w-full" 
            variant="default"
            onClick={() => setPlanDialogOpen(true)}
          >
            <Eye className="w-4 h-4" />
            View Full Plan
          </Button>
        </CardContent>
      </Card>
      
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{currentPlan.basics.name || 'Event Plan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="font-semibold mb-2">Event Basics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type: </span>
                  <span className="capitalize">{currentPlan.basics.type?.replace('-', ' ')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Participants: </span>
                  <span>{currentPlan.basics.participants}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date: </span>
                  <span>
                    {currentPlan.basics.dateRange?.start 
                      ? format(new Date(currentPlan.basics.dateRange.start), 'MMM d, yyyy')
                      : 'TBD'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  <span>{currentPlan.basics.location || 'TBD'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget: </span>
                  <span>${currentPlan.basics.budget?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Estimated Cost: </span>
                  <span>${currentPlan.estimatedCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <div className="text-sm space-y-1">
                <div>Lunch: {currentPlan.requirements.includeLunch ? 'Yes' : 'No'}</div>
                <div>Accessibility: {currentPlan.requirements.accessibilityNeeded ? 'Required' : 'Not Required'}</div>
                <div>Timeframe: {currentPlan.requirements.preferredTimeframe}</div>
                <div>Venue: {currentPlan.requirements.venuePreference}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <Badge className="capitalize">{currentPlan.status}</Badge>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button onClick={() => setPlanDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default EventSummaryCard;
