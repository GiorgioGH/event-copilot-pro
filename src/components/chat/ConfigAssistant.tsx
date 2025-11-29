import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEvent } from '@/contexts/EventContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  riskUpdate?: {
    budget_risk?: string | null;
    capacity_risk?: string | null;
    reason?: string | null;
  } | null;
}

interface ConfigAssistantProps {
  onBudgetUpdate?: (category: string, amount: number, operation: 'increase' | 'decrease' | 'set') => void;
}

const ConfigAssistant = ({ onBudgetUpdate }: ConfigAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    currentPlan,
    selectedVendors,
    tasks,
    eventBasics, 
    setEventBasics, 
    eventRequirements, 
    setEventRequirements,
    eventSpecialConditions,
    setEventSpecialConditions
  } = useEvent();

  const getInitialMessage = (): string => {
    if (!currentPlan) {
      return 'Hello! I am your Event Planning Assistant. Create an event first, and I can help you with planning, vendor selection, tasks, and budget management.';
    }
    
    const plan = currentPlan;
    const selectedCount = selectedVendors.length;
    const tasksCount = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    
    let advice = `Hello! I'm here to help you plan "${plan.basics.name || 'your event'}". `;
    
    // Provide specific advice based on event state
    const advicePoints: string[] = [];
    
    if (selectedCount === 0) {
      advicePoints.push('You haven\'t selected any vendors yet. I recommend selecting a venue first.');
    } else if (selectedCount < 3) {
      advicePoints.push(`You have ${selectedCount} vendor(s) selected. Consider adding more vendors for a complete event setup.`);
    }
    
    if (tasksCount === 0) {
      advicePoints.push('No tasks have been created. I can help you identify what needs to be done.');
    } else if (completedTasks < tasksCount) {
      advicePoints.push(`You have ${completedTasks} of ${tasksCount} tasks completed. Keep up the progress!`);
    }
    
    if (plan.status === 'draft') {
      advicePoints.push('Your event is still in draft. Consider finalizing vendor selections and confirming bookings.');
    }
    
    if (plan.riskScore === 'high') {
      advicePoints.push('⚠️ Your event has high risk factors. Let me know what you need help with to mitigate risks.');
    }
    
    if (advicePoints.length > 0) {
      advice += '\n\nHere\'s what I noticed:\n' + advicePoints.map(p => `• ${p}`).join('\n');
    } else {
      advice += 'Your event planning looks good! How can I help you today?';
    }
    
    advice += '\n\nI can help you with:\n• Selecting and comparing vendors\n• Managing tasks and timeline\n• Budget optimization\n• Risk mitigation\n• Answering questions about your event';
    
    return advice;
  };

  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize or update initial message when event changes
  useEffect(() => {
    // Only update if this is the first message or we're switching events
    if (messages.length === 0 || (messages.length === 1 && messages[0].id === '1')) {
      const initialContent = getInitialMessage();
      setMessages([{
        id: '1',
        role: 'assistant',
        content: initialContent,
        timestamp: new Date(),
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlan?.id, selectedVendors.length, tasks.length]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAction = (action: string, parameters: Record<string, any>) => {
    switch (action) {
      case 'update_budget':
        if (onBudgetUpdate && parameters.category && parameters.amount !== undefined) {
          onBudgetUpdate(parameters.category, parameters.amount, parameters.operation || 'increase');
        }
        break;
      
      case 'update_participants':
        if (parameters.count !== undefined) {
          setEventBasics({ ...eventBasics, participants: parameters.count });
          toast({
            title: "Participants Updated",
            description: `Expected attendees set to ${parameters.count}`,
          });
        }
        break;
      
      case 'update_timeline_flexibility':
        if (parameters.flexibility !== undefined) {
          setEventRequirements({ ...eventRequirements, timelineFlexibility: parameters.flexibility });
          toast({
            title: "Timeline Updated",
            description: `Flexibility set to ${parameters.flexibility}%`,
          });
        }
        break;
      
      case 'add_equipment':
        if (parameters.equipment) {
          const currentEquipment = eventSpecialConditions.equipment || [];
          if (!currentEquipment.includes(parameters.equipment)) {
            setEventSpecialConditions({
              ...eventSpecialConditions,
              equipment: [...currentEquipment, parameters.equipment]
            });
            toast({
              title: "Equipment Added",
              description: `Added ${parameters.equipment} to requirements`,
            });
          }
        }
        break;
      
      case 'update_event_type':
        if (parameters.type) {
          setEventBasics({ ...eventBasics, type: parameters.type });
          toast({
            title: "Event Type Updated",
            description: `Changed to ${parameters.type.replace('-', ' ')}`,
          });
        }
        break;
    }
  };

  const generateAdvice = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Vendor-related queries
    if (message.includes('vendor') || message.includes('venue') || message.includes('catering')) {
      if (selectedVendors.length === 0) {
        return 'You haven\'t selected any vendors yet. I recommend:\n\n1. Start by selecting a venue that matches your event size and location preferences\n2. Add catering services if your event includes meals\n3. Consider transportation if attendees need to be shuttled\n4. Book AV equipment if your venue doesn\'t provide it\n\nWould you like me to help you find vendors based on your event requirements?';
      }
      return `You have ${selectedVendors.length} vendor(s) selected. That's a good start! For a complete event, you typically need:\n\n• 1 Venue (required)\n• 1 Catering service (if serving food)\n• 1 Transport service (if needed)\n• 1 AV Equipment provider (if venue doesn't include it)\n• Activities/Entertainment (optional)\n\nWould you like to compare vendors or add more?`;
    }
    
    // Task-related queries
    if (message.includes('task') || message.includes('todo') || message.includes('what to do') || message.includes('what needs to be done')) {
      const pendingTasks = tasks.filter(t => t.status !== 'completed');
      if (pendingTasks.length === 0) {
        return 'Great! All your tasks are completed. Here are some general tasks to consider:\n\n• Confirm all vendor bookings\n• Send invitations to attendees\n• Prepare event materials and badges\n• Set up registration desk\n• Coordinate with speakers/presenters\n• Arrange final walkthrough with venue\n\nWould you like me to add any of these to your task list?';
      }
      return `You have ${pendingTasks.length} pending task(s). Here are your high-priority items:\n\n${pendingTasks.slice(0, 5).map(t => `• ${t.title} (Due: ${t.dueDate.toLocaleDateString()})`).join('\n')}\n\nI recommend focusing on high-priority tasks first. Would you like me to help prioritize or break down any specific task?`;
    }
    
    // Budget-related queries
    if (message.includes('budget') || message.includes('cost') || message.includes('price') || message.includes('money')) {
      if (!currentPlan) {
        return 'I need to know your event budget to provide budget advice. What is your total budget for this event?';
      }
      const totalVendorCost = selectedVendors.length * 5000; // Rough estimate
      const budgetUsed = (totalVendorCost / currentPlan.basics.budget) * 100;
      return `Based on your selected vendors, you're approximately ${Math.round(budgetUsed)}% through your budget of $${currentPlan.basics.budget.toLocaleString()}.\n\nRecommendations:\n• Review vendor prices and compare alternatives\n• Consider package deals from vendors\n• Allocate 10-15% buffer for unexpected costs\n• Track spending in the Budget Planner\n\nWould you like me to help optimize your budget allocation?`;
    }
    
    // Risk-related queries
    if (message.includes('risk') || message.includes('problem') || message.includes('issue') || message.includes('concern')) {
      if (!currentPlan) {
        return 'I can help identify and mitigate risks once you have an event plan. Create an event first, then I can analyze potential risks.';
      }
      const risks: string[] = [];
      if (selectedVendors.length === 0) risks.push('No vendors selected - venue booking is critical');
      if (tasks.filter(t => t.status === 'pending' && t.priority === 'high').length > 0) {
        risks.push('High-priority tasks are pending');
      }
      if (currentPlan.riskScore === 'high') {
        risks.push('Overall risk score is high - needs attention');
      }
      if (risks.length === 0) {
        return 'Your event planning looks good! I don\'t see any major risks at the moment. Keep up the good work!';
      }
      return `I've identified ${risks.length} risk area(s):\n\n${risks.map(r => `• ${r}`).join('\n')}\n\nWould you like me to help you create a mitigation plan for any of these?`;
    }
    
    // General help
    if (message.includes('help') || message.includes('what can you do')) {
      return `I can help you with:\n\n📋 **Task Management**\n• Identify what needs to be done\n• Prioritize tasks\n• Track progress\n\n🏢 **Vendor Selection**\n• Recommend vendors based on your needs\n• Compare vendor options\n• Help with vendor selection\n\n💰 **Budget Planning**\n• Optimize budget allocation\n• Track spending\n• Identify cost-saving opportunities\n\n⚠️ **Risk Management**\n• Identify potential risks\n• Suggest mitigation strategies\n• Monitor risk factors\n\nAsk me anything about your event planning!`;
    }
    
    // Default response
    return `I understand you're asking about "${userMessage}". Let me help you with that.\n\nBased on your current event:\n• ${selectedVendors.length} vendor(s) selected\n• ${tasks.length} task(s) in your list\n• Event status: ${currentPlan?.status || 'draft'}\n\nCould you be more specific about what you need help with? For example:\n• "What vendors do I need?"\n• "What tasks should I prioritize?"\n• "How's my budget looking?"\n• "What are the risks?"`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Try Supabase function first, fallback to local advice
      let response: string;
      try {
        const { data, error } = await supabase.functions.invoke('event-copilot-chat', {
          body: {
            message: userInput,
            eventContext: {
              plan: currentPlan,
              selectedVendors,
              tasks,
              basics: eventBasics,
              requirements: eventRequirements,
              specialConditions: eventSpecialConditions,
            }
          }
        });

        if (!error && data?.response) {
          response = data.response;
          // Handle the action if any
          if (data.action && data.action !== 'none' && data.parameters) {
            handleAction(data.action, data.parameters);
          }
        } else {
          // Fallback to local advice generation
          response = generateAdvice(userInput);
        }
      } catch (error) {
        // Fallback to local advice if Supabase fails
        console.log('Using local advice generation');
        response = generateAdvice(userInput);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Let me try a different approach...\n\n' + generateAdvice(userInput),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full shadow-lg bg-accent hover:bg-accent/90"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary-foreground" />
                <span className="font-semibold text-primary-foreground">Configuration Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-accent" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {message.content}
                      </div>
                      {message.riskUpdate && (message.riskUpdate.budget_risk || message.riskUpdate.capacity_risk) && (
                        <div className="mt-2 p-2 rounded-lg bg-warning/10 border border-warning/20 text-xs">
                          <div className="flex items-center gap-1 text-warning mb-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="font-medium">Risk Update</span>
                          </div>
                          {message.riskUpdate.budget_risk && (
                            <p className="text-muted-foreground">Budget Risk: <span className="capitalize">{message.riskUpdate.budget_risk}</span></p>
                          )}
                          {message.riskUpdate.capacity_risk && (
                            <p className="text-muted-foreground">Capacity Risk: <span className="capitalize">{message.riskUpdate.capacity_risk}</span></p>
                          )}
                          {message.riskUpdate.reason && (
                            <p className="text-muted-foreground mt-1">{message.riskUpdate.reason}</p>
                          )}
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-accent-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                      Analyzing request...
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a command..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-accent hover:bg-accent/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Try: "Increase catering budget by $500" or "We expect 150 people"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConfigAssistant;
