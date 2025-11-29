import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { useEvent } from '@/contexts/EventContext';
import { 
  loadEmployees, 
  getEmployeesByDepartment,
  simulateAttendance,
  Employee,
  EmployeeWithAttendance 
} from '@/lib/people';
import { 
  Users, 
  Search, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  User
} from 'lucide-react';

const Team = () => {
  const { currentPlan } = useEvent();
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [employeesWithAttendance, setEmployeesWithAttendance] = useState<EmployeeWithAttendance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees().then(employees => {
      setAllEmployees(employees);
      
      if (currentPlan && employees.length > 0) {
        const participants = currentPlan.basics.participants || 100;
        const withAttendance = simulateAttendance(employees, participants);
        setEmployeesWithAttendance(withAttendance);
      }
      setLoading(false);
    });
  }, [currentPlan?.basics.participants]);

  const departments = getEmployeesByDepartment(allEmployees);
  const departmentList = Object.keys(departments).sort();

  // Filter employees
  const invitedEmployees = employeesWithAttendance.filter(e => e.invited);
  const filteredEmployees = invitedEmployees.filter(emp => {
    const matchesSearch = searchQuery === '' || 
      `${emp['First Name']} ${emp['Last Name']}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.Department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDepartment === 'all' || emp.Department === selectedDepartment;
    
    return matchesSearch && matchesDept;
  });

  const attendanceStats = {
    total: invitedEmployees.length,
    attended: invitedEmployees.filter(e => e.attended).length,
    noShows: invitedEmployees.filter(e => !e.attended).length,
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Team - SME Event Copilot</title>
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
          <title>Team - SME Event Copilot</title>
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
        <title>Team - SME Event Copilot</title>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Team Attendance</h1>
          <p className="text-muted-foreground">View invited employees and attendance by department</p>
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
                    <p className="text-3xl font-bold text-foreground">{attendanceStats.total}</p>
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
                    <p className="text-sm text-muted-foreground">Attended</p>
                    <p className="text-3xl font-bold text-success">{attendanceStats.attended}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-success/50" />
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
                    <p className="text-sm text-muted-foreground">No-shows</p>
                    <p className="text-3xl font-bold text-destructive">{attendanceStats.noShows}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-destructive/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Department Tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            {departmentList.map(dept => (
              <TabsTrigger key={dept} value={dept}>
                {dept}
              </TabsTrigger>
            ))}
          </TabsList>

          {departmentList.map(dept => (
            <TabsContent key={dept} value={dept} className="mt-6">
              {filteredEmployees.filter(e => e.Department === dept).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No employees in this department were invited.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees
                    .filter(e => e.Department === dept)
                    .map((employee, index) => (
                      <motion.div
                        key={employee.No}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`h-full ${employee.attended ? 'border-success/20' : 'border-destructive/20'}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  employee.attended ? 'bg-success/10' : 'bg-destructive/10'
                                }`}>
                                  <User className={`w-5 h-5 ${
                                    employee.attended ? 'text-success' : 'text-destructive'
                                  }`} />
                                </div>
                                <div>
                                  <CardTitle className="text-base">
                                    {employee['First Name']} {employee['Last Name']}
                                  </CardTitle>
                                  <p className="text-xs text-muted-foreground">{employee.Department}</p>
                                </div>
                              </div>
                              {employee.attended ? (
                                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                              ) : (
                                <XCircle className="w-5 h-5 text-destructive shrink-0" />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Status</span>
                              <Badge variant={employee.attended ? 'default' : 'destructive'}>
                                {employee.attended ? 'Attended' : 'No-show'}
                              </Badge>
                            </div>
                            {employee.checkInTime && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Check-in
                                </span>
                                <span className="text-foreground">{employee.checkInTime}</span>
                              </div>
                            )}
                            {employee.satisfaction && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Satisfaction</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-foreground">{employee.satisfaction.toFixed(1)}</span>
                                  <span className="text-muted-foreground">/ 5.0</span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                              <span className="text-muted-foreground">Years at Company</span>
                              <span className="text-foreground">{employee.Years} years</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              )}
            </TabsContent>
          ))}
          
          <TabsContent value="all" className="mt-6">
            {filteredEmployees.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No employees found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map((employee, index) => (
                  <motion.div
                    key={employee.No}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`h-full ${employee.attended ? 'border-success/20' : 'border-destructive/20'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              employee.attended ? 'bg-success/10' : 'bg-destructive/10'
                            }`}>
                              <User className={`w-5 h-5 ${
                                employee.attended ? 'text-success' : 'text-destructive'
                              }`} />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {employee['First Name']} {employee['Last Name']}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">{employee.Department}</p>
                            </div>
                          </div>
                          {employee.attended ? (
                            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant={employee.attended ? 'default' : 'destructive'}>
                            {employee.attended ? 'Attended' : 'No-show'}
                          </Badge>
                        </div>
                        {employee.checkInTime && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Check-in
                            </span>
                            <span className="text-foreground">{employee.checkInTime}</span>
                          </div>
                        )}
                        {employee.satisfaction && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Satisfaction</span>
                            <div className="flex items-center gap-1">
                              <span className="text-foreground">{employee.satisfaction.toFixed(1)}</span>
                              <span className="text-muted-foreground">/ 5.0</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                          <span className="text-muted-foreground">Years at Company</span>
                          <span className="text-foreground">{employee.Years} years</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </motion.div>

        {/* Department Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" />
                Attendance by Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(departments)
                  .filter(([dept]) => {
                    const deptEmployees = invitedEmployees.filter(e => e.Department === dept);
                    return deptEmployees.length > 0;
                  })
                  .sort(([, a], [, b]) => {
                    const aInvited = invitedEmployees.filter(e => e.Department === a[0].Department).length;
                    const bInvited = invitedEmployees.filter(e => e.Department === b[0].Department).length;
                    return bInvited - aInvited;
                  })
                  .map(([dept, deptEmployees]) => {
                    const invited = invitedEmployees.filter(e => e.Department === dept);
                    const attended = invited.filter(e => e.attended);
                    const attendanceRate = invited.length > 0 
                      ? Math.round((attended.length / invited.length) * 100) 
                      : 0;

                    return (
                      <div key={dept} className="p-4 rounded-lg border border-border bg-card">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{dept}</h3>
                            <p className="text-sm text-muted-foreground">
                              {attended.length} of {invited.length} attended
                            </p>
                          </div>
                          <Badge variant={attendanceRate >= 80 ? 'default' : attendanceRate >= 60 ? 'secondary' : 'destructive'}>
                            {attendanceRate}%
                          </Badge>
                        </div>
                        <Progress value={attendanceRate} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </>
  );
};

export default Team;

