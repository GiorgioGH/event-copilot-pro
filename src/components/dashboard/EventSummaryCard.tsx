import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '@/contexts/EventContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Users, MapPin, DollarSign, AlertTriangle, CheckCircle, Clock, Eye, Edit, CalendarPlus, Mic, UtensilsCrossed, Projector } from 'lucide-react';
import { format } from 'date-fns';
import { formatDkk } from '@/lib/utils/currency';

const EventSummaryCard = () => {
  const { currentPlan, updateEventPlan } = useEvent();
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(currentPlan);
  const navigate = useNavigate();
  
  // Update edited plan when currentPlan changes
  useEffect(() => {
    if (currentPlan) {
      setEditedPlan({ ...currentPlan });
    }
  }, [currentPlan]);

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
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground">
                  {currentPlan.basics.dateRange?.start 
                    ? format(new Date(currentPlan.basics.dateRange.start), 'MMM d, yyyy')
                    : 'TBD'}
                </p>
                {currentPlan.basics.dateRange?.start && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 px-2 text-xs"
                    onClick={() => {
                      const eventDate = currentPlan.basics.dateRange.start instanceof Date
                        ? currentPlan.basics.dateRange.start
                        : new Date(currentPlan.basics.dateRange.start);
                      
                      const startDate = new Date(eventDate);
                      startDate.setHours(10, 0, 0, 0); // Default to 10 AM
                      const endDate = new Date(startDate);
                      endDate.setHours(18, 0, 0, 0); // Default to 6 PM
                      
                      // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
                      const formatGoogleDate = (date: Date) => {
                        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                      };
                      
                      const title = encodeURIComponent(currentPlan.basics.name || 'Event');
                      const details = encodeURIComponent(
                        `Event Type: ${currentPlan.basics.type || 'Corporate Event'}\n` +
                        `Location: ${currentPlan.basics.location || 'TBD'}\n` +
                        `Participants: ${currentPlan.basics.participants || 0}`
                      );
                      const location = encodeURIComponent(currentPlan.basics.location || '');
                      const start = formatGoogleDate(startDate);
                      const end = formatGoogleDate(endDate);
                      
                      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
                      
                      window.open(googleCalendarUrl, '_blank');
                    }}
                  >
                    <CalendarPlus className="w-3 h-3 mr-1" />
                    Add to Google Calendar
                  </Button>
                )}
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
                  {formatDkk(currentPlan.estimatedCost)}
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
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{currentPlan.basics.name || 'Event Plan'}</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (isEditing && editedPlan) {
                    updateEventPlan(editedPlan);
                  }
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Save' : 'Edit'}
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Event Basics - Improved Card Layout */}
            <Card className="bg-secondary/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Event Basics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Event Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedPlan?.basics.name || ''}
                        onChange={(e) => setEditedPlan(prev => prev ? {
                          ...prev,
                          basics: { ...prev.basics, name: e.target.value }
                        } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 font-medium text-foreground">{currentPlan.basics.name || 'Untitled'}</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Event Type</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className="capitalize">
                        {currentPlan.basics.type?.replace('-', ' ') || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={currentPlan.basics.dateRange?.start 
                          ? (currentPlan.basics.dateRange.start instanceof Date 
                            ? currentPlan.basics.dateRange.start.toISOString().split('T')[0]
                            : new Date(currentPlan.basics.dateRange.start).toISOString().split('T')[0])
                          : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          setEditedPlan(prev => prev ? {
                            ...prev,
                            basics: {
                              ...prev.basics,
                              dateRange: {
                                start: date,
                                end: prev.basics.dateRange?.end || null
                              }
                            }
                          } : null);
                        }}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 font-medium text-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {currentPlan.basics.dateRange?.start 
                          ? format(new Date(currentPlan.basics.dateRange.start), 'MMM d, yyyy')
                          : 'TBD'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    {isEditing ? (
                      <Input
                        value={editedPlan?.basics.location || ''}
                        onChange={(e) => setEditedPlan(prev => prev ? {
                          ...prev,
                          basics: { ...prev.basics, location: e.target.value }
                        } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 font-medium text-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {currentPlan.basics.location || 'TBD'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Participants</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedPlan?.basics.participants || 0}
                        onChange={(e) => setEditedPlan(prev => prev ? {
                          ...prev,
                          basics: { ...prev.basics, participants: parseInt(e.target.value) || 0 }
                        } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 font-medium text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {currentPlan.basics.participants || 0} attendees
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Budget</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedPlan?.basics.budget || 0}
                        onChange={(e) => setEditedPlan(prev => prev ? {
                          ...prev,
                          basics: { ...prev.basics, budget: parseFloat(e.target.value) || 0 }
                        } : null)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 font-medium text-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        {formatDkk(currentPlan.basics.budget || 0)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Estimated Cost</Label>
                    <div className="mt-1 font-medium text-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      {formatDkk(currentPlan.estimatedCost)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Requirements - Improved Card Layout */}
            <Card className="bg-secondary/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                    <span className="text-sm text-muted-foreground">Lunch Included</span>
                    <Badge variant={currentPlan.requirements.includeLunch ? 'default' : 'secondary'}>
                      {currentPlan.requirements.includeLunch ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                    <span className="text-sm text-muted-foreground">Accessibility</span>
                    <Badge variant={currentPlan.requirements.accessibilityNeeded ? 'default' : 'secondary'}>
                      {currentPlan.requirements.accessibilityNeeded ? 'Required' : 'Not Required'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                    <span className="text-sm text-muted-foreground">Preferred Timeframe</span>
                    <Badge variant="outline" className="capitalize">
                      {currentPlan.requirements.preferredTimeframe}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                    <span className="text-sm text-muted-foreground">Venue Preference</span>
                    <Badge variant="outline" className="capitalize">
                      {currentPlan.requirements.venuePreference}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Special Conditions - Improved Card Layout */}
            {currentPlan.specialConditions && (
              <Card className="bg-secondary/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    Special Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentPlan.specialConditions.speakerNames && currentPlan.specialConditions.speakerNames.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                          <Mic className="w-4 h-4" />
                          Speakers
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {currentPlan.specialConditions.speakerNames.map((speaker, index) => (
                            <Badge key={index} variant="secondary">
                              {speaker}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentPlan.specialConditions?.dietaryRestrictions && currentPlan.specialConditions.dietaryRestrictions.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                          <UtensilsCrossed className="w-4 h-4" />
                          Dietary Restrictions
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {currentPlan.specialConditions.dietaryRestrictions.map((restriction, index) => (
                            <Badge key={index} variant="outline">
                              {restriction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentPlan.specialConditions?.equipment && currentPlan.specialConditions.equipment.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                          <Projector className="w-4 h-4" />
                          Equipment Needs
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {currentPlan.specialConditions.equipment.map((item, index) => (
                            <Badge key={index} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Status - Improved Card Layout */}
            <Card className="bg-secondary/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Event Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Badge className={`${riskColors[currentPlan.riskScore]} border capitalize text-sm px-3 py-1`}>
                    <RiskIcon className="w-3 h-3 mr-1" />
                    {currentPlan.riskScore} Risk
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {currentPlan.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button onClick={() => {
                if (isEditing && editedPlan) {
                  updateEventPlan(editedPlan);
                }
                setPlanDialogOpen(false);
                setIsEditing(false);
              }}>
                {isEditing ? 'Save & Close' : 'Close'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default EventSummaryCard;
