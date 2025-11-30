import { Vendor } from '@/types/event';

/**
 * Get booking URL for a vendor
 * Uses website or url_source, or constructs a Google search for "vendor name + book"
 */
export function getBookingUrl(vendor: Vendor, eventPlan?: any): string {
  // Prefer website, then url_source
  if (vendor.website) {
    return vendor.website;
  }
  
  if (vendor.urlSource) {
    return vendor.urlSource;
  }
  
  // Fallback: construct a Google search for "vendor name + book"
  const searchQuery = encodeURIComponent(`${vendor.name} book`);
  return `https://www.google.com/search?q=${searchQuery}`;
}

/**
 * Get booking URL for a vendor type (when no specific vendor is selected)
 */
export function getBookingUrlForType(vendorType: string): string {
  const typeNames: Record<string, string> = {
    'venue': 'event venues',
    'catering': 'catering services',
    'transport': 'transport services',
    'activities': 'team building activities',
    'av-equipment': 'AV equipment rental',
    'gifts': 'corporate gifts',
    'miscellaneous': 'event services',
  };
  
  const searchTerm = typeNames[vendorType] || 'event services';
  const searchQuery = encodeURIComponent(`${searchTerm} booking Copenhagen`);
  return `https://www.google.com/search?q=${searchQuery}`;
}

