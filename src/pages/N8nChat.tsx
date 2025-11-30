import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Zap,
  Trash2,
  Copy,
  Check,
  MessageCircle,
  PartyPopper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useEvent } from '@/contexts/EventContext';
import { EventPlan } from '@/types/event';
import { loadScrapedVendors } from '@/lib/vendors';

// n8n webhook URL
const N8N_WEBHOOK_URL = "https://clemens07.app.n8n.cloud/webhook/app";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const N8nChat = () => {
  const navigate = useNavigate();
  const { createEvent } = useEvent();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 Hi, I'm **Paul** – your Event Pal!

Tell me about the event you'd like to plan and I'll help you set everything up. Let's create something amazing together! ✨`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [eventCreated, setEventCreated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }

      let rawData = await response.json();
      
      // Handle n8n array responses (sometimes n8n wraps in array)
      if (Array.isArray(rawData)) {
        rawData = rawData[0];
      }

      console.log("Raw n8n response:", rawData, "Type:", typeof rawData);

      // Try to get a clean parsed object
      let parsedData: any = null;
      
      // Function to try parsing a string as JSON
      const tryParseJSON = (str: string): any => {
        try {
          return JSON.parse(str);
        } catch {
          return null;
        }
      };
      
      // Extract the actual content - n8n wraps responses in {output: "..."} 
      let contentStr = "";
      if (typeof rawData === "string") {
        contentStr = rawData;
      } else if (typeof rawData === "object" && rawData !== null) {
        // n8n wraps the response in output property
        contentStr = rawData.output || rawData.response || rawData.text || rawData.result || rawData.message || "";
      }

      console.log("Content string:", contentStr);

      // Try to parse the content as JSON
      if (typeof contentStr === "string" && contentStr.trim()) {
        parsedData = tryParseJSON(contentStr);
        if (!parsedData) {
          // It's just a plain text message
          parsedData = { message: contentStr };
        }
      } else if (typeof rawData === "object") {
        parsedData = rawData;
      } else {
        parsedData = { message: String(rawData) };
      }

      console.log("Parsed data:", parsedData);

      // Check if this is a finalized event
      const isDone = parsedData?.done === true;
      const eventData = parsedData?.event;
      
      console.log("isDone:", isDone, "hasEvent:", !!eventData);

      // Extract the message to display
      let aiResponse = "";
      if (parsedData?.message) {
        aiResponse = parsedData.message;
      } else if (parsedData?.response) {
        aiResponse = parsedData.response;
      } else if (parsedData?.output) {
        aiResponse = parsedData.output;
      } else if (parsedData?.text) {
        aiResponse = parsedData.text;
      } else if (typeof rawData === "string") {
        aiResponse = rawData;
      } else {
        aiResponse = "I received your message. How can I help you further?";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Create the event if done
      if (isDone && eventData) {
        setEventCreated(true);
        
        // Build the EventPlan from the response
        const newPlan: EventPlan = {
          id: `event-${Date.now()}`,
          basics: {
            name: eventData.basics?.name || 'New Event',
            type: eventData.basics?.type || 'workshop',
            dateRange: {
              start: eventData.basics?.dateRange?.start ? new Date(eventData.basics.dateRange.start) : null,
              end: eventData.basics?.dateRange?.end ? new Date(eventData.basics.dateRange.end) : null,
            },
            participants: eventData.basics?.participants || 0,
            budget: eventData.basics?.budget || 0,
            location: eventData.basics?.location || '',
          },
          requirements: {
            includeLunch: eventData.requirements?.includeLunch ?? true,
            accessibilityNeeded: eventData.requirements?.accessibilityNeeded ?? false,
            timelineFlexibility: eventData.requirements?.timelineFlexibility ?? 50,
            preferredTimeframe: eventData.requirements?.preferredTimeframe || 'full-day',
            venuePreference: eventData.requirements?.venuePreference || 'either',
          },
          specialConditions: {
            speakerNames: eventData.specialConditions?.speakerNames || [],
            dietaryRestrictions: eventData.specialConditions?.dietaryRestrictions || [],
            equipment: eventData.specialConditions?.equipment || [],
            preferredVendors: eventData.specialConditions?.preferredVendors || [],
          },
          riskScore: 'low',
          estimatedCost: eventData.basics?.budget || 0,
          status: 'planning',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Load vendors first to match preferred vendors
        const preferredVendorNames = eventData.specialConditions?.preferredVendors || [];
        console.log("🔍 Event data:", eventData);
        console.log("🔍 Preferred vendors from event:", preferredVendorNames);
        let matchedVendorIds: string[] = [];
        
        if (preferredVendorNames.length > 0) {
          try {
            const allVendors = await loadScrapedVendors();
            console.log(`Loaded ${allVendors.length} vendors, looking for:`, preferredVendorNames);
            
            for (const preferredName of preferredVendorNames) {
              // Find vendor by name (case-insensitive partial match, also check words)
              const searchTerms = preferredName.toLowerCase().split(/\s+/);
              
              const matchedVendor = allVendors.find(v => {
                const vendorNameLower = v.name.toLowerCase();
                // Direct partial match
                if (vendorNameLower.includes(preferredName.toLowerCase())) return true;
                if (preferredName.toLowerCase().includes(vendorNameLower)) return true;
                // Check if any word matches
                return searchTerms.some(term => 
                  term.length > 2 && vendorNameLower.includes(term)
                );
              });
              
              if (matchedVendor) {
                matchedVendorIds.push(matchedVendor.id);
                console.log(`✅ Matched vendor: "${preferredName}" -> "${matchedVendor.name}" (${matchedVendor.id})`);
              } else {
                console.log(`❌ No match found for vendor: "${preferredName}"`);
                // List some available vendors for debugging
                const sampleVendors = allVendors.slice(0, 5).map(v => v.name);
                console.log(`   Available vendors include: ${sampleVendors.join(', ')}...`);
              }
            }
          } catch (error) {
            console.error("Error loading vendors:", error);
          }
        }

        // Create the event with matched vendors
        createEvent(newPlan, matchedVendorIds);
        console.log("Event created with vendors:", matchedVendorIds);

        toast({
          title: "🎉 Event Created!",
          description: `"${newPlan.basics.name}" has been created. Redirecting to dashboard...`,
        });

        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }

    } catch (error) {
      console.error('n8n webhook error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "⚠️ Couldn't connect to the n8n webhook. Make sure your workflow is active and the webhook URL is correct.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Could not connect to n8n webhook. Please try again.",
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

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `👋 Hi, I'm **Paul** – your Event Pal!

Tell me about the event you'd like to plan and I'll help you set everything up. Let's create something amazing together! ✨`,
      timestamp: new Date(),
    }]);
    setEventCreated(false);
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been reset.",
    });
  };

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line) => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
        if (line.startsWith('- ')) {
          return `<li class="ml-4">${line.substring(2)}</li>`;
        }
        return line;
      })
      .join('<br/>');
  };

  return (
    <>
      <Helmet>
        <title>Chat with Paul - EventPaul</title>
        <meta name="description" content="Chat with Paul, your AI event planning assistant." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-4 py-6 h-[calc(100vh-120px)]">
        <div className="h-full flex flex-col max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Chat with Paul</h1>
                <p className="text-sm text-muted-foreground">Your AI Event Planning Assistant</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearChat}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </Button>
          </motion.div>

          {/* Chat Container */}
          <motion.div 
            className="flex-1 bg-card rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      layout
                      className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                          <Bot className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                      <div className={`max-w-[75%] ${message.role === 'user' ? 'order-first' : ''}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-secondary/50 text-foreground border border-border/50'
                          }`}
                        >
                          <div 
                            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                            className="prose prose-sm max-w-none"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-[10px] text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {message.role === 'assistant' && (
                            <button
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {copiedId === message.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary-foreground" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20">
                      <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                    </div>
                    <div className="bg-secondary/50 rounded-2xl px-4 py-3 border border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageCircle className="w-4 h-4 animate-pulse" />
                        <span>Processing through n8n workflow...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {eventCreated && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                        <PartyPopper className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-emerald-600">Event Created Successfully!</p>
                        <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={eventCreated ? "Event created! Redirecting..." : "Type your message..."}
                  disabled={isLoading || eventCreated}
                  className="flex-1 h-12 rounded-xl border-border/50 bg-background focus:ring-emerald-500/20"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading || eventCreated}
                  size="lg"
                  className="h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Press Enter to send • Connected to n8n webhook
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default N8nChat;

