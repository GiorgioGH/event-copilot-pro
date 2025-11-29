import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvent } from '@/contexts/EventContext';
import { Button } from '@/components/ui/button';
import StepIndicator from '@/components/onboarding/StepIndicator';
import EventBasicsForm from '@/components/onboarding/EventBasicsForm';
import EventRequirementsForm from '@/components/onboarding/EventRequirementsForm';
import SpecialConditionsForm from '@/components/onboarding/SpecialConditionsForm';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const stepLabels = ['Basics', 'Requirements', 'Details'];

const Onboarding = () => {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, setIsGenerating } = useEvent();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate plan
      setIsGenerating(true);
      navigate('/generating');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <Helmet>
        <title>Define Your Event - SME Event Copilot</title>
        <meta name="description" content="Create your corporate event plan with our AI-powered wizard." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold text-foreground hover:text-accent transition-colors"
            >
              SME Event Copilot
            </button>
            <span className="text-sm text-muted-foreground">Step {currentStep} of 3</span>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 max-w-3xl">
          <StepIndicator currentStep={currentStep} totalSteps={3} labels={stepLabels} />

          <motion.div
            className="bg-card rounded-2xl border border-border p-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {currentStep === 1 && <EventBasicsForm key="step1" />}
              {currentStep === 2 && <EventRequirementsForm key="step2" />}
              {currentStep === 3 && <SpecialConditionsForm key="step3" />}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <Button 
                variant={currentStep === 3 ? 'hero' : 'default'} 
                onClick={handleNext}
              >
                {currentStep === 3 ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Event Plan
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default Onboarding;
