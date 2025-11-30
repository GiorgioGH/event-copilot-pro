import { Vendor } from '@/types/event';
import { usdToDkk } from '@/lib/utils/currency';

// Scraped vendor data structure (from vendors.json)
interface ScrapedVendor {
  vendor_type: 'venue' | 'catering' | 'transport' | 'activities' | 'av-equipment' | 'gifts' | 'miscellaneous';
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
  website?: string;
  phone?: string;
  email?: string;
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
 * Returns price in DKK
 */
function extractPrice(priceStr: string | null | undefined): number {
  if (!priceStr) return 0;
  
  // Remove currency symbols and text, extract numbers
  const match = priceStr.match(/(\d+(?:[.,]\d+)?)/);
  if (match) {
    const number = parseFloat(match[1].replace(',', '.'));
    
    // Check currency and convert to DKK
    // DKK: keep as is
    // USD to DKK: ~6.8 (1 USD ≈ 6.8 DKK)
    // EUR to DKK: ~7.3 (1 EUR ≈ 7.3 DKK)
    if (priceStr.toUpperCase().includes('DKK') || priceStr.toUpperCase().includes('KR')) {
      return Math.round(number); // Already in DKK
    } else if (priceStr.toUpperCase().includes('USD') || priceStr.toUpperCase().includes('$')) {
      return usdToDkk(number); // Convert USD to DKK
    } else if (priceStr.toUpperCase().includes('EUR') || priceStr.toUpperCase().includes('€')) {
      return Math.round(number * 7.3); // Convert EUR to DKK
    }
    
    // Assume DKK if no currency specified (most vendors are in Denmark)
    return Math.round(number);
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
 * Note: Geocoding is done lazily in the map component to avoid blocking vendor loading
 */
function transformVendor(scraped: ScrapedVendor, index: number): Vendor {
  // Extract price from various price fields (now in DKK)
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
  
  // Store capacity_min_max as string (e.g., "20-30")
  const capacityMinMax = scraped.capacity_min_max || undefined;
  
  // Get rating or default
  const rating = scraped.rating || 4.0;
  
  // Calculate fit score
  const fitScore = calculateFitScore(scraped);
  
  // Determine availability (default to true if not specified)
  const availability = true; // Assume available unless we have data saying otherwise
  
  // Note: lat, lng, and distanceFromCphCentral will be calculated lazily when needed
  // (e.g., in the map component) to avoid blocking vendor loading with geocoding requests
  
  return {
    id: `scraped-${index}`,
    name: scraped.name,
    type: scraped.vendor_type,
    image,
    priceEstimate: price, // Now in DKK
    location,
    rating,
    fitScore,
    capacity,
    capacityMinMax,
    description: scraped.description || undefined,
    amenities: scraped.amenities || [],
    availability,
    website: scraped.website,
    urlSource: scraped.url_source,
    addressFull: scraped.address_full || undefined,
    email: scraped.email || undefined,
    phone: scraped.phone || undefined,
    // lat, lng, distanceFromCphCentral will be set lazily when geocoding is done
  };
}

/**
 * Load vendors from the scraped JSON file
 */
export async function loadScrapedVendors(): Promise<Vendor[]> {
  try {
    // Fetch the vendors.json file from the public directory
    const response = await fetch('/vendors.json');
    
    if (!response.ok) {
      console.warn('Could not load vendors.json, using empty array');
      return [];
    }
    
    const scrapedVendors: ScrapedVendor[] = await response.json();
    
    // Filter out invalid vendors (must have name)
    const validVendors = scrapedVendors.filter(v => v.name && v.name.trim());
    
    // Transform to app format (synchronous now - geocoding is done lazily)
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
    gifts: vendors.filter(v => v.type === 'gifts'),
    miscellaneous: vendors.filter(v => v.type === 'miscellaneous'),
  };
}

