import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { 
  BarChart3, 
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  Download,
  Building,
  Clock,
  AlertCircle,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import type { CopilotEvent } from '@/types/event';
import { formatDkk } from '@/lib/utils/currency';

interface EventStats {
  totalEvents: number;
  totalBudget: number;
  totalUsed: number;
  averageBudget: number;
  eventsByType: Record<string, number>;
  eventsByMonth: Record<string, number>;
  upcomingEvents: CopilotEvent[];
  nextEventDate: string | null;
}

const Analytics = () => {
  const [events, setEvents] = useState<CopilotEvent[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load events from events.json
    fetch('/events.json')
      .then(res => res.json())
      .then((data: CopilotEvent[]) => {
        // Valid event types
        const validEventTypes = ['team-building', 'seminar', 'workshop', 'offsite', 'networking', 'company-dinner'];
        
        // Filter only future events with valid types
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureEvents = data.filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          const isValidType = validEventTypes.includes(event.type);
          return eventDate >= today && event.status === 'future' && isValidType;
        });

        // Sort by date
        futureEvents.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB;
        });

        setEvents(futureEvents);
        calculateStats(futureEvents);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading events:', error);
        setLoading(false);
      });
  }, []);

  const calculateStats = (futureEvents: CopilotEvent[]) => {
    const totalEvents = futureEvents.length;
    const totalBudget = futureEvents.reduce((sum, e) => sum + (e.budgetTotal || 0), 0);
    const totalUsed = futureEvents.reduce((sum, e) => sum + (e.budgetUsed || 0), 0);
    const averageBudget = totalEvents > 0 ? totalBudget / totalEvents : 0;

    // Events by type
    const eventsByType: Record<string, number> = {};
    futureEvents.forEach(event => {
      const type = event.type || 'other';
      eventsByType[type] = (eventsByType[type] || 0) + 1;
    });

    // Events by month
    const eventsByMonth: Record<string, number> = {};
    futureEvents.forEach(event => {
      const date = new Date(event.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      eventsByMonth[monthKey] = (eventsByMonth[monthKey] || 0) + 1;
    });

    // Next event date
    const nextEventDate = futureEvents.length > 0 
      ? futureEvents[0].date 
      : null;

    setStats({
      totalEvents,
      totalBudget,
      totalUsed,
      averageBudget,
      eventsByType,
      eventsByMonth,
      upcomingEvents: futureEvents.slice(0, 10), // Next 10 events
      nextEventDate,
    });
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Event Analytics - EventPaul</title>
        </Helmet>
        <DashboardNav />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </main>
      </>
    );
  }

  if (!stats || stats.totalEvents === 0) {
    return (
      <>
        <Helmet>
          <title>Event Analytics - EventPaul</title>
        </Helmet>
        <DashboardNav />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Future Events</h2>
            <p className="text-muted-foreground">Create events to see analytics and insights.</p>
          </div>
        </main>
      </>
    );
  }

  const budgetUtilization = stats.totalBudget > 0 
    ? Math.round((stats.totalUsed / stats.totalBudget) * 100) 
    : 0;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sortedMonths = Object.keys(stats.eventsByMonth).sort();

  return (
    <>
      <Helmet>
        <title>Event Analytics - EventPaul</title>
        <meta name="description" content="Analytics and insights for your upcoming events." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Event Analytics</h1>
            <p className="text-muted-foreground">Insights and statistics for your upcoming events</p>
          </div>
          <Button variant="accent">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalEvents}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-3xl font-bold text-foreground">{formatDkk(stats.totalBudget)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Budget</p>
                    <p className="text-3xl font-bold text-foreground">{formatDkk(Math.round(stats.averageBudget))}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Next Event</p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.nextEventDate 
                        ? new Date(stats.nextEventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Budget Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-accent" />
                  Budget Overview
                </CardTitle>
                <CardDescription>Budget allocation and utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Total Budget</span>
                      <span className="text-foreground font-medium">{formatDkk(stats.totalBudget)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Budget Used</span>
                      <span className="text-foreground font-medium">{formatDkk(stats.totalUsed)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="text-success font-medium">{formatDkk(stats.totalBudget - stats.totalUsed)}</span>
                    </div>
                    <Progress value={budgetUtilization} className="h-3 mt-3" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>{budgetUtilization}% utilized</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Events by Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-accent" />
                  Events by Type
                </CardTitle>
                <CardDescription>Distribution of event types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.eventsByType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => {
                      const percentage = Math.round((count / stats.totalEvents) * 100);
                      return (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground capitalize">{type.replace('-', ' ')}</span>
                            <span className="text-muted-foreground">{count} events ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Next 10 scheduled events</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingEvents.map((event, index) => {
                    const eventDate = new Date(event.date);
                    const budgetUsed = event.budgetUsed || 0;
                    const budgetTotal = event.budgetTotal || 0;
                    const budgetPercent = budgetTotal > 0 ? Math.round((budgetUsed / budgetTotal) * 100) : 0;
                    
                    return (
                      <motion.div
                        key={event.id}
                        className="p-4 rounded-lg border border-border bg-card"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{event.title}</h3>
                              <Badge variant="outline" className="capitalize">{event.type}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <Building className="w-4 h-4" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                            {budgetTotal > 0 && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Budget</span>
                                  <span className="text-foreground">
                                    {formatDkk(budgetUsed)} / {formatDkk(budgetTotal)}
                                  </span>
                                </div>
                                <Progress value={budgetPercent} className="h-1.5" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            {budgetPercent > 100 ? (
                              <AlertCircle className="w-5 h-5 text-destructive" />
                            ) : budgetPercent > 80 ? (
                              <AlertCircle className="w-5 h-5 text-warning" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No upcoming events</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </>
  );
};

export default Analytics;
