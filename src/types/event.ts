export interface EventBasics {
  name: string;
  type: 'team-building' | 'seminar' | 'workshop' | 'offsite' | 'networking' | 'company-dinner';
  dateRange: { start: Date | null; end: Date | null };
  participants: number;
  budget: number;
  location: string;
}

export interface EventRequirements {
  includeLunch: boolean;
  accessibilityNeeded: boolean;
  timelineFlexibility: number; // 0-100
  preferredTimeframe: 'morning' | 'afternoon' | 'full-day';
  venuePreference: 'indoor' | 'outdoor' | 'either';
}

export interface EventSpecialConditions {
  speakerNames: string[];
  dietaryRestrictions: string[];
  equipment: string[];
  preferredVendors: string[];
}

export interface EventPlan {
  id: string;
  basics: EventBasics;
  requirements: EventRequirements;
  specialConditions: EventSpecialConditions;
  riskScore: 'low' | 'medium' | 'high';
  estimatedCost: number;
  status: 'draft' | 'planning' | 'confirmed' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  owner: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  duration: number; // minutes
  room?: string;
  type: 'session' | 'break' | 'lunch' | 'networking';
  speaker?: string;
  hasConflict?: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  type: 'venue' | 'catering' | 'transport' | 'activities' | 'av-equipment' | 'gifts' | 'miscellaneous';
  image: string;
  priceEstimate: number; // In DKK
  location: string;
  rating: number;
  fitScore: number;
  capacity?: number;
  amenities?: string[];
  availability: boolean;
  website?: string;
  urlSource?: string;
  addressFull?: string;
  lat?: number;
  lng?: number;
  distanceFromCphCentral?: number; // In km
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  recommended: number;
  spent: number;
  icon: string;
}

export interface RiskItem {
  id: string;
  type: 'task-delay' | 'budget' | 'vendor' | 'weather' | 'schedule' | 'external';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation?: string;
}

export interface CopilotEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time?: string;
  description?: string;
  location?: string;
  budgetTotal?: number;
  budgetUsed?: number;
  attendees?: string[];
  status: 'future' | 'past';
}