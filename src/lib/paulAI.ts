import { RiskItem } from './riskAnalysis';

export interface PaulSuggestion {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
}

/**
 * Paul AI Assistant - Analyzes all risks and provides comprehensive suggestions
 */
export function getPaulSuggestions(risks: RiskItem[]): PaulSuggestion[] {
  const suggestions: PaulSuggestion[] = [];
  
  // Group risks by severity
  const highRisks = risks.filter(r => r.severity === 'high');
  const mediumRisks = risks.filter(r => r.severity === 'medium');
  
  // High Priority Suggestions
  if (highRisks.length > 0) {
    const highRiskTitles = highRisks.map(r => r.title).join(', ');
    const actionItems: string[] = [];
    
    highRisks.forEach(risk => {
      if (risk.mitigation) {
        actionItems.push(risk.mitigation);
      }
      
      // Specific actions based on risk type
      switch (risk.type) {
        case 'lunch':
          actionItems.push('Go to Vendors page and select a catering service');
          break;
        case 'accessibility':
          actionItems.push('Verify venue accessibility features or select an accessible venue');
          break;
        case 'budget':
          actionItems.push('Review budget allocations on Budget Planner page');
          actionItems.push('Consider selecting lower-cost vendor alternatives');
          break;
        case 'weather':
          actionItems.push('Confirm indoor backup venue is available');
          actionItems.push('Contact venue to discuss weather contingency plan');
          break;
        case 'schedule':
          actionItems.push('Review other events scheduled on the same date');
          actionItems.push('Consider rescheduling if conflicts are significant');
          break;
        case 'tasks':
          actionItems.push('Prioritize remaining tasks on Dashboard');
          actionItems.push('Assign additional team members to complete tasks');
          break;
      }
    });
    
    suggestions.push({
      priority: 'high',
      title: 'Critical Issues Requiring Immediate Attention',
      description: `You have ${highRisks.length} high-priority risk(s): ${highRiskTitles}. These need to be addressed before your event.`,
      actionItems: [...new Set(actionItems)], // Remove duplicates
    });
  }
  
  // Medium Priority Suggestions
  if (mediumRisks.length > 0 && highRisks.length === 0) {
    const mediumRiskTitles = mediumRisks.map(r => r.title).join(', ');
    const actionItems: string[] = [];
    
    mediumRisks.forEach(risk => {
      if (risk.mitigation) {
        actionItems.push(risk.mitigation);
      }
    });
    
    suggestions.push({
      priority: 'medium',
      title: 'Moderate Risks to Monitor',
      description: `You have ${mediumRisks.length} moderate risk(s): ${mediumRiskTitles}. Keep an eye on these and address them soon.`,
      actionItems: [...new Set(actionItems)],
    });
  }
  
  // Overall Health Check
  if (highRisks.length === 0 && mediumRisks.length === 0) {
    suggestions.push({
      priority: 'low',
      title: 'Event Health Status: Excellent',
      description: 'All risk indicators are green! Your event is well-prepared. Continue monitoring as the event date approaches.',
      actionItems: [
        'Continue regular check-ins with vendors',
        'Keep tasks updated and on schedule',
        'Monitor weather forecasts as event date approaches',
      ],
    });
  } else if (highRisks.length === 0) {
    suggestions.push({
      priority: 'low',
      title: 'Event Health Status: Good',
      description: 'No critical risks detected. Address the moderate risks to ensure smooth event execution.',
      actionItems: [
        'Review and address moderate risks',
        'Continue monitoring event progress',
      ],
    });
  }
  
  // Budget Optimization Suggestion
  const budgetRisk = risks.find(r => r.type === 'budget');
  if (budgetRisk && budgetRisk.severity === 'high') {
    suggestions.push({
      priority: 'high',
      title: 'Budget Optimization Needed',
      description: 'Your budget is at risk. Consider these cost-saving strategies.',
      actionItems: [
        'Review vendor selections and compare prices',
        'Consider reducing non-essential services',
        'Negotiate better rates with selected vendors',
        'Use AI Optimize feature on Budget Planner to find best deals',
      ],
    });
  }
  
  // Task Management Suggestion
  const taskRisk = risks.find(r => r.type === 'tasks');
  if (taskRisk && taskRisk.severity === 'high') {
    suggestions.push({
      priority: 'high',
      title: 'Task Management Action Required',
      description: 'Multiple tasks are still pending. Take action to stay on schedule.',
      actionItems: [
        'Review Tasks & Timeline on Dashboard',
        'Assign team members to pending tasks',
        'Set deadlines for critical tasks',
        'Consider delegating tasks to ensure completion',
      ],
    });
  }
  
  // Vendor Selection Suggestion
  const lunchRisk = risks.find(r => r.type === 'lunch');
  const venueRisk = risks.find(r => r.type === 'venue' || r.type === 'accessibility');
  if ((lunchRisk && lunchRisk.severity === 'high') || (venueRisk && venueRisk.severity === 'high')) {
    suggestions.push({
      priority: 'high',
      title: 'Complete Vendor Selection',
      description: 'Essential vendors are missing. Complete your vendor selections to meet event requirements.',
      actionItems: [
        'Visit Vendors page to select required services',
        'Compare vendor options and prices',
        'Confirm vendor availability for your event date',
        'Book vendors as soon as possible to secure dates',
      ],
    });
  }
  
  return suggestions;
}

