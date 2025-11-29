import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useEvent } from '@/contexts/EventContext';
import { 
  loadEmployees, 
  getEmployeesByDepartment,
  Employee
} from '@/lib/people';
import { 
  Users, 
  Search, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  User,
  Mail,
  UserPlus
} from 'lucide-react';

interface EmployeeWithInvitation extends Employee {
  invited: boolean;
}

const Team = () => {
  const { currentPlan, invitedPeople, setInvitedPeople } = useEvent();
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees().then(employees => {
      setAllEmployees(employees);
      setLoading(false);
    });
  }, []);

  const departments = getEmployeesByDepartment(allEmployees);
  const departmentList = Object.keys(departments).sort();

  // Map employees with invitation status
  const employeesWithInvitation: EmployeeWithInvitation[] = allEmployees.map(emp => ({
    ...emp,
    invited: invitedPeople.includes(emp.No),
  }));

  // Filter employees
  const filteredEmployees = employeesWithInvitation.filter(emp => {
    const matchesSearch = searchQuery === '' || 
      `${emp['First Name']} ${emp['Last Name']}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.Department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDepartment === 'all' || emp.Department === selectedDepartment;
    
    return matchesSearch && matchesDept;
  });

  const toggleInvitation = (employeeNo: number) => {
    setInvitedPeople(prev => {
      if (prev.includes(employeeNo)) {
        return prev.filter(no => no !== employeeNo);
      } else {
        return [...prev, employeeNo];
      }
    });
  };

  const invitationStats = {
    total: invitedPeople.length,
    byDepartment: Object.keys(departments).reduce((acc, dept) => {
      const deptEmployees = employeesWithInvitation.filter(e => e.Department === dept);
      const invited = deptEmployees.filter(e => e.invited);
      acc[dept] = {
        total: deptEmployees.length,
        invited: invited.length,
      };
      return acc;
    }, {} as Record<string, { total: number; invited: number }>),
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Team - EventPaul</title>
        </Helmet>
        <DashboardNav />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading team data...</p>
          </div>
        </main>
      </>
    );
  }

  if (!currentPlan) {
    return (
      <>
        <Helmet>
          <title>Team - EventPaul</title>
        </Helmet>
        <DashboardNav />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Event Selected</h2>
            <p className="text-muted-foreground">Select an event to view team attendance.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Team - EventPaul</title>
        <meta name="description" content="View team members and attendance by department." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Team Invitations</h1>
          <p className="text-muted-foreground">Invite team members to your event by department</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invited</p>
                    <p className="text-3xl font-bold text-foreground">{invitationStats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-accent/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-3xl font-bold text-foreground">{allEmployees.length}</p>
                  </div>
                  <User className="w-8 h-8 text-accent/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Invitation Rate</p>
                    <p className="text-3xl font-bold text-accent">
                      {allEmployees.length > 0 ? Math.round((invitationStats.total / allEmployees.length) * 100) : 0}%
                    </p>
                  </div>
                  <Mail className="w-8 h-8 text-accent/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 3-Column Layout: Filter (small) | People (middle) | Departments */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Filter (small) */}
        <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
                <Card>
              <CardHeader>
                <CardTitle className="text-base">Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium mb-2">Department</p>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full p-2 rounded-md border border-border bg-background text-foreground text-sm"
                  >
                    <option value="all">All Departments</option>
                    {departmentList.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                        </div>
                      </CardContent>
                    </Card>
        </motion.div>

          {/* Column 2: People List (middle) */}
        <motion.div
            className="lg:col-span-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {(selectedDepartment === 'all' 
                    ? allEmployees 
                    : allEmployees.filter(e => e.Department === selectedDepartment)
                  ).map((employee) => {
                    const isInvited = invitedPeople.includes(employee.No);
                    return (
                      <div
                        key={employee.No}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isInvited ? 'border-accent bg-accent/5' : 'border-border'
                        }`}
                        onClick={() => toggleInvitation(employee.No)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isInvited}
                            onCheckedChange={() => toggleInvitation(employee.No)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {employee['First Name']} {employee['Last Name']}
                            </p>
                            <p className="text-xs text-muted-foreground">{employee.Department}</p>
                          </div>
                          {isInvited && <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

          {/* Column 3: Invited People */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Invited People ({invitedPeople.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invitedPeople.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No people invited yet. Select people from the list to invite them.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {invitedPeople.map((personId) => {
                      const employee = allEmployees.find(e => e.No === personId);
                      if (!employee) return null;
                      return (
                        <div
                          key={personId}
                          className="p-3 rounded-lg border border-accent/20 bg-accent/5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {employee['First Name']} {employee['Last Name']}
                              </p>
                              <p className="text-xs text-muted-foreground">{employee.Department}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </main>
    </>
  );
};

export default Team;

