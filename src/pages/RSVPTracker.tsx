import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useEvent } from '@/contexts/EventContext';
import ConfigAssistant from '@/components/chat/ConfigAssistant';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Download, 
  Send, 
  Search,
  Filter,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export interface Guest {
  id: string;
  name: string;
  email: string;
  status: 'confirmed' | 'declined' | 'pending';
  dietaryNeeds: string;
  department: string;
  invitedAt: Date;
  respondedAt?: Date;
}

const initialGuests: Guest[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@company.com', status: 'confirmed', dietaryNeeds: 'Vegetarian', department: 'Engineering', invitedAt: new Date('2024-01-15'), respondedAt: new Date('2024-01-16') },
  { id: '2', name: 'Michael Chen', email: 'michael.c@company.com', status: 'confirmed', dietaryNeeds: 'None', department: 'Marketing', invitedAt: new Date('2024-01-15'), respondedAt: new Date('2024-01-17') },
  { id: '3', name: 'Emily Rodriguez', email: 'emily.r@company.com', status: 'pending', dietaryNeeds: 'Gluten-free', department: 'Sales', invitedAt: new Date('2024-01-15') },
  { id: '4', name: 'David Kim', email: 'david.k@company.com', status: 'declined', dietaryNeeds: 'None', department: 'Finance', invitedAt: new Date('2024-01-15'), respondedAt: new Date('2024-01-18') },
  { id: '5', name: 'Jessica Liu', email: 'jessica.l@company.com', status: 'confirmed', dietaryNeeds: 'Vegan', department: 'HR', invitedAt: new Date('2024-01-15'), respondedAt: new Date('2024-01-16') },
  { id: '6', name: 'Robert Taylor', email: 'robert.t@company.com', status: 'pending', dietaryNeeds: 'None', department: 'Engineering', invitedAt: new Date('2024-01-15') },
  { id: '7', name: 'Amanda White', email: 'amanda.w@company.com', status: 'confirmed', dietaryNeeds: 'Dairy-free', department: 'Design', invitedAt: new Date('2024-01-15'), respondedAt: new Date('2024-01-17') },
  { id: '8', name: 'James Brown', email: 'james.b@company.com', status: 'pending', dietaryNeeds: 'None', department: 'Operations', invitedAt: new Date('2024-01-15') },
];

type SortField = 'name' | 'status' | 'department' | 'dietaryNeeds';
type SortDirection = 'asc' | 'desc';

const RSVPTracker = () => {
  const { eventBasics } = useEvent();
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const expectedParticipants = eventBasics.participants || 100;
  const confirmedCount = guests.filter(g => g.status === 'confirmed').length;
  const declinedCount = guests.filter(g => g.status === 'declined').length;
  const pendingCount = guests.filter(g => g.status === 'pending').length;

  const departments = [...new Set(guests.map(g => g.department))];

  const filteredGuests = guests
    .filter(guest => {
      const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           guest.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || guest.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
        case 'dietaryNeeds':
          comparison = a.dietaryNeeds.localeCompare(b.dietaryNeeds);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const getStatusBadge = (status: Guest['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success/10 text-success border-success/20">Confirmed</Badge>;
      case 'declined':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Declined</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
    }
  };

  const handleSendReminders = () => {
    const pendingGuests = guests.filter(g => g.status === 'pending');
    toast({
      title: "Reminders Sent",
      description: `RSVP reminders sent to ${pendingGuests.length} pending guests.`,
    });
  };

  const handleDownloadCSV = () => {
    const headers = ['Name', 'Email', 'Status', 'Dietary Needs', 'Department', 'Invited At', 'Responded At'];
    const csvContent = [
      headers.join(','),
      ...guests.map(g => [
        g.name,
        g.email,
        g.status,
        g.dietaryNeeds,
        g.department,
        g.invitedAt.toISOString().split('T')[0],
        g.respondedAt ? g.respondedAt.toISOString().split('T')[0] : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: "Guest list exported as CSV file.",
    });
  };

  return (
    <>
      <Helmet>
        <title>RSVP Tracker - EventPaul</title>
        <meta name="description" content="Track attendance and manage RSVPs for your corporate event." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">RSVP Tracker</h1>
          <p className="text-muted-foreground">Manage attendance and track responses</p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected</p>
                  <p className="text-2xl font-bold text-foreground">{expectedParticipants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-success">{confirmedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Declined</p>
                  <p className="text-2xl font-bold text-destructive">{declinedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSendReminders}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminders
                  </Button>
                  <Button variant="default" onClick={handleDownloadCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Guest Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guest List ({filteredGuests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('name')}
                      >
                        Name <SortIcon field="name" />
                      </TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('status')}
                      >
                        Status <SortIcon field="status" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('dietaryNeeds')}
                      >
                        Dietary Needs <SortIcon field="dietaryNeeds" />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('department')}
                      >
                        Department <SortIcon field="department" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell className="font-medium">{guest.name}</TableCell>
                        <TableCell className="text-muted-foreground">{guest.email}</TableCell>
                        <TableCell>{getStatusBadge(guest.status)}</TableCell>
                        <TableCell>
                          {guest.dietaryNeeds !== 'None' ? (
                            <Badge variant="outline">{guest.dietaryNeeds}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{guest.department}</TableCell>
                      </TableRow>
                    ))}
                    {filteredGuests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No guests found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <ConfigAssistant />
    </>
  );
};

export default RSVPTracker;
