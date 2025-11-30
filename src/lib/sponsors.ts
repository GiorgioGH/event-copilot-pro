export interface ChatMessage {
  id: string;
  sender: 'me' | 'vendor' | 'sponsor' | 'system';
  message: string;
  timestamp: Date;
  attachments?: string[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'vendor' | 'sponsor';
  vendorType?: string;
  messages: ChatMessage[];
}

interface SponsorSuggestion {
  name: string;
  email: string;
  phone: string;
  description: string;
}

const sponsorDatabase: Record<string, SponsorSuggestion[]> = {
  'team-building': [
    {
      name: 'Adventure Sports Co.',
      email: 'contact@adventuresports.com',
      phone: '+45 20 11 22 33',
      description: 'Specializes in outdoor team building activities and equipment',
    },
    {
      name: 'Corporate Wellness Partners',
      email: 'info@corporatewellness.dk',
      phone: '+45 30 44 55 66',
      description: 'Wellness and health-focused team building sponsors',
    },
    {
      name: 'Tech Innovation Hub',
      email: 'events@techhub.dk',
      phone: '+45 40 55 66 77',
      description: 'Technology companies interested in team building events',
    },
  ],
  'seminar': [
    {
      name: 'Business Solutions Inc.',
      email: 'sponsorships@bizsolutions.com',
      phone: '+45 21 32 43 54',
      description: 'B2B software and services company',
    },
    {
      name: 'Professional Development Network',
      email: 'contact@pdn.dk',
      phone: '+45 31 42 53 64',
      description: 'Education and training organizations',
    },
    {
      name: 'Industry Leaders Group',
      email: 'events@industryleaders.dk',
      phone: '+45 41 52 63 74',
      description: 'Major industry players in your sector',
    },
  ],
  'workshop': [
    {
      name: 'Creative Tools Ltd.',
      email: 'workshops@creativetools.com',
      phone: '+45 22 33 44 55',
      description: 'Supplies materials and tools for creative workshops',
    },
    {
      name: 'Skill Development Academy',
      email: 'info@skillacademy.dk',
      phone: '+45 32 43 54 65',
      description: 'Educational institutions and training centers',
    },
    {
      name: 'Innovation Labs',
      email: 'contact@innovationlabs.dk',
      phone: '+45 42 53 64 75',
      description: 'Tech companies supporting skill development',
    },
  ],
  'offsite': [
    {
      name: 'Travel & Hospitality Partners',
      email: 'corporate@travelpartners.dk',
      phone: '+45 23 34 45 56',
      description: 'Hotels and travel companies for offsite events',
    },
    {
      name: 'Outdoor Experience Co.',
      email: 'events@outdoorexperience.com',
      phone: '+45 33 44 55 66',
      description: 'Outdoor venues and activity providers',
    },
    {
      name: 'Luxury Retreats',
      email: 'corporate@luxuryretreats.dk',
      phone: '+45 43 54 65 76',
      description: 'Premium venues and retreat centers',
    },
  ],
  'networking': [
    {
      name: 'Business Network Hub',
      email: 'sponsors@networkhub.dk',
      phone: '+45 24 35 46 57',
      description: 'Professional networking organizations',
    },
    {
      name: 'Startup Community',
      email: 'events@startupcommunity.dk',
      phone: '+45 34 45 56 67',
      description: 'Startup ecosystem and investors',
    },
    {
      name: 'Industry Association',
      email: 'contact@industryassoc.dk',
      phone: '+45 44 55 66 77',
      description: 'Relevant industry associations',
    },
  ],
  'company-dinner': [
    {
      name: 'Fine Dining Group',
      email: 'corporate@finedining.dk',
      phone: '+45 25 36 47 58',
      description: 'Premium restaurants and catering services',
    },
    {
      name: 'Wine & Beverage Partners',
      email: 'events@winepartners.dk',
      phone: '+45 35 46 57 68',
      description: 'Wine distributors and beverage companies',
    },
    {
      name: 'Entertainment Services',
      email: 'contact@entertainment.dk',
      phone: '+45 45 56 67 78',
      description: 'Entertainment and event production companies',
    },
  ],
};

export function getSponsorSuggestions(eventType: string): Contact[] {
  const suggestions = sponsorDatabase[eventType] || sponsorDatabase['seminar'];
  
  return suggestions.map((sponsor, index) => ({
    id: `sponsor-${eventType}-${index}`,
    name: sponsor.name,
    email: sponsor.email,
    phone: sponsor.phone,
    type: 'sponsor' as const,
    messages: [
      {
        id: 'system-1',
        sender: 'system',
        message: 'This chat is connected via email. All messages you send here will be automatically sent as emails to the sponsor.',
        timestamp: new Date(),
      },
    ],
  }));
}

