import { EventPlan, Vendor } from '@/types/event';
import { CopilotEvent } from '@/types/event';
import { loadEventsFromLocalStorage } from './events';

export interface RiskItem {
  id: string;
  type: 'lunch' | 'accessibility' | 'timeframe' | 'venue' | 'weather' | 'budget' | 'schedule' | 'tasks' | 'external';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation?: string;
}

interface WeatherData {
  condition: string;
  temperature: number;
  precipitation: number; // 0-100
  needsIndoor: boolean;
}

// Mock weather API - in production, use a real weather API
export async function getWeatherForDate(date: Date, location: string): Promise<WeatherData> {
  // Mock weather data - in production, call a real API like OpenWeatherMap
  const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // For dates far in the future, return neutral weather
  if (daysUntil > 7) {
    return {
      condition: 'Unknown',
      temperature: 15,
      precipitation: 20,
      needsIndoor: false,
    };
  }
  
  // Mock: 30% chance of rain, 20% chance of cold
  const mockPrecipitation = Math.random() * 100;
  const mockTemp = 10 + Math.random() * 15; // 10-25°C
  
  return {
    condition: mockPrecipitation > 50 ? 'Rainy' : mockTemp < 12 ? 'Cold' : 'Clear',
    temperature: Math.round(mockTemp),
    precipitation: Math.round(mockPrecipitation),
    needsIndoor: mockPrecipitation > 50 || mockTemp < 12,
  };
}

export function analyzeRisks(
  plan: EventPlan | null,
  selectedVendors: string[],
  allVendors: Vendor[],
  tasks: any[],
  weather: WeatherData | null
): RiskItem[] {
  const risks: RiskItem[] = [];
  
  if (!plan) return risks;
  
  // 1. Lunch Requirement Risk
  if (plan.requirements.includeLunch) {
    const hasCatering = selectedVendors.some(vendorId => {
      const vendor = allVendors.find(v => v.id === vendorId);
      return vendor?.type === 'catering';
    });
    
    if (!hasCatering) {
      risks.push({
        id: 'lunch',
        type: 'lunch',
        title: 'Lunch Requirement',
        description: 'Lunch is required but no catering service has been selected',
        severity: 'high',
        mitigation: 'Select a catering vendor from the Vendors page to fulfill the lunch requirement',
      });
    } else {
      risks.push({
        id: 'lunch',
        type: 'lunch',
        title: 'Lunch Requirement',
        description: 'Catering service has been selected',
        severity: 'low',
        mitigation: undefined,
      });
    }
  }
  
  // 2. Accessibility Risk
  if (plan.requirements.accessibilityNeeded) {
    const venue = selectedVendors.find(vendorId => {
      const vendor = allVendors.find(v => v.id === vendorId);
      return vendor?.type === 'venue';
    });
    
    if (!venue) {
      risks.push({
        id: 'accessibility',
        type: 'accessibility',
        title: 'Accessibility Requirement',
        description: 'Accessibility is required but no venue has been selected',
        severity: 'high',
        mitigation: 'Select an accessible venue from the Vendors page',
      });
    } else {
      // Check if venue has accessibility (we'd need to check vendor data)
      // For now, assume selected venue is accessible
      risks.push({
        id: 'accessibility',
        type: 'accessibility',
        title: 'Accessibility Requirement',
        description: 'Venue selected - please verify accessibility features',
        severity: 'medium',
        mitigation: 'Contact venue to confirm accessibility features meet requirements',
      });
    }
  } else {
    risks.push({
      id: 'accessibility',
      type: 'accessibility',
      title: 'Accessibility',
      description: 'Accessibility not required for this event',
      severity: 'low',
      mitigation: undefined,
    });
  }
  
  // 3. Timeframe Risk
  const selectedVendorList = allVendors.filter(v => selectedVendors.includes(v.id));
  const hasVendors = selectedVendorList.length > 0;
  
  risks.push({
    id: 'timeframe',
    type: 'timeframe',
    title: 'Vendor Availability',
    description: hasVendors 
      ? `Vendors are available for ${plan.requirements.preferredTimeframe} timeframe`
      : 'No vendors selected yet',
    severity: hasVendors ? 'low' : 'medium',
    mitigation: hasVendors ? undefined : 'Select vendors and confirm availability for the event timeframe',
  });
  
  // 4. Venue Preference Risk
  const venuePreference = plan.requirements.venuePreference;
  const selectedVenue = selectedVendorList.find(v => v.type === 'venue');
  
  if (venuePreference !== 'either' && selectedVenue) {
    // Check if venue matches preference (we'd need venue data to know indoor/outdoor)
    // For now, assume it matches if selected
    const distanceInfo = selectedVenue.distanceFromCphCentral 
      ? ` Distance from CPH Central Station: ${selectedVenue.distanceFromCphCentral} km.`
      : '';
    risks.push({
      id: 'venue',
      type: 'venue',
      title: 'Venue Preference',
      description: `Selected venue should be ${venuePreference} - please verify.${distanceInfo}`,
      severity: 'medium',
      mitigation: `Confirm the selected venue is ${venuePreference} as required`,
    });
  } else if (!selectedVenue) {
    risks.push({
      id: 'venue',
      type: 'venue',
      title: 'Venue Preference',
      description: `No ${venuePreference} venue selected`,
      severity: venuePreference === 'either' ? 'low' : 'medium',
      mitigation: venuePreference === 'either' ? undefined : `Select a ${venuePreference} venue`,
    });
  } else {
    const distanceInfo = selectedVenue.distanceFromCphCentral 
      ? ` Distance from CPH Central Station: ${selectedVenue.distanceFromCphCentral} km.`
      : '';
    risks.push({
      id: 'venue',
      type: 'venue',
      title: 'Venue Location',
      description: `Venue preference is flexible.${distanceInfo}`,
      severity: 'low',
      mitigation: undefined,
    });
  }
  
  // 5. Weather Risk
  if (weather) {
    if (weather.needsIndoor) {
      risks.push({
        id: 'weather',
        type: 'weather',
        title: 'Weather Risk',
        description: `${weather.condition} weather expected (${weather.temperature}°C, ${weather.precipitation}% precipitation) - indoor venue recommended`,
        severity: 'high',
        mitigation: 'Ensure venue has indoor backup or select an indoor venue',
      });
    } else {
      risks.push({
        id: 'weather',
        type: 'weather',
        title: 'Weather Forecast',
        description: `${weather.condition} weather expected (${weather.temperature}°C, ${weather.precipitation}% precipitation)`,
        severity: 'low',
        mitigation: undefined,
      });
    }
  }
  
  // 6. Budget Risk
  const budget = plan.basics.budget || 0;
  const estimatedCost = plan.estimatedCost || 0;
  const budgetWithSafety = estimatedCost * 1.1; // 10% safety margin
  
  // Format DKK
  const formatDkk = (amount: number) => `${Math.round(amount).toLocaleString('da-DK')} DKK`;
  
  if (budgetWithSafety > budget) {
    risks.push({
      id: 'budget',
      type: 'budget',
      title: 'Budget Risk',
      description: `Current budget (with 10% safety margin) is ${formatDkk(budgetWithSafety)}, exceeding available budget of ${formatDkk(budget)}`,
      severity: 'high',
      mitigation: 'Review vendor selections and reduce costs, or increase budget allocation',
    });
  } else {
    const usagePercent = budget > 0 ? Math.round((budgetWithSafety / budget) * 100) : 0;
    risks.push({
      id: 'budget',
      type: 'budget',
      title: 'Budget Status',
      description: `Budget is within limits (${usagePercent}% used with safety margin)`,
      severity: usagePercent > 85 ? 'medium' : 'low',
      mitigation: usagePercent > 85 ? 'Monitor spending closely' : undefined,
    });
  }
  
  // 7. Schedule Conflicts - will be checked asynchronously in component
  // For now, add placeholder that will be updated
  risks.push({
    id: 'schedule',
    type: 'schedule',
    title: 'Schedule Conflicts',
    description: 'Checking for conflicts...',
    severity: 'low',
    mitigation: undefined,
  });
  
  // 8. Task Delays
  const remainingTasks = tasks.filter(t => t.status !== 'completed').length;
  const totalTasks = tasks.length;
  
  if (remainingTasks > 3) {
    risks.push({
      id: 'tasks',
      type: 'tasks',
      title: 'Task Delays',
      description: `${remainingTasks} of ${totalTasks} tasks remaining - high risk of delays`,
      severity: 'high',
      mitigation: 'Prioritize remaining tasks and assign additional resources if needed',
    });
  } else if (remainingTasks > 0) {
    risks.push({
      id: 'tasks',
      type: 'tasks',
      title: 'Task Progress',
      description: `${remainingTasks} of ${totalTasks} tasks remaining`,
      severity: 'medium',
      mitigation: 'Continue working through remaining tasks',
    });
  } else {
    risks.push({
      id: 'tasks',
      type: 'tasks',
      title: 'Task Progress',
      description: 'All tasks completed',
      severity: 'low',
      mitigation: undefined,
    });
  }
  
  // 9. External Events (keep as placeholder)
  risks.push({
    id: 'external',
    type: 'external',
    title: 'External Events',
    description: 'No major external events detected that would impact your event',
    severity: 'low',
    mitigation: undefined,
  });
  
  return risks;
}

