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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Good day. I am your Configuration Assistant for event planning. I can help you adjust budget allocations, update participant counts, modify equipment requirements, and analyze the impact of changes on your event. How may I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { 
    eventBasics, 
    setEventBasics, 
    eventRequirements, 
    setEventRequirements,
    eventSpecialConditions,
    setEventSpecialConditions
  } = useEvent();

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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('event-copilot-chat', {
        body: {
          message: input.trim(),
          eventContext: {
            basics: eventBasics,
            requirements: eventRequirements,
            specialConditions: eventSpecialConditions,
          }
        }
      });

      if (error) throw error;

      // Handle the action if any
      if (data.action && data.action !== 'none' && data.parameters) {
        handleAction(data.action, data.parameters);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I could not process your request.',
        timestamp: new Date(),
        riskUpdate: data.risk_update,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Error",
        description: "Failed to process your request",
        variant: "destructive",
      });
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
