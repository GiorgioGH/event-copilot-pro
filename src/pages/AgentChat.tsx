import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Building2, 
  Users, 
  Search,
  RefreshCw,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DashboardNav from '@/components/dashboard/DashboardNav';

// N8N Webhook URL - calls your AI agent directly
const N8N_WEBHOOK_URL = "https://clemens07.app.n8n.cloud/webhook-test/6c2f381b-d7e6-4404-a10d-fd18e9b7202d";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ConversationHistory {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedQueries = [
  { icon: Building2, text: "What venues are available in Copenhagen?", category: "Venues" },
  { icon: Users, text: "Show me employees in the Sales department", category: "People" },
  { icon: Search, text: "Find catering options for 100 people", category: "Catering" },
  { icon: Sparkles, text: "Recommend vendors for a corporate conference", category: "Recommendation" },
];

const AgentChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 Hello! I'm your **Event Data Agent**, powered by AI.

I have access to comprehensive data about:
- **Vendors** - Venues, catering, transport, activities, and AV equipment in Copenhagen
- **People** - Employee information including departments, locations, and roles

Ask me anything about planning your corporate event! For example:
- "What venues can accommodate 200 people?"
- "Show me catering options with vegan menus"
- "Find employees in the Marketing department"
- "Recommend vendors for a team building event"`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

    const newHistory: ConversationHistory[] = [
      ...conversationHistory,
      { role: 'user', content: text }
    ];

    try {
      // Call n8n webhook directly
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          conversationHistory: newHistory.slice(-10), // Keep last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats from n8n
      let aiResponse = "";
      if (typeof data === "string") {
        aiResponse = data;
      } else if (data.response) {
        aiResponse = data.response;
      } else if (data.output) {
        aiResponse = data.output;
      } else if (data.message) {
        aiResponse = data.message;
      } else if (data.text) {
        aiResponse = data.text;
      } else {
        aiResponse = JSON.stringify(data, null, 2);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse || "I apologize, but I couldn't process your request. Please try again.",
        timestamp: new Date(),
        sources: data?.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: assistantMessage.content }
      ]);

    } catch (error) {
      console.error('Agent chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error connecting to the AI service. Please check that your n8n webhook is active and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Could not connect to the AI agent. Please try again.",
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
      content: `👋 Hello! I'm your **Event Data Agent**, powered by AI.

I have access to comprehensive data about:
- **Vendors** - Venues, catering, transport, activities, and AV equipment in Copenhagen
- **People** - Employee information including departments, locations, and roles

Ask me anything about planning your corporate event!`,
      timestamp: new Date(),
    }]);
    setConversationHistory([]);
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been reset.",
    });
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
        // Bullet points
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
        <title>AI Agent Chat - SME Event Copilot</title>
        <meta name="description" content="Chat with our AI agent to explore event data and get recommendations." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-4 py-6 h-[calc(100vh-120px)]">
        <div className="h-full flex flex-col max-w-5xl mx-auto">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center shadow-lg shadow-accent/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Event Data Agent</h1>
                <p className="text-sm text-muted-foreground">Powered by n8n • Access vendors & people data</p>
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-orange-400/20 flex items-center justify-center flex-shrink-0 border border-accent/20">
                          <Bot className="w-5 h-5 text-accent" />
                        </div>
                      )}
                      <div className={`max-w-[75%] ${message.role === 'user' ? 'order-first' : ''}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-accent to-orange-400 text-white shadow-lg shadow-accent/20'
                              : 'bg-secondary/50 text-foreground border border-border/50'
                          }`}
                        >
                          <div 
                            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                            className="prose prose-sm max-w-none"
                          />
                        </div>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.sources.map((source, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                📄 {source}
                              </Badge>
                            ))}
                          </div>
                        )}
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
                                <Check className="w-3 h-3 text-success" />
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-orange-400/20 flex items-center justify-center border border-accent/20">
                      <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    </div>
                    <div className="bg-secondary/50 rounded-2xl px-4 py-3 border border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing data and generating response...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Suggested Queries */}
            {messages.length === 1 && (
              <motion.div 
                className="px-6 pb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs text-muted-foreground mb-3">Suggested queries:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQueries.map((query, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => sendMessage(query.text)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-background/50 hover:bg-secondary/50 hover:border-accent/30 transition-all text-left group"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <query.icon className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{query.text}</p>
                        <p className="text-xs text-muted-foreground">{query.category}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about vendors, venues, people, or event planning..."
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-xl border-border/50 bg-background focus:ring-accent/20"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  size="lg"
                  className="h-12 px-6 rounded-xl bg-gradient-to-r from-accent to-orange-400 hover:from-accent/90 hover:to-orange-400/90 shadow-lg shadow-accent/20"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Press Enter to send • AI responses are generated from your event data
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default AgentChat;

