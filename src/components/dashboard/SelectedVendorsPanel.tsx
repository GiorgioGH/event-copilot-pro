import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, X } from 'lucide-react';
import { useEvent } from '@/contexts/EventContext';
import { loadScrapedVendors } from '@/lib/vendors';
import { Vendor } from '@/types/event';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatDkk } from '@/lib/utils/currency';

const SelectedVendorsPanel = () => {
  const { selectedVendors, setSelectedVendors } = useEvent();
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadScrapedVendors().then(setAllVendors);
  }, []);

  const selectedVendorData = allVendors.filter(v => selectedVendors.includes(v.id));

  const removeVendor = (vendorId: string) => {
    const vendor = allVendors.find(v => v.id === vendorId);
    setSelectedVendors(prev => prev.filter(id => id !== vendorId));
    toast({
      title: "Vendor Removed",
      description: `${vendor?.name} removed from your event.`,
    });
  };

  if (selectedVendorData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Store className="w-5 h-5 text-accent" />
            Selected Vendors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No vendors selected yet. Select vendors from the recommendations or vendors page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Store className="w-5 h-5 text-accent" />
          Selected Vendors
          <Badge variant="secondary">{selectedVendorData.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {selectedVendorData.map((vendor, index) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-muted flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{vendor.type.replace('-', ' ')}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {formatDkk(vendor.priceEstimate)}
                </Badge>
              </div>
              <button
                onClick={() => removeVendor(vendor.id)}
                className="ml-2 p-1 hover:bg-destructive/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectedVendorsPanel;

