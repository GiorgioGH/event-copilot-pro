import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import EventSummaryCard from '@/components/dashboard/EventSummaryCard';
import TasksTimeline from '@/components/dashboard/TasksTimeline';
import AgendaPanel from '@/components/dashboard/AgendaPanel';
import VendorRecommendations from '@/components/dashboard/VendorRecommendations';
import SelectedVendorsPanel from '@/components/dashboard/SelectedVendorsPanel';
import DashboardNav from '@/components/dashboard/DashboardNav';
import ConfigAssistant from '@/components/chat/ConfigAssistant';
import { useEvent } from '@/contexts/EventContext';
import CalendarPanel from '@/components/dashboard/CalendarPanel';
import SidebarEvents from '@/components/dashboard/SidebarEvents';

const Dashboard = () => {
  const { currentPlan } = useEvent();

  if (!currentPlan) {
    return (
      <>
        <Helmet>
          <title>Event Dashboard - SME Event Copilot</title>
        </Helmet>
        <DashboardNav />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Event Selected</h2>
            <p className="text-muted-foreground mb-6">
              Create a new event or select an existing one from the dropdown above.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{currentPlan.basics.name || 'Event'} Dashboard - SME Event Copilot</title>
        <meta name="description" content="Manage your corporate event with AI-powered planning tools." />
      </Helmet>
      
      <DashboardNav />
      
      <main className="container mx-auto px-6 py-8">
        {/* Event Summary */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <EventSummaryCard />
        </motion.div>

        {/* Selected Vendors Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SelectedVendorsPanel />
        </motion.div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - My Events & Tasks */}
          <div className="lg:col-span-1">
            <SidebarEvents />
            <div className="mt-6" />
            <TasksTimeline />
          </div>

          {/* Middle Column - Calendar */}
          <div className="lg:col-span-1">
            <CalendarPanel />
          </div>

          {/* Right Column - Vendors */}
          <div className="lg:col-span-1">
            <VendorRecommendations />
          </div>
        </div>
      </main>
      
      <ConfigAssistant />
    </>
  );
};

export default Dashboard;
