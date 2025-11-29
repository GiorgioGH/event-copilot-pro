import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import EventSummaryCard from '@/components/dashboard/EventSummaryCard';
import TasksTimeline from '@/components/dashboard/TasksTimeline';
import AgendaPanel from '@/components/dashboard/AgendaPanel';
import VendorRecommendations from '@/components/dashboard/VendorRecommendations';
import DashboardNav from '@/components/dashboard/DashboardNav';
import ConfigAssistant from '@/components/chat/ConfigAssistant';

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Event Dashboard - SME Event Copilot</title>
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

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks */}
          <div className="lg:col-span-1">
            <TasksTimeline />
          </div>

          {/* Middle Column - Agenda */}
          <div className="lg:col-span-1">
            <AgendaPanel />
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
