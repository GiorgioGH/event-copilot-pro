// Employee data structure from people.json
export interface Employee {
  No: number;
  'First Name': string;
  'Last Name': string;
  Gender: string;
  'Start Date': string;
  Years: number;
  Department: string;
  Country: string;
  Center: string;
  'Annual Salary': number;
}

export interface EmployeeWithAttendance extends Employee {
  invited: boolean;
  attended: boolean;
  checkInTime?: string;
  satisfaction?: number;
}

/**
 * Load employees from people.json
 */
export async function loadEmployees(): Promise<Employee[]> {
  try {
    const response = await fetch('/people.json');
    if (!response.ok) {
      console.warn('Could not load people.json');
      return [];
    }
    const employees: Employee[] = await response.json();
    return employees.filter(e => e && e['First Name'] && e['Last Name']);
  } catch (error) {
    console.error('Error loading employees:', error);
    return [];
  }
}

/**
 * Get employees by department
 */
export function getEmployeesByDepartment(employees: Employee[]): Record<string, Employee[]> {
  const byDepartment: Record<string, Employee[]> = {};
  employees.forEach(emp => {
    const dept = emp.Department || 'Unassigned';
    if (!byDepartment[dept]) {
      byDepartment[dept] = [];
    }
    byDepartment[dept].push(emp);
  });
  return byDepartment;
}

/**
 * Simulate attendance for employees based on event participants count
 */
export function simulateAttendance(
  employees: Employee[],
  eventParticipants: number
): EmployeeWithAttendance[] {
  // Randomly select employees to invite (up to eventParticipants count)
  const shuffled = [...employees].sort(() => Math.random() - 0.5);
  const invited = shuffled.slice(0, Math.min(eventParticipants, employees.length));
  
  return employees.map(emp => {
    const isInvited = invited.some(e => e.No === emp.No);
    if (!isInvited) {
      return { ...emp, invited: false, attended: false };
    }
    
    // 85-95% attendance rate for invited employees
    const attendanceRate = 0.85 + Math.random() * 0.1;
    const attended = Math.random() < attendanceRate;
    
    // Random check-in time between 8:00 AM and 9:30 AM
    const checkInHour = 8 + Math.floor(Math.random() * 2);
    const checkInMinute = attended ? Math.floor(Math.random() * 60) : 0;
    const checkInTime = attended 
      ? `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`
      : undefined;
    
    // Satisfaction score 3.5-5.0 for attendees
    const satisfaction = attended ? 3.5 + Math.random() * 1.5 : undefined;
    
    return {
      ...emp,
      invited: true,
      attended,
      checkInTime,
      satisfaction,
    };
  });
}

/**
 * Calculate analytics from employee attendance data
 */
export function calculateAnalytics(employeesWithAttendance: EmployeeWithAttendance[]) {
  const invited = employeesWithAttendance.filter(e => e.invited);
  const attended = invited.filter(e => e.attended);
  const noShows = invited.filter(e => !e.attended);
  const lateArrivals = attended.filter(e => {
    if (!e.checkInTime) return false;
    const [hour] = e.checkInTime.split(':').map(Number);
    return hour >= 9; // Arrived after 9:00 AM
  });
  
  const attendanceRate = invited.length > 0 ? Math.round((attended.length / invited.length) * 100) : 0;
  const avgSatisfaction = attended.length > 0
    ? attended.reduce((sum, e) => sum + (e.satisfaction || 0), 0) / attended.length
    : 0;
  
  // Department breakdown
  const byDepartment: Record<string, { invited: number; attended: number }> = {};
  invited.forEach(emp => {
    const dept = emp.Department || 'Unassigned';
    if (!byDepartment[dept]) {
      byDepartment[dept] = { invited: 0, attended: 0 };
    }
    byDepartment[dept].invited++;
    if (emp.attended) {
      byDepartment[dept].attended++;
    }
  });
  
  return {
    invited: invited.length,
    attended: attended.length,
    noShows: noShows.length,
    lateArrivals: lateArrivals.length,
    attendanceRate,
    avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
    byDepartment,
    qrCheckIns: Math.round(attended.length * 0.9), // 90% used QR code
    manualCheckIns: attended.length - Math.round(attended.length * 0.9),
  };
}

