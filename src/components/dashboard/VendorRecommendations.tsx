import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Store, Star, MapPin, DollarSign, ArrowRight, Check } from 'lucide-react';
import { Vendor } from '@/types/event';

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Grand Conference Center',
    type: 'venue',
    image: '',
    priceEstimate: 5000,
    location: '2.3 miles away',
    rating: 4.8,
    fitScore: 95,
    capacity: 200,
    amenities: ['WiFi', 'Parking', 'Catering Kitchen'],
    availability: true,
  },
  {
    id: '2',
    name: 'Elite Catering Co.',
    type: 'catering',
    image: '',
    priceEstimate: 2500,
    location: 'On-site available',
    rating: 4.9,
    fitScore: 92,
    availability: true,
  },
  {
    id: '3',
    name: 'TechAV Solutions',
    type: 'av-equipment',
    image: '',
    priceEstimate: 1200,
    location: '5.1 miles away',
    rating: 4.6,
    fitScore: 88,
    availability: true,
  },
  {
    id: '4',
    name: 'City Shuttle Services',
    type: 'transport',
    image: '',
    priceEstimate: 800,
    location: 'Citywide',
    rating: 4.5,
    fitScore: 85,
    availability: true,
  },
];

const typeLabels = {
  venue: 'Venue',
  catering: 'Catering',
  transport: 'Transport',
  activities: 'Activities',
  'av-equipment': 'AV Equipment',
};

const VendorRecommendations = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Store className="w-5 h-5 text-accent" />
              Vendor Recommendations
            </CardTitle>
            <Button variant="outline" size="sm">
              Compare
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                className="p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-all hover:shadow-md cursor-pointer group"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start gap-4">
                  {/* Vendor image placeholder */}
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-secondary to-muted flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-foreground truncate">{vendor.name}</span>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {typeLabels[vendor.type]}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-warning fill-warning" />
                        {vendor.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {vendor.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${vendor.priceEstimate.toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Fit score */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Fit Score</span>
                      <Progress value={vendor.fitScore} className="h-1.5 flex-1" />
                      <span className="text-xs font-medium text-accent">{vendor.fitScore}%</span>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VendorRecommendations;
