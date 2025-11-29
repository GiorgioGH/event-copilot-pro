import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvent } from '@/contexts/EventContext';
import { Loader2, CheckCircle2, Sparkles, Calendar, Users, Shield, DollarSign } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const analysisSteps = [
  { id: 1, text: 'Analyzing constraints...', icon: Shield, duration: 1500 },
  { id: 2, text: 'Selecting optimal vendors...', icon: Users, duration: 2000 },
  { id: 3, text: 'Constructing timeline...', icon: Calendar, duration: 1800 },
  { id: 4, text: 'Building budget allocation...', icon: DollarSign, duration: 1500 },
  { id: 5, text: 'Finalizing your event plan...', icon: Sparkles, duration: 1200 },
];

const Generating = () => {
  const navigate = useNavigate();
  const { setIsGenerating, eventBasics, eventRequirements, eventSpecialConditions, setCurrentPlan } = useEvent();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const runStep = (index: number) => {
      if (index >= analysisSteps.length) {
        // All steps complete, generate mock plan and navigate
        setTimeout(() => {
          setCurrentPlan({
            id: `event-${Date.now()}`,
            basics: eventBasics as any,
            requirements: eventRequirements as any,
            specialConditions: eventSpecialConditions as any,
            riskScore: 'low',
            estimatedCost: eventBasics.budget ? eventBasics.budget * 0.85 : 10000,
            status: 'planning',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          setIsGenerating(false);
          navigate('/dashboard');
        }, 500);
        return;
      }

      setCurrentStepIndex(index);
      
      timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, analysisSteps[index].id]);
        runStep(index + 1);
      }, analysisSteps[index].duration);
    };

    runStep(0);

    return () => clearTimeout(timeout);
  }, []);

  const currentStep = analysisSteps[currentStepIndex];

  return (
    <>
      <Helmet>
        <title>Generating Your Event Plan - SME Event Copilot</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center px-6">
          {/* Animated icon */}
          <motion.div
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-accent/20 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="w-12 h-12 text-accent" />
          </motion.div>

          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Building Your Event Plan
          </motion.h1>
          
          <motion.p 
            className="text-primary-foreground/70 mb-12 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Our AI is analyzing your requirements to create the optimal event plan
          </motion.p>

          {/* Steps list */}
          <div className="max-w-sm mx-auto space-y-4">
            {analysisSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStepIndex === index && !isCompleted;
              
              return (
                <motion.div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isCompleted 
                      ? 'bg-success/20 border border-success/30' 
                      : isCurrent 
                      ? 'bg-primary-foreground/10 border border-primary-foreground/20'
                      : 'bg-primary-foreground/5 border border-transparent'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-success/20' 
                      : isCurrent 
                      ? 'bg-accent/20'
                      : 'bg-primary-foreground/10'
                  }`}>
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </motion.div>
                      ) : isCurrent ? (
                        <motion.div
                          key="loading"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 className="w-5 h-5 text-accent" />
                        </motion.div>
                      ) : (
                        <step.icon className="w-5 h-5 text-primary-foreground/40" />
                      )}
                    </AnimatePresence>
                  </div>
                  <span className={`text-sm font-medium ${
                    isCompleted 
                      ? 'text-success' 
                      : isCurrent 
                      ? 'text-primary-foreground'
                      : 'text-primary-foreground/40'
                  }`}>
                    {step.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Generating;
