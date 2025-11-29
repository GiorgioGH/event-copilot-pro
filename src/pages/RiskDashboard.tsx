import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useEvent } from '@/contexts/EventContext';
import { analyzeRisks, getWeatherForDate, RiskItem } from '@/lib/riskAnalysis';
import { loadScrapedVendors } from '@/lib/vendors';
import { CopilotEvent } from '@/types/event';
import { loadEventsFromLocalStorage } from '@/lib/events';
import { getPaulSuggestions } from '@/lib/paulAI';
import { 
  AlertTriangle, 
  AlertCircle,
  Clock, 
  DollarSign, 
  Store, 
  CloudRain, 
  Calendar, 
  MapPin,
  Shield,
  CheckCircle2,
  UtensilsCrossed,
  Accessibility,
  Timer,
  Building,
  Bot,
  Lightbulb
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lunch: UtensilsCrossed,
  accessibility: Accessibility,
  timeframe: Timer,
  venue: Building,
  weather: CloudRain,
  budget: DollarSign,
  schedule: Calendar,
  tasks: Clock,
  external: MapPin,
};

const severityColors = {
  low: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', badge: 'bg-success/10 text-success border-success/20' },
  medium: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', badge: 'bg-warning/10 text-warning border-warning/20' },
  high: { bg: 'bg-destructive/10', border: 'border-destructive/20', text: 'text-destructive', badge: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const RiskDashboard = () => {
  const { currentPlan, selectedVendors, tasks } = useEvent();
  const [riskItems, setRiskItems] = useState<RiskItem[]>([]);
  const [allVendors, setAllVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (!currentPlan) {
        setLoading(false);
        return;
      }
      
      // Load vendors
      const vendors = await loadScrapedVendors();
      setAllVendors(vendors);
      
      // Get weather for event date
      const eventDate = currentPlan.basics.dateRange?.start;
      let weather = null;
      if (eventDate) {
        const date = eventDate instanceof Date ? eventDate : new Date(eventDate);
        weather = await getWeatherForDate(date, currentPlan.basics.location || 'Copenhagen');
      }
      
      // Check schedule conflicts
      let scheduleConflicts = 0;
      if (eventDate) {
        const date = eventDate instanceof Date ? eventDate : new Date(eventDate);
        const dateStr = date.toISOString().split('T')[0];
        
        try {
          const localEvents = loadEventsFromLocalStorage();
          const response = await fetch('/events.json');
          const jsonEvents: CopilotEvent[] = response.ok ? await response.json() : [];
          
          const allEvents = [...localEvents, ...jsonEvents];
          const conflicts = allEvents.filter(e => {
            if (e.id === currentPlan.id) return false;
            const eDate = new Date(e.date).toISOString().split('T')[0];
            return eDate === dateStr;
          });
          scheduleConflicts = conflicts.length;
        } catch (error) {
          console.error('Error checking schedule conflicts:', error);
        }
      }
      
      // Analyze risks
      let risks = analyzeRisks(currentPlan, selectedVendors, vendors, tasks, weather);
      
      // Update schedule conflict risk
      const scheduleRiskIndex = risks.findIndex(r => r.id === 'schedule');
      if (scheduleRiskIndex >= 0) {
        if (scheduleConflicts > 0) {
          risks[scheduleRiskIndex] = {
            id: 'schedule',
            type: 'schedule',
            title: 'Schedule Conflicts',
            description: `${scheduleConflicts} other event(s) scheduled on the same date`,
            severity: scheduleConflicts > 1 ? 'high' : 'medium',
            mitigation: 'Review other events on this date and consider rescheduling if needed',
          };
        } else {
          risks[scheduleRiskIndex] = {
            id: 'schedule',
            type: 'schedule',
            title: 'Schedule Conflicts',
            description: 'No conflicts detected on event date',
            severity: 'low',
            mitigation: undefined,
          };
        }
      }
      
      setRiskItems(risks);
      setLoading(false);
    };
    
    loadData();
  }, [currentPlan, selectedVendors, tasks]);
  
  if (!currentPlan) {
    return (
      <>
        <Helmet>
          <title>Risk Dashboard - EventPaul</title>
        </Helmet>
        <DashboardNav />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Event Selected</h2>
            <p className="text-muted-foreground">Select an event to view risk analysis.</p>
          </div>
        </main>
      </>
    );
  }
  
  if (loading) {
    return (
      <>
        <Helmet>
          <title>Risk Dashboard - EventPaul</title>
        </Helmet>
        <DashboardNav />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading risk analysis...</p>
          </div>
        </main>
      </>
    );
  }
  
  const highRisks = riskItems.filter(r => r.severity === 'high').length;
  const mediumRisks = riskItems.filter(r => r.severity === 'medium').length;
  const lowRisks = riskItems.filter(r => r.severity === 'low').length;
  const overallScore = Math.max(0, 100 - (highRisks * 25 + mediumRisks * 10 + lowRisks * 2));

  return (
    <>
      <Helmet>
        <title>Risk Dashboard - EventPaul</title>
        <meta name="description" content="Monitor and mitigate risks for your corporate event." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Risk Dashboard</h1>
          <p className="text-muted-foreground">Monitor potential risks and mitigation strategies</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-accent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                    <p className="text-3xl font-bold text-foreground">{overallScore}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <Progress value={overallScore} className="mt-3 h-2" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Priority</p>
                    <p className="text-3xl font-bold text-destructive">{highRisks}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-warning">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Medium Priority</p>
                    <p className="text-3xl font-bold text-warning">{mediumRisks}</p>
                  </div>
                  <Clock className="w-8 h-8 text-warning/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-l-4 border-l-success">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Low Priority</p>
                    <p className="text-3xl font-bold text-success">{lowRisks}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-success/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Paul AI Assistant Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-accent" />
                Paul AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getPaulSuggestions(riskItems).map((suggestion, index) => {
                  const priorityColors = {
                    high: 'border-destructive/30 bg-destructive/10',
                    medium: 'border-warning/30 bg-warning/10',
                    low: 'border-success/30 bg-success/10',
                  };
                  
                  return (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-lg border ${priorityColors[suggestion.priority]}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + index * 0.1 }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full ${priorityColors[suggestion.priority]} flex items-center justify-center shrink-0`}>
                          {suggestion.priority === 'high' ? (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          ) : suggestion.priority === 'medium' ? (
                            <Lightbulb className="w-4 h-4 text-warning" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{suggestion.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                          {suggestion.actionItems.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">Recommended Actions:</p>
                              <ul className="space-y-1">
                                {suggestion.actionItems.map((action, actionIndex) => (
                                  <li key={actionIndex} className="text-sm text-foreground flex items-start gap-2">
                                    <span className="text-accent mt-1">•</span>
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
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

        {/* Risk Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskItems.map((risk, index) => {
            const colors = severityColors[risk.severity];
            const Icon = iconMap[risk.type] || AlertTriangle;
            return (
              <motion.div
                key={risk.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <Card className={`${colors.bg} ${colors.border} border-2 h-full hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <CardTitle className="text-base font-semibold text-foreground">
                          {risk.title}
                        </CardTitle>
                      </div>
                      <Badge className={`${colors.badge} border capitalize`}>
                        {risk.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{risk.description}</p>
                    {risk.mitigation && (
                      <div className="p-3 rounded-lg bg-card border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Suggested Mitigation</p>
                        <p className="text-sm text-foreground">{risk.mitigation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
    </>
  );
};

export default RiskDashboard;
