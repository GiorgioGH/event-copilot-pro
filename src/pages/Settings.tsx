import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { 
  Settings as SettingsIcon, 
  Building, 
  FileText, 
  CreditCard, 
  Key, 
  Users,
  Upload,
  Palette
} from 'lucide-react';

const Settings = () => {
  return (
    <>
      <Helmet>
        <title>Settings - SME Event Copilot</title>
        <meta name="description" content="Configure your SME Event Copilot settings." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </motion.div>

        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="w-4 h-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-accent" />
                    Company Branding
                  </CardTitle>
                  <CardDescription>Customize your event materials with company branding</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input placeholder="Acme Corporation" />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input placeholder="https://acme.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Primary Brand Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-10 p-1" defaultValue="#e85d04" />
                        <Input placeholder="#e85d04" className="flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-10 p-1" defaultValue="#1a1f36" />
                        <Input placeholder="#1a1f36" className="flex-1" />
                      </div>
                    </div>
                  </div>

                  <Button variant="accent">Save Branding</Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="templates">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent" />
                    Event Templates
                  </CardTitle>
                  <CardDescription>Save and reuse event configurations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {['Team Building', 'Annual Conference', 'Workshop'].map((template, index) => (
                      <div key={template} className="p-4 border border-border rounded-xl hover:border-accent/50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                          <FileText className="w-5 h-5 text-accent" />
                        </div>
                        <p className="font-medium text-foreground">{template}</p>
                        <p className="text-sm text-muted-foreground mt-1">Last used 2 weeks ago</p>
                      </div>
                    ))}
                    <div className="p-4 border-2 border-dashed border-border rounded-xl hover:border-accent/50 transition-colors cursor-pointer flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl text-muted-foreground">+</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Create Template</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="billing">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent" />
                    Payment & Billing
                  </CardTitle>
                  <CardDescription>Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">Professional Plan</p>
                        <p className="text-sm text-muted-foreground">$49/month • Renews Jan 15, 2025</p>
                      </div>
                      <Button variant="outline">Upgrade</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Payment Method</Label>
                    <div className="p-4 border border-border rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded" />
                        <span className="text-foreground">•••• •••• •••• 4242</span>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="api">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-accent" />
                    API Integrations
                  </CardTitle>
                  <CardDescription>Connect external services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Google Calendar', connected: true },
                    { name: 'Google Maps', connected: true },
                    { name: 'Slack', connected: false },
                    { name: 'Microsoft Teams', connected: false },
                  ].map((api) => (
                    <div key={api.name} className="flex items-center justify-between p-4 border border-border rounded-xl">
                      <div>
                        <p className="font-medium text-foreground">{api.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {api.connected ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                      <Button variant={api.connected ? 'outline' : 'default'} size="sm">
                        {api.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="team">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    Team Permissions
                  </CardTitle>
                  <CardDescription>Manage user roles and access levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Admin', description: 'Full access to all features', users: 2 },
                      { name: 'Event Manager', description: 'Can create and manage events', users: 5 },
                      { name: 'Viewer', description: 'Read-only access', users: 12 },
                    ].map((role) => (
                      <div key={role.name} className="flex items-center justify-between p-4 border border-border rounded-xl">
                        <div>
                          <p className="font-medium text-foreground">{role.name}</p>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{role.users} users</p>
                          <Button variant="link" size="sm" className="h-auto p-0">Manage</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default Settings;
