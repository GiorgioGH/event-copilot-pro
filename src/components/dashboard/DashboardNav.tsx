import { NavLink } from '@/components/NavLink';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  BarChart3,
  Settings,
  Smartphone,
  Store
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/risk', label: 'Risk Dashboard', icon: AlertTriangle },
  { to: '/budget', label: 'Budget Planner', icon: DollarSign },
  { to: '/vendors', label: 'Vendors', icon: Store },
  { to: '/collaboration', label: 'Team', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/day-of', label: 'Day-of Mode', icon: Smartphone },
];

const DashboardNav = () => {
  return (
    <nav className="bg-card border-b border-border sticky top-[65px] z-40">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {navItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.to}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
                activeClassName="bg-accent/10 text-accent"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
