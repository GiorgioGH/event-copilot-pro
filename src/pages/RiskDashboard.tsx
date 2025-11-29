import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Store, 
  CloudRain, 
  Calendar, 
  MapPin,
  TrendingUp,
  Shield,
  CheckCircle2
} from 'lucide-react';

const riskItems = [
  {
    id: 'task-delays',
    type: 'task-delay',
    title: 'Task Delays',
    description: '3 tasks overdue — risk high',
    severity: 'high' as const,
    icon: Clock,
    mitigation: 'Reassign tasks to available team members',
  },
  {
    id: 'budget',
    type: 'budget',
    title: 'Budget Risk',
    description: 'Currently at 87% of allocated budget',
    severity: 'medium' as const,
    icon: DollarSign,
    mitigation: 'Review vendor alternatives for cost savings',
  },
  {
    id: 'vendor',
    type: 'vendor',
    title: 'Vendor Risk',
    description: 'Catering not confirmed',
    severity: 'high' as const,
    icon: Store,
    mitigation: 'Contact vendor immediately, prepare backup options',
  },
  {
    id: 'weather',
    type: 'weather',
    title: 'Weather Risk',
    description: '30% chance of rain on event day',
    severity: 'medium' as const,
    icon: CloudRain,
    mitigation: 'Ensure indoor backup venue is available',
  },
  {
    id: 'schedule',
    type: 'schedule',
    title: 'Schedule Conflicts',
    description: 'Speaker A unavailable at 11:00',
    severity: 'medium' as const,
    icon: Calendar,
    mitigation: 'Reschedule session to 14:00 slot',
  },
  {
    id: 'external',
    type: 'external',
    title: 'External Events',
    description: 'City marathon on same day — traffic expected',
    severity: 'low' as const,
    icon: MapPin,
    mitigation: 'Send early arrival notices to attendees',
  },
];

const severityColors = {
  low: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', badge: 'bg-success/10 text-success border-success/20' },
  medium: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', badge: 'bg-warning/10 text-warning border-warning/20' },
  high: { bg: 'bg-destructive/10', border: 'border-destructive/20', text: 'text-destructive', badge: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const RiskDashboard = () => {
  const highRisks = riskItems.filter(r => r.severity === 'high').length;
  const mediumRisks = riskItems.filter(r => r.severity === 'medium').length;
  const lowRisks = riskItems.filter(r => r.severity === 'low').length;
  const overallScore = 100 - (highRisks * 25 + mediumRisks * 10 + lowRisks * 2);

  return (
    <>
      <Helmet>
        <title>Risk Dashboard - SME Event Copilot</title>
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

        {/* Risk Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskItems.map((risk, index) => {
            const colors = severityColors[risk.severity];
            return (
              <motion.div
                key={risk.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card className={`${colors.bg} ${colors.border} border-2 h-full hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                          <risk.icon className={`w-5 h-5 ${colors.text}`} />
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

        {/* Risk Over Time Chart Placeholder */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Risk Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-secondary/30 rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Risk trend visualization</p>
                  <p className="text-sm text-muted-foreground/70">Historical data will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </>
  );
};

export default RiskDashboard;
