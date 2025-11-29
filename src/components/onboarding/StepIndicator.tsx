import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

const StepIndicator = ({ currentStep, totalSteps, labels }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <motion.div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300',
                step < currentStep
                  ? 'bg-success text-success-foreground'
                  : step === currentStep
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground'
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {step < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step
              )}
            </motion.div>
            <span className={cn(
              'text-xs mt-2 font-medium transition-colors duration-300',
              step === currentStep ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {labels[index]}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div className={cn(
              'w-16 md:w-24 h-0.5 mx-2 mt-[-20px] transition-colors duration-300',
              step < currentStep ? 'bg-success' : 'bg-secondary'
            )} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
