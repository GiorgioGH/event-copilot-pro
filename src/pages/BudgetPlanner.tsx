import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useEvent } from '@/contexts/EventContext';
import ConfigAssistant from '@/components/chat/ConfigAssistant';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  Building, 
  UtensilsCrossed, 
  Bus, 
  Gamepad2, 
  Gift, 
  Speaker,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { BudgetCategory } from '@/types/event';

const initialCategories: BudgetCategory[] = [
  { id: 'venue', name: 'Venue', allocated: 5000, recommended: 5000, spent: 4500, icon: 'Building' },
  { id: 'catering', name: 'Catering', allocated: 2500, recommended: 2500, spent: 1800, icon: 'UtensilsCrossed' },
  { id: 'transport', name: 'Transport', allocated: 800, recommended: 800, spent: 0, icon: 'Bus' },
  { id: 'activities', name: 'Activities', allocated: 1200, recommended: 1000, spent: 500, icon: 'Gamepad2' },
  { id: 'gifts', name: 'Gifts', allocated: 500, recommended: 400, spent: 0, icon: 'Gift' },
  { id: 'av', name: 'AV Equipment', allocated: 1200, recommended: 1200, spent: 1200, icon: 'Speaker' },
  { id: 'misc', name: 'Miscellaneous', allocated: 500, recommended: 300, spent: 100, icon: 'MoreHorizontal' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building,
  UtensilsCrossed,
  Bus,
  Gamepad2,
  Gift,
  Speaker,
  MoreHorizontal,
};

const BudgetPlanner = () => {
  const { currentPlan } = useEvent();
  const { toast } = useToast();
  const [categories, setCategories] = useState(initialCategories);
  
  const totalBudget = currentPlan?.basics.budget || 12000;
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const budgetUsedPercent = Math.round((totalAllocated / totalBudget) * 100);
  const isOverBudget = totalAllocated > totalBudget;

  const updateAllocation = (categoryId: string, value: number) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, allocated: value }
          : cat
      )
    );
  };

  const handleBudgetUpdate = useCallback((category: string, amount: number, operation: 'increase' | 'decrease' | 'set') => {
    setCategories(prev => 
      prev.map(cat => {
        if (cat.id === category || cat.name.toLowerCase() === category.toLowerCase()) {
          let newValue: number;
          switch (operation) {
            case 'increase':
              newValue = cat.allocated + amount;
              break;
            case 'decrease':
              newValue = Math.max(0, cat.allocated - amount);
              break;
            case 'set':
              newValue = amount;
              break;
            default:
              newValue = cat.allocated;
          }
          return { ...cat, allocated: newValue };
        }
        return cat;
      })
    );
    toast({
      title: "Budget Updated",
      description: `${category} budget ${operation === 'increase' ? 'increased' : operation === 'decrease' ? 'decreased' : 'set'} by $${amount.toLocaleString()}`,
    });
  }, [toast]);

  return (
    <>
      <Helmet>
        <title>Budget Planner - SME Event Copilot</title>
        <meta name="description" content="Plan and track your event budget with AI recommendations." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Budget Planner</h1>
          <p className="text-muted-foreground">Allocate and track your event budget</p>
        </motion.div>

        {/* Budget Summary Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`mb-8 ${isOverBudget ? 'border-destructive/50 bg-destructive/5' : 'border-success/50 bg-success/5'}`}>
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl ${isOverBudget ? 'bg-destructive/10' : 'bg-success/10'} flex items-center justify-center`}>
                    {isOverBudget ? (
                      <AlertTriangle className="w-7 h-7 text-destructive" />
                    ) : (
                      <CheckCircle2 className="w-7 h-7 text-success" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-foreground">
                        Estimated Total: ${totalAllocated.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="text-lg font-semibold text-foreground">
                        Budget: ${totalBudget.toLocaleString()}
                      </span>
                    </div>
                    <Badge className={`mt-1 ${isOverBudget ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-success/10 text-success border-success/20'} border`}>
                      {isOverBudget ? '✖ Over Budget' : '✔ Under Budget'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Spent so far</p>
                    <p className="text-xl font-bold text-foreground">${totalSpent.toLocaleString()}</p>
                  </div>
                  <Button variant="accent">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Optimize
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Budget utilization</span>
                  <span className={isOverBudget ? 'text-destructive' : 'text-foreground'}>{budgetUsedPercent}%</span>
                </div>
                <Progress value={Math.min(budgetUsedPercent, 100)} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Predictive Range */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-accent" />
                <div>
                  <span className="text-sm font-medium text-foreground">Projected final cost: </span>
                  <span className="text-sm text-muted-foreground">
                    92–108% of set budget (${Math.round(totalBudget * 0.92).toLocaleString()} – ${Math.round(totalBudget * 1.08).toLocaleString()})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category, index) => {
            const Icon = iconMap[category.icon] || DollarSign;
            const isOverAllocated = category.allocated > category.recommended * 1.2;
            const spentPercent = category.allocated > 0 ? Math.round((category.spent / category.allocated) * 100) : 0;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Card className={`h-full ${isOverAllocated ? 'border-warning/50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-accent" />
                        </div>
                        <CardTitle className="text-base font-semibold text-foreground">
                          {category.name}
                        </CardTitle>
                      </div>
                      {isOverAllocated && (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">AI Recommended</span>
                        <span className="text-foreground font-medium">${category.recommended.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Allocated</span>
                        <span className={`font-medium ${isOverAllocated ? 'text-warning' : 'text-foreground'}`}>
                          ${category.allocated.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Slider
                        value={[category.allocated]}
                        onValueChange={([value]) => updateAllocation(category.id, value)}
                        max={category.recommended * 2}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$0</span>
                        <span>${(category.recommended * 2).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="text-foreground">${category.spent.toLocaleString()} ({spentPercent}%)</span>
                      </div>
                      <Progress value={spentPercent} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
      
      <ConfigAssistant onBudgetUpdate={handleBudgetUpdate} />
    </>
  );
};

export default BudgetPlanner;
