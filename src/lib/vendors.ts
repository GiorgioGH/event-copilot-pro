import { Vendor } from '@/types/event';

// Scraped vendor data structure (from vendors.json)
interface ScrapedVendor {
  vendor_type: 'venue' | 'catering' | 'transport' | 'activities' | 'av-equipment';
  name: string;
  address_full: string | null;
  description?: string | null;
  base_package_price?: string | null;
  price_per_person?: string | null;
  price_per_hour?: string | null;
  price_per_day?: string | null;
  rating?: number | null;
  review_count?: number | null;
  capacity_min_max?: string | null;
  amenities?: string[];
  images?: string[];
  url_source: string;
  // Venue specific
  in_house_av?: boolean | null;
  parking_available?: boolean | null;
  wifi_available?: boolean | null;
  accessibility?: boolean | string | null;
  // Catering specific
  cuisine_types?: string[];
  service_types?: string[];
  // Transport specific
  vehicle_types?: string[];
  // Activities specific
  activity_types?: string[];
  // AV Equipment specific
  equipment_types?: string[];
}

/**
 * Extract numeric price from price string
 * Handles DKK, EUR, USD and converts to USD (or keeps DKK if preferred)
 */
function extractPrice(priceStr: string | null | undefined): number {
  if (!priceStr) return 0;
  
  // Remove currency symbols and text, extract numbers
  const match = priceStr.match(/(\d+(?:[.,]\d+)?)/);
  if (match) {
    const number = parseFloat(match[1].replace(',', '.'));
    
    // Check currency and convert DKK/EUR to approximate USD
    // DKK to USD: ~0.14 (1 DKK ≈ 0.14 USD)
    // EUR to USD: ~1.08 (1 EUR ≈ 1.08 USD)
    if (priceStr.toUpperCase().includes('DKK') || priceStr.toUpperCase().includes('KR')) {
      return Math.round(number * 0.14); // Convert DKK to USD
    } else if (priceStr.toUpperCase().includes('EUR') || priceStr.toUpperCase().includes('€')) {
      return Math.round(number * 1.08); // Convert EUR to USD
    }
    
    return Math.round(number); // Assume USD if no currency specified
  }
  return 0;
}

/**
 * Extract capacity number from capacity string
 */
function extractCapacity(capacityStr: string | null | undefined): number | undefined {
  if (!capacityStr) return undefined;
  
  // Extract first number from strings like "100 - 300" or "200"
  const match = capacityStr.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return undefined;
}

/**
 * Calculate fit score based on vendor data
 */
function calculateFitScore(vendor: ScrapedVendor): number {
  let score = 50; // Base score
  
  // Boost score if has rating
  if (vendor.rating) {
    score += (vendor.rating - 3) * 10; // 4.5 rating = +15 points
  }
  
  // Boost score if has amenities
  if (vendor.amenities && vendor.amenities.length > 0) {
    score += Math.min(vendor.amenities.length * 5, 20);
  }
  
  // Boost score if has images
  if (vendor.images && vendor.images.length > 0) {
    score += 10;
  }
  
  // Boost score if has description
  if (vendor.description) {
    score += 5;
  }
  
  // Cap at 100
  return Math.min(Math.round(score), 100);
}

/**
 * Transform scraped vendor data to app Vendor format
 */
function transformVendor(scraped: ScrapedVendor, index: number): Vendor {
  // Extract price from various price fields
  const price = 
    extractPrice(scraped.base_package_price) ||
    extractPrice(scraped.price_per_person) ||
    extractPrice(scraped.price_per_hour) ||
    extractPrice(scraped.price_per_day) ||
    0;
  
  // Get first image or empty string
  const image = (scraped.images && scraped.images.length > 0) 
    ? scraped.images[0] 
    : '';
  
  // Get location from address or default
  const location = scraped.address_full || 'Copenhagen, Denmark';
  
  // Extract capacity
  const capacity = extractCapacity(scraped.capacity_min_max);
  
  // Get rating or default
  const rating = scraped.rating || 4.0;
  
  // Calculate fit score
  const fitScore = calculateFitScore(scraped);
  
  // Determine availability (default to true if not specified)
  const availability = true; // Assume available unless we have data saying otherwise
  
  return {
    id: `scraped-${index}`,
    name: scraped.name,
    type: scraped.vendor_type,
    image,
    priceEstimate: price,
    location,
    rating,
    fitScore,
    capacity,
    amenities: scraped.amenities || [],
    availability,
  };
}

/**
 * Load vendors from the scraped JSON file
 */
export async function loadScrapedVendors(): Promise<Vendor[]> {
  try {
    // Fetch the vendors.json file from the public directory
    // We'll need to copy it there or serve it via API
    const response = await fetch('/vendors.json');
    
    if (!response.ok) {
      console.warn('Could not load vendors.json, using empty array');
      return [];
    }
    
    const scrapedVendors: ScrapedVendor[] = await response.json();
    
    // Filter out invalid vendors (must have name)
    const validVendors = scrapedVendors.filter(v => v.name && v.name.trim());
    
    // Transform to app format
    return validVendors.map((vendor, index) => transformVendor(vendor, index));
  } catch (error) {
    console.error('Error loading scraped vendors:', error);
    return [];
  }
}

/**
 * Get vendors by type
 */
export function getVendorsByType(vendors: Vendor[]) {
  return {
    venue: vendors.filter(v => v.type === 'venue'),
    catering: vendors.filter(v => v.type === 'catering'),
    transport: vendors.filter(v => v.type === 'transport'),
    activities: vendors.filter(v => v.type === 'activities'),
    'av-equipment': vendors.filter(v => v.type === 'av-equipment'),
  };
}

