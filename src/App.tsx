import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { EventProvider } from "@/contexts/EventContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Header from "@/components/layout/Header";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Generating from "./pages/Generating";
import Dashboard from "./pages/Dashboard";
import RiskDashboard from "./pages/RiskDashboard";
import BudgetPlanner from "./pages/BudgetPlanner";
import Vendors from "./pages/Vendors";
import Collaboration from "./pages/Collaboration";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import DayOf from "./pages/DayOf";
import Communication from "./pages/Communication";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <EventProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Header />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/generating" element={<Generating />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/risk" element={<RiskDashboard />} />
                <Route path="/budget" element={<BudgetPlanner />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/collaboration" element={<Collaboration />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/day-of" element={<DayOf />} />
                  <Route path="/communication" element={<Communication />} />
                  <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </EventProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
