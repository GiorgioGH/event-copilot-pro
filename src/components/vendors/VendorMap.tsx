import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vendor } from '@/types/event';
import { MapPin, DollarSign, Users, Star, Check } from 'lucide-react';
import { formatDkk } from '@/lib/utils/currency';
import { formatDistance, calculateDistance, CPH_CENTRAL_STATION } from '@/lib/utils/distance';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VendorMapProps {
  vendors: Vendor[];
  selectedVendors: string[];
  onToggleVendor: (vendorId: string) => void;
}

interface VendorLocation {
  vendor: Vendor;
  lat: number;
  lng: number;
}

// Simple geocoding using OpenStreetMap Nominatim (free, no API key)
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'EventPaul/1.0', // Required by Nominatim
        },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    // Silently fail - geocoding is optional, don't log every failure
    // Only log if it's not a timeout/network error
    if (error instanceof Error && error.name !== 'AbortError' && !error.message.includes('fetch')) {
      // Only log unexpected errors, not network timeouts
    }
  }
  return null; // Return null instead of default coordinates
}

const VendorMap: React.FC<VendorMapProps> = ({ vendors, selectedVendors, onToggleVendor }) => {
  const [vendorLocations, setVendorLocations] = useState<VendorLocation[]>([]);
  const [loading, setLoading] = useState(false); // Start as false - don't block map display

  useEffect(() => {
    // Show map immediately, geocode in background
    setLoading(false);
    
    const geocodeVendors = async () => {
      const locations: VendorLocation[] = [];
      let consecutiveFailures = 0;
      const maxConsecutiveFailures = 2; // Stop if 2 failures in a row

      // Geocode vendors in background
      for (let i = 0; i < vendors.length; i++) {
        const vendor = vendors[i];
        
        // Stop if too many consecutive failures (likely API rate limit or network issue)
        if (consecutiveFailures >= maxConsecutiveFailures) {
          // Silently stop - geocoding is optional
          break;
        }
        
        try {
          // Use addressFull if available, otherwise use location
          const address = vendor.addressFull || vendor.location;
          const coords = await geocodeAddress(address);
          if (coords) {
            // Calculate distance from CPH Central Station
            const distance = calculateDistance(
              coords.lat,
              coords.lng,
              CPH_CENTRAL_STATION.lat,
              CPH_CENTRAL_STATION.lng
            );
            
            // Update vendor with coordinates and distance
            vendor.lat = coords.lat;
            vendor.lng = coords.lng;
            vendor.distanceFromCphCentral = distance;
            
            locations.push({
              vendor,
              lat: coords.lat,
              lng: coords.lng,
            });
            consecutiveFailures = 0; // Reset on success
            
            // Update state incrementally so map shows markers as they load
            setVendorLocations([...locations]);
          } else {
            consecutiveFailures++;
          }
        } catch (error) {
          consecutiveFailures++;
          // Silently continue - geocoding failures are not critical
        }
        
        // Small delay to respect rate limits (only if not the last vendor)
        if (i < vendors.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
        }
      }
    };

    if (vendors.length > 0) {
      // Start geocoding in background without blocking
      geocodeVendors().catch(err => {
        console.warn('Background geocoding failed:', err);
      });
    }
  }, [vendors]);

  // Always show the map, even if geocoding is in progress or failed

  // Calculate center of all markers, or default to Copenhagen
  const centerLat = vendorLocations.length > 0
    ? vendorLocations.reduce((sum, loc) => sum + loc.lat, 0) / vendorLocations.length
    : 55.6761;
  const centerLng = vendorLocations.length > 0
    ? vendorLocations.reduce((sum, loc) => sum + loc.lng, 0) / vendorLocations.length
    : 12.5683;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          Vendor Locations
          {vendorLocations.length < vendors.length && vendors.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {vendorLocations.length > 0 
                ? `${vendorLocations.length} of ${vendors.length} locations`
                : 'Loading locations...'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full rounded-lg overflow-hidden border border-border relative">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={vendorLocations.length > 0 ? 12 : 11}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {vendorLocations.length > 0 && vendorLocations.map(({ vendor, lat, lng }) => {
              const isSelected = selectedVendors.includes(vendor.id);
              return (
                <Marker
                  key={vendor.id}
                  position={[lat, lng]}
                  icon={L.icon({
                    iconUrl: isSelected
                      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
                      : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                  })}
                >
                  <Popup>
                    <div className="p-2 min-w-[250px]">
                      <h3 className="font-semibold text-lg mb-2">{vendor.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{vendor.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{formatDkk(vendor.priceEstimate)}</span>
                        </div>
                        {vendor.distanceFromCphCentral && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {formatDistance(vendor.distanceFromCphCentral)} from CPH Central
                            </span>
                          </div>
                        )}
                        {vendor.capacityMinMax && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground whitespace-nowrap">Capacity: {vendor.capacityMinMax}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="text-muted-foreground">{vendor.rating} rating</span>
                        </div>
                        <Badge variant="outline" className="capitalize mt-1">
                          {vendor.type.replace('-', ' ')}
                        </Badge>
                        {vendor.amenities && vendor.amenities.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Amenities:</p>
                            <div className="flex flex-wrap gap-1">
                              {vendor.amenities.slice(0, 3).map(amenity => (
                                <Badge key={amenity} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {vendor.amenities.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{vendor.amenities.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        <Button
                          className="w-full mt-3"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onToggleVendor(vendor.id)}
                          disabled={!vendor.availability}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Selected
                            </>
                          ) : (
                            'Select Vendor'
                          )}
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          {vendorLocations.length === 0 && vendors.length > 0 && (
            <div className="absolute top-2 right-2 z-[1000]">
              <div className="text-center p-2 bg-card rounded-lg border border-border shadow-lg">
                <p className="text-xs font-medium text-foreground">Loading locations...</p>
              </div>
            </div>
          )}
        </div>
        {vendorLocations.length > 0 && vendorLocations.length < vendors.length && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Note: {vendors.length - vendorLocations.length} vendor location(s) could not be loaded. Showing available locations.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorMap;

