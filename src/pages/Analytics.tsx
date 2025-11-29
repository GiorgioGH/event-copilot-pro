import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DashboardNav from '@/components/dashboard/DashboardNav';
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
  ThumbsUp
} from 'lucide-react';

const attendanceMetrics = [
  { label: 'Registered', value: 150, icon: Users },
  { label: 'Attended', value: 142, icon: Users },
  { label: 'No-shows', value: 8, icon: Clock },
  { label: 'Late Arrivals', value: 12, icon: Clock },
];

const engagementData = [
  { session: 'Opening Keynote', engagement: 95 },
  { session: 'Strategy Workshop', engagement: 88 },
  { session: 'Innovation Lab', engagement: 82 },
  { session: 'Team Building', engagement: 91 },
  { session: 'Networking', engagement: 78 },
];

const roiMetrics = [
  { label: 'Cost Per Head', value: '$85', benchmark: '$95', isGood: true },
  { label: 'Engagement/Cost', value: '1.2', benchmark: '1.0', isGood: true },
  { label: 'Impact Score', value: '8.7/10', benchmark: '7.5/10', isGood: true },
];

const Analytics = () => {
  const satisfactionScore = 4.6;
  const attendanceRate = Math.round((142 / 150) * 100);

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
                    <Badge variant="secondary">128 scans</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-foreground">Manual Check-ins</span>
                    <Badge variant="secondary">14 entries</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-foreground">Peak Check-in Time</span>
                    <Badge variant="secondary">8:45 AM</Badge>
                  </div>
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
