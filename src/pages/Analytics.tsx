import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useEvent } from '@/contexts/EventContext';
import { 
  loadEmployees, 
  simulateAttendance, 
  calculateAnalytics,
  EmployeeWithAttendance 
} from '@/lib/people';
import { 
  BarChart3, 
  Users, 
  Clock, 
  QrCode, 
  Star, 
  TrendingUp,
  DollarSign,
  Target,
  Download,
  ThumbsUp,
  Building2
} from 'lucide-react';

const Analytics = () => {
  const { currentPlan } = useEvent();
  const [employees, setEmployees] = useState<EmployeeWithAttendance[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees().then(allEmployees => {
      if (allEmployees.length === 0) {
        setLoading(false);
        return;
      }

      const participants = currentPlan?.basics.participants || 100;
      const employeesWithAttendance = simulateAttendance(allEmployees, participants);
      setEmployees(employeesWithAttendance);
      
      const calculated = calculateAnalytics(employeesWithAttendance);
      setAnalytics(calculated);
      setLoading(false);
    });
  }, [currentPlan?.basics.participants]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Post-Event Analytics - SME Event Copilot</title>
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

  if (!analytics) {
    return (
      <>
        <Helmet>
          <title>Post-Event Analytics - SME Event Copilot</title>
        </Helmet>
        <DashboardNav />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No analytics data available. Create an event first.</p>
          </div>
        </main>
      </>
    );
  }

  const satisfactionScore = analytics.avgSatisfaction || 4.6;
  const attendanceRate = analytics.attendanceRate;
  
  // Calculate peak check-in time
  const checkInTimes = employees
    .filter(e => e.checkInTime)
    .map(e => {
      const [hour, minute] = e.checkInTime!.split(':').map(Number);
      return hour * 60 + minute; // Convert to minutes
    });
  const avgCheckInMinutes = checkInTimes.length > 0
    ? checkInTimes.reduce((a, b) => a + b, 0) / checkInTimes.length
    : 8 * 60 + 30; // Default 8:30 AM
  const peakHour = Math.floor(avgCheckInMinutes / 60);
  const peakMinute = Math.round(avgCheckInMinutes % 60);
  const peakCheckInTime = `${peakHour}:${peakMinute.toString().padStart(2, '0')} ${peakHour >= 12 ? 'PM' : 'AM'}`;

  const attendanceMetrics = [
    { label: 'Registered', value: analytics.invited, icon: Users },
    { label: 'Attended', value: analytics.attended, icon: Users },
    { label: 'No-shows', value: analytics.noShows, icon: Clock },
    { label: 'Late Arrivals', value: analytics.lateArrivals, icon: Clock },
  ];

  // Generate engagement data based on attendance
  const engagementData = [
    { session: 'Opening Keynote', engagement: Math.min(95, 70 + analytics.attendanceRate * 0.25) },
    { session: 'Strategy Workshop', engagement: Math.min(92, 65 + analytics.attendanceRate * 0.27) },
    { session: 'Innovation Lab', engagement: Math.min(88, 60 + analytics.attendanceRate * 0.28) },
    { session: 'Team Building', engagement: Math.min(94, 75 + analytics.attendanceRate * 0.19) },
    { session: 'Networking', engagement: Math.min(85, 55 + analytics.attendanceRate * 0.30) },
  ];

  const totalCost = currentPlan?.estimatedCost || 10000;
  const costPerHead = analytics.attended > 0 ? totalCost / analytics.attended : 0;

  const roiMetrics = [
    { label: 'Cost Per Head', value: `$${Math.round(costPerHead)}`, benchmark: '$95', isGood: costPerHead < 95 },
    { label: 'Engagement/Cost', value: (analytics.attendanceRate / 100 / (costPerHead / 100)).toFixed(2), benchmark: '1.0', isGood: true },
    { label: 'Impact Score', value: `${(satisfactionScore * 2).toFixed(1)}/10`, benchmark: '7.5/10', isGood: satisfactionScore * 2 >= 7.5 },
  ];

  return (
    <>
      <Helmet>
        <title>Post-Event Analytics - SME Event Copilot</title>
        <meta name="description" content="Analyze your event success with detailed metrics and ROI." />
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Post-Event Analytics</h1>
            <p className="text-muted-foreground">Measure success and calculate ROI</p>
          </div>
          <Button variant="accent">
            <Download className="w-4 h-4 mr-2" />
            Export PDF Report
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {attendanceMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <metric.icon className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Attendance Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-accent" />
                  Check-in Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-accent/20 to-success/20 mb-4">
                    <span className="text-4xl font-bold text-foreground">{attendanceRate}%</span>
                  </div>
                  <p className="text-muted-foreground">Attendance Rate</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-foreground">QR Code Check-ins</span>
                    <Badge variant="secondary">{analytics.qrCheckIns} scans</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-foreground">Manual Check-ins</span>
                    <Badge variant="secondary">{analytics.manualCheckIns} entries</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-foreground">Peak Check-in Time</span>
                    <Badge variant="secondary">{peakCheckInTime}</Badge>
                  </div>
                  
                  {/* Department Breakdown */}
                  {Object.keys(analytics.byDepartment).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">By Department</p>
                      <div className="space-y-2">
                        {Object.entries(analytics.byDepartment)
                          .sort(([, a], [, b]) => b.attended - a.attended)
                          .slice(0, 5)
                          .map(([dept, stats]) => (
                            <div key={dept} className="flex items-center justify-between text-xs">
                              <span className="text-foreground truncate flex-1">{dept}</span>
                              <span className="text-muted-foreground ml-2">
                                {stats.attended}/{stats.invited}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Satisfaction Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" />
                  Survey Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-8 h-8 ${star <= Math.floor(satisfactionScore) ? 'text-warning fill-warning' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <p className="text-4xl font-bold text-foreground">{satisfactionScore}/5.0</p>
                  <p className="text-muted-foreground">Overall Satisfaction</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Would recommend</span>
                      <span className="text-foreground font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Content relevance</span>
                      <span className="text-foreground font-medium">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Organization quality</span>
                      <span className="text-foreground font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Engagement Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Session Engagement
              </CardTitle>
              <CardDescription>Activity engagement by session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engagementData.map((item, index) => (
                  <motion.div
                    key={item.session}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                  >
                    <div className="w-40 text-sm text-foreground truncate">{item.session}</div>
                    <div className="flex-1">
                      <Progress value={item.engagement} className="h-4" />
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-sm font-medium text-accent">{item.engagement}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ROI Calculation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-accent/5 to-success/5 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                ROI Calculation
              </CardTitle>
              <CardDescription>Business impact metrics vs industry benchmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roiMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    className="p-6 rounded-xl bg-card border border-border text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45 + index * 0.05 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <ThumbsUp className="w-6 h-6 text-success" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                    <p className="text-3xl font-bold text-foreground mb-1">{metric.value}</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs text-muted-foreground">Benchmark:</span>
                      <Badge variant="outline" className="text-xs">
                        {metric.benchmark}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </>
  );
};

export default Analytics;
