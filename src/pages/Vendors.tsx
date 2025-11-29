import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { 
  Store, 
  Star, 
  MapPin, 
  DollarSign, 
  Users, 
  Check, 
  ArrowLeftRight,
  Building,
  UtensilsCrossed,
  Bus,
  Speaker
} from 'lucide-react';
import { Vendor } from '@/types/event';

const allVendors: Vendor[] = [
  { id: '1', name: 'Grand Conference Center', type: 'venue', image: '', priceEstimate: 5000, location: '2.3 miles', rating: 4.8, fitScore: 95, capacity: 200, amenities: ['WiFi', 'Parking', 'Catering Kitchen', 'AV Equipment'], availability: true },
  { id: '2', name: 'Downtown Convention Hall', type: 'venue', image: '', priceEstimate: 7500, location: '1.2 miles', rating: 4.6, fitScore: 88, capacity: 350, amenities: ['WiFi', 'Parking', 'Stage'], availability: true },
  { id: '3', name: 'Innovation Hub', type: 'venue', image: '', priceEstimate: 3500, location: '4.5 miles', rating: 4.4, fitScore: 82, capacity: 100, amenities: ['WiFi', 'Coffee Bar'], availability: false },
  { id: '4', name: 'Elite Catering Co.', type: 'catering', image: '', priceEstimate: 2500, location: 'On-site', rating: 4.9, fitScore: 92, availability: true },
  { id: '5', name: 'Gourmet Events', type: 'catering', image: '', priceEstimate: 3200, location: 'On-site', rating: 4.7, fitScore: 89, availability: true },
  { id: '6', name: 'City Shuttle Services', type: 'transport', image: '', priceEstimate: 800, location: 'Citywide', rating: 4.5, fitScore: 85, availability: true },
  { id: '7', name: 'TechAV Solutions', type: 'av-equipment', image: '', priceEstimate: 1200, location: '5.1 miles', rating: 4.6, fitScore: 88, availability: true },
];

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  venue: Building,
  catering: UtensilsCrossed,
  transport: Bus,
  'av-equipment': Speaker,
};

const Vendors = () => {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  const toggleVendor = (id: string) => {
    setSelectedVendors(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const vendorsByType = {
    venue: allVendors.filter(v => v.type === 'venue'),
    catering: allVendors.filter(v => v.type === 'catering'),
    transport: allVendors.filter(v => v.type === 'transport'),
    'av-equipment': allVendors.filter(v => v.type === 'av-equipment'),
  };

  const selectedForComparison = allVendors.filter(v => selectedVendors.includes(v.id));

  return (
    <>
      <Helmet>
        <title>Vendors - SME Event Copilot</title>
        <meta name="description" content="Compare and select vendors for your corporate event." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Vendor Selection</h1>
            <p className="text-muted-foreground">Compare and select the best vendors for your event</p>
          </div>
          {selectedVendors.length >= 2 && (
            <Button variant="accent" onClick={() => setCompareMode(!compareMode)}>
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Compare ({selectedVendors.length})
            </Button>
          )}
        </motion.div>

        {/* Comparison Table */}
        {compareMode && selectedForComparison.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Vendor Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Attribute</th>
                        {selectedForComparison.map(vendor => (
                          <th key={vendor.id} className="text-left py-3 px-4 text-foreground font-medium">
                            {vendor.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 text-muted-foreground">Type</td>
                        {selectedForComparison.map(vendor => (
                          <td key={vendor.id} className="py-3 px-4 capitalize">{vendor.type.replace('-', ' ')}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 text-muted-foreground">Price</td>
                        {selectedForComparison.map(vendor => (
                          <td key={vendor.id} className="py-3 px-4 font-medium">${vendor.priceEstimate.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 text-muted-foreground">Rating</td>
                        {selectedForComparison.map(vendor => (
                          <td key={vendor.id} className="py-3 px-4">
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-warning fill-warning" />
                              {vendor.rating}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 text-muted-foreground">Distance</td>
                        {selectedForComparison.map(vendor => (
                          <td key={vendor.id} className="py-3 px-4">{vendor.location}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 px-4 text-muted-foreground">Fit Score</td>
                        {selectedForComparison.map(vendor => (
                          <td key={vendor.id} className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress value={vendor.fitScore} className="w-20 h-2" />
                              <span className="text-sm font-medium text-accent">{vendor.fitScore}%</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-muted-foreground">Availability</td>
                        {selectedForComparison.map(vendor => (
                          <td key={vendor.id} className="py-3 px-4">
                            <Badge variant={vendor.availability ? 'default' : 'secondary'}>
                              {vendor.availability ? 'Available' : 'Unavailable'}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Vendor Tabs */}
        <Tabs defaultValue="venue" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="venue" className="gap-2">
              <Building className="w-4 h-4" />
              Venues
            </TabsTrigger>
            <TabsTrigger value="catering" className="gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              Catering
            </TabsTrigger>
            <TabsTrigger value="transport" className="gap-2">
              <Bus className="w-4 h-4" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="av-equipment" className="gap-2">
              <Speaker className="w-4 h-4" />
              AV Equipment
            </TabsTrigger>
          </TabsList>

          {Object.entries(vendorsByType).map(([type, vendors]) => (
            <TabsContent key={type} value={type}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendors.map((vendor, index) => {
                  const Icon = typeIcons[vendor.type] || Store;
                  const isSelected = selectedVendors.includes(vendor.id);
                  
                  return (
                    <motion.div
                      key={vendor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`h-full transition-all hover:shadow-lg cursor-pointer ${isSelected ? 'ring-2 ring-accent' : ''} ${!vendor.availability ? 'opacity-60' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleVendor(vendor.id)}
                                disabled={!vendor.availability}
                              />
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                                <Icon className="w-6 h-6 text-muted-foreground" />
                              </div>
                            </div>
                            {!vendor.availability && (
                              <Badge variant="secondary">Unavailable</Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg font-semibold text-foreground mt-3">
                            {vendor.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Star className="w-4 h-4 text-warning fill-warning" />
                              {vendor.rating}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {vendor.location}
                            </span>
                            {vendor.capacity && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Users className="w-4 h-4" />
                                {vendor.capacity}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="text-lg font-semibold text-foreground">
                                ${vendor.priceEstimate.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Fit</span>
                              <Progress value={vendor.fitScore} className="w-16 h-2" />
                              <span className="text-sm font-medium text-accent">{vendor.fitScore}%</span>
                            </div>
                          </div>

                          {vendor.amenities && vendor.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {vendor.amenities.slice(0, 3).map(amenity => (
                                <Badge key={amenity} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {vendor.amenities.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{vendor.amenities.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          <Button 
                            className="w-full" 
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={() => toggleVendor(vendor.id)}
                            disabled={!vendor.availability}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-4 h-4" />
                                Selected
                              </>
                            ) : (
                              'Select Vendor'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </>
  );
};

export default Vendors;
