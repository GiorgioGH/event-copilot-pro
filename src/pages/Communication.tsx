import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useEvent } from '@/contexts/EventContext';
import { loadScrapedVendors } from '@/lib/vendors';
import { Vendor } from '@/types/event';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Bot, 
  Store,
  Send,
  Sparkles,
  PhoneCall,
  Loader2,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSponsorSuggestions, Contact, ChatMessage } from '@/lib/sponsors';
import { supabase } from '@/integrations/supabase/client';

// AI Call Webhook URL
const AI_CALL_WEBHOOK_URL = "https://clemens07.app.n8n.cloud/webhook/call";

const Communication = () => {
  const { currentPlan, selectedVendors } = useEvent();
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sponsors, setSponsors] = useState<Contact[]>([]);
  const [isCallingAI, setIsCallingAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadScrapedVendors().then(vendors => {
      setAllVendors(vendors);
      
      // Create contacts from selected vendors
      const selectedVendorData = vendors.filter(v => selectedVendors.includes(v.id));
      const vendorContacts: Contact[] = selectedVendorData.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email || `${vendor.name.toLowerCase().replace(/\s+/g, '.')}@vendor.com`,
        phone: vendor.phone || undefined,
        type: 'vendor' as const,
        vendorType: vendor.type,
        messages: [
          {
            id: 'system-1',
            sender: 'system',
            message: vendor.email 
              ? 'This chat is connected via email. All messages you send here will be automatically sent as emails to the vendor.'
              : 'Email address not available for this vendor. Please contact them through their website.',
            timestamp: new Date(),
          },
        ],
      }));
      
      setContacts(vendorContacts);
      
      // Get sponsor suggestions
      if (currentPlan?.basics?.type) {
        const suggestedSponsors = getSponsorSuggestions(currentPlan.basics.type);
        setSponsors(suggestedSponsors);
      }
    });
  }, [selectedVendors, currentPlan]);

  const handleSendMessage = async (contactId: string) => {
    if (!messageInput.trim()) return;
    
    const contact = contacts.find(c => c.id === contactId) || sponsors.find(s => s.id === contactId);
    if (!contact || !contact.email) {
      toast({
        title: "Error",
        description: "Contact email address not available.",
        variant: "destructive",
      });
      return;
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      message: messageInput,
      timestamp: new Date(),
    };
    
    // Optimistically update UI
    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        return { ...c, messages: [...c.messages, newMessage] };
      }
      return c;
    }));
    
    setSponsors(prev => prev.map(s => {
      if (s.id === contactId) {
        return { ...s, messages: [...s.messages, newMessage] };
      }
      return s;
    }));
    
    const messageToSend = messageInput;
    setMessageInput('');
    
    try {
      // Get user's email from Supabase auth or use a default
      let userEmail = 'noreply@eventcopilot.com';
      let userName = 'Event Copilot User';
      
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        userEmail = user?.email || userEmail;
        userName = user?.user_metadata?.full_name || userName;
      }

      // Get event details for email context
      const eventName = currentPlan?.basics?.name || 'Corporate Event';
      const eventDate = currentPlan?.basics?.dateRange?.start 
        ? new Date(currentPlan.basics.dateRange.start).toLocaleDateString()
        : 'TBD';
      const participants = currentPlan?.basics?.participants || 0;

      // Create email subject and body
      const emailSubject = `Inquiry about ${contact.name} - ${eventName}`;
      const emailBody = `Hello ${contact.name},\n\n${messageToSend}\n\n---\nEvent Details:\nEvent: ${eventName}\nDate: ${eventDate}\nParticipants: ${participants}\n\nBest regards,\n${userName}\n${userEmail}`;

      // Call local email server (or Supabase Edge Function as fallback)
      const EMAIL_SERVER_URL = import.meta.env.VITE_EMAIL_SERVER_URL || 'http://localhost:3001';
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      
      let response;
      try {
        // Try local email server first
        response = await fetch(`${EMAIL_SERVER_URL}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: contact.email,
            subject: emailSubject,
            body: emailBody,
            fromEmail: userEmail,
            fromName: userName,
          }),
        });
      } catch (localError) {
        console.log('Local email server not available, trying Supabase...');
        // Fallback to Supabase Edge Function
        response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            to: contact.email,
            subject: emailSubject,
            body: emailBody,
            fromEmail: userEmail,
            fromName: userName,
          }),
        });
      }

      const result = await response.json();

      if (result.mailtoLink) {
        // Gmail API not configured, open mailto: link
        window.location.href = result.mailtoLink;
        toast({
          title: "Email Client Opened",
          description: "Your email client has been opened with the message. Please send it manually.",
        });
      } else if (result.success) {
        toast({
          title: "Message Sent",
          description: "Your message has been sent via email.",
        });
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      // Remove the optimistic message on error
      setContacts(prev => prev.map(c => {
        if (c.id === contactId) {
          return { ...c, messages: c.messages.filter(m => m.id !== newMessage.id) };
        }
        return c;
      }));
      setSponsors(prev => prev.map(s => {
        if (s.id === contactId) {
          return { ...s, messages: s.messages.filter(m => m.id !== newMessage.id) };
        }
        return s;
      }));
      
      toast({
        title: "Error Sending Email",
        description: error instanceof Error ? error.message : "Failed to send email. Please try again.",
        variant: "destructive",
      });
    }
  };

  // AI Call function - similar to chat webhook handling
  const handleAICall = async () => {
    setIsCallingAI(true);
    
    try {
      const response = await fetch(AI_CALL_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Call about ${currentPlan?.basics?.name || "Event"}`,
          eventName: currentPlan?.basics?.name || "Event",
          eventType: currentPlan?.basics?.type || "corporate",
          participants: currentPlan?.basics?.participants || 0,
          date: currentPlan?.basics?.dateRange?.start || null,
          selectedVendors: contacts.map(c => c.name),
          contact: currentContact?.name || null,
          contactEmail: currentContact?.email || null,
          contactPhone: currentContact?.phone || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Call failed: ${response.status}`);
      }

      let rawData = await response.json();
      
      // Handle n8n array responses
      if (Array.isArray(rawData)) {
        rawData = rawData[0];
      }

      console.log("AI Call raw response:", rawData);

      // Extract content from n8n output wrapper (similar to chat)
      let responseMessage = "";
      if (typeof rawData === "string") {
        responseMessage = rawData;
      } else if (rawData.output) {
        // n8n wraps response in output property
        try {
          const parsed = JSON.parse(rawData.output);
          responseMessage = parsed.message || parsed.response || parsed.output || rawData.output;
        } catch {
          responseMessage = rawData.output;
        }
      } else if (rawData.message) {
        responseMessage = rawData.message;
      } else if (rawData.response) {
        responseMessage = rawData.response;
      } else {
        responseMessage = "AI Call initiated successfully!";
      }

      console.log("AI Call response message:", responseMessage);

      toast({
        title: "📞 AI Call Initiated",
        description: responseMessage,
      });
    } catch (error) {
      console.error("AI Call error:", error);
      toast({
        title: "Call Failed",
        description: "Could not connect to AI call service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCallingAI(false);
    }
  };

  // Generate pre-written email template with event details
  const insertEmailTemplate = () => {
    const eventName = currentPlan?.basics?.name || 'our upcoming event';
    const eventType = currentPlan?.basics?.type?.replace('-', ' ') || 'corporate event';
    const eventDate = currentPlan?.basics?.dateRange?.start 
      ? new Date(currentPlan.basics.dateRange.start).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'a date to be confirmed';
    const participants = currentPlan?.basics?.participants || 'approximately 50';
    const location = currentPlan?.basics?.location || 'Copenhagen';
    const contactName = currentContact?.name || 'your team';

    const template = `Hi ${contactName},

I hope this message finds you well! I'm reaching out regarding ${eventName}, a ${eventType} we're planning for ${eventDate} in ${location}.

We're expecting ${participants} participants and would love to explore how we can work together to make this event a success.

Could you please provide information about:
• Availability for our date
• Pricing and packages
• Any special requirements or considerations

Looking forward to hearing from you!

Best regards`;

    setMessageInput(template);
  };

  // Derive currentContact from updated arrays to always show latest messages
  const currentContact = selectedContact 
    ? (contacts.find(c => c.id === selectedContact.id) || sponsors.find(s => s.id === selectedContact.id) || selectedContact)
    : (contacts[0] || sponsors[0]);

  return (
    <>
      <Helmet>
        <title>Communication - EventPaul</title>
        <meta name="description" content="Communicate with vendors and sponsors for your event." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Communication</h1>
          <p className="text-muted-foreground">Chat with vendors and sponsors via email</p>
        </motion.div>

        <Tabs defaultValue="vendors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="vendors">
              <Store className="w-4 h-4 mr-2" />
              Vendors ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="sponsors">
              <Sparkles className="w-4 h-4 mr-2" />
              Sponsors ({sponsors.length})
            </TabsTrigger>
          </TabsList>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            {/* Paul's Vendor Summary */}
            {contacts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-accent" />
                      Paul's Vendor Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      You have {contacts.length} selected vendor{contacts.length !== 1 ? 's' : ''}. 
                      Click on any vendor below to view your email conversation and contact them.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {contacts.map(contact => (
                        <div
                          key={contact.id}
                          className="p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedContact(contact)}
                        >
                          <p className="font-medium text-foreground">{contact.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{contact.email}</p>
                          <Badge variant="outline" className="mt-2 text-xs capitalize">
                            {contact.vendorType?.replace('-', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Chat Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vendor Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contacts.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No vendors selected. Select vendors from the Vendors page.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {contacts.map(contact => (
                          <div
                            key={contact.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedContact?.id === contact.id
                                ? 'border-accent bg-accent/5'
                                : 'border-border hover:bg-secondary/50'
                            }`}
                            onClick={() => setSelectedContact(contact)}
                          >
                            <p className="font-medium text-foreground">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {contact.vendorType?.replace('-', ' ')}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {contact.messages.length} messages
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2">
                {currentContact && currentContact.type === 'vendor' ? (
                  <Card className="h-[600px] flex flex-col">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{currentContact.name}</CardTitle>
                          <div className="flex items-center gap-4 mt-2">
                            <a href={`mailto:${currentContact.email}`} className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {currentContact.email}
                            </a>
                            {currentContact.phone && (
                              <a href={`tel:${currentContact.phone}`} className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {currentContact.phone}
                              </a>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleAICall}
                          disabled={isCallingAI}
                          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white gap-2"
                        >
                          {isCallingAI ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Calling...
                            </>
                          ) : (
                            <>
                              <PhoneCall className="w-4 h-4" />
                              AI Call
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {currentContact.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                msg.sender === 'me'
                                  ? 'bg-accent text-accent-foreground'
                                  : msg.sender === 'system'
                                  ? 'bg-muted text-muted-foreground border border-border'
                                  : 'bg-secondary text-foreground'
                              }`}
                            >
                              {msg.sender === 'system' && (
                                <div className="flex items-center gap-2 mb-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="text-xs font-medium">Email Connected</span>
                                </div>
                              )}
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Message Input */}
                      <div className="border-t p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={insertEmailTemplate}
                            className="gap-2 text-xs"
                          >
                            <FileText className="w-3 h-3" />
                            Insert Template
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Type a message (sent via email)..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && messageInput.trim()) {
                                e.preventDefault();
                                handleSendMessage(currentContact.id);
                              }
                            }}
                            className="min-h-[80px] resize-none"
                            rows={3}
                          />
                          <Button
                            size="icon"
                            onClick={() => handleSendMessage(currentContact.id)}
                            disabled={!messageInput.trim()}
                            className="h-auto"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a vendor to start chatting</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors" className="space-y-6">
            {/* Paul's Sponsor Suggestions */}
            {sponsors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-accent" />
                      Paul's Sponsor Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Based on your event type ({currentPlan?.basics?.type || 'event'}), 
                      Paul suggests these potential sponsors. Click on any sponsor to start a conversation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sponsors.map(sponsor => (
                        <div
                          key={sponsor.id}
                          className="p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedContact(sponsor)}
                        >
                          <p className="font-medium text-foreground">{sponsor.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{sponsor.email}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            Sponsor
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Chat Interface for Sponsors */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sponsor List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sponsor Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sponsors.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No sponsor suggestions available. Select an event to see suggestions.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {sponsors.map(sponsor => (
                          <div
                            key={sponsor.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedContact?.id === sponsor.id
                                ? 'border-accent bg-accent/5'
                                : 'border-border hover:bg-secondary/50'
                            }`}
                            onClick={() => setSelectedContact(sponsor)}
                          >
                            <p className="font-medium text-foreground">{sponsor.name}</p>
                            <p className="text-xs text-muted-foreground">{sponsor.email}</p>
                            <Badge variant="secondary" className="text-xs mt-2">
                              {sponsor.messages.length} messages
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2">
                {currentContact && currentContact.type === 'sponsor' ? (
                  <Card className="h-[600px] flex flex-col">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{currentContact.name}</CardTitle>
                          <div className="flex items-center gap-4 mt-2">
                            <a href={`mailto:${currentContact.email}`} className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {currentContact.email}
                            </a>
                            {currentContact.phone && (
                              <a href={`tel:${currentContact.phone}`} className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {currentContact.phone}
                              </a>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleAICall}
                          disabled={isCallingAI}
                          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white gap-2"
                        >
                          {isCallingAI ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Calling...
                            </>
                          ) : (
                            <>
                              <PhoneCall className="w-4 h-4" />
                              AI Call
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {currentContact.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                msg.sender === 'me'
                                  ? 'bg-accent text-accent-foreground'
                                  : msg.sender === 'system'
                                  ? 'bg-muted text-muted-foreground border border-border'
                                  : 'bg-secondary text-foreground'
                              }`}
                            >
                              {msg.sender === 'system' && (
                                <div className="flex items-center gap-2 mb-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="text-xs font-medium">Email Connected</span>
                                </div>
                              )}
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Message Input */}
                      <div className="border-t p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={insertEmailTemplate}
                            className="gap-2 text-xs"
                          >
                            <FileText className="w-3 h-3" />
                            Insert Template
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Type a message (sent via email)..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && messageInput.trim()) {
                                e.preventDefault();
                                handleSendMessage(currentContact.id);
                              }
                            }}
                            className="min-h-[80px] resize-none"
                            rows={3}
                          />
                          <Button
                            size="icon"
                            onClick={() => handleSendMessage(currentContact.id)}
                            disabled={!messageInput.trim()}
                            className="h-auto"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a sponsor to start chatting</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default Communication;

