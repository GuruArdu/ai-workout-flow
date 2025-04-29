
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthGate from "./layouts/AuthGate";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";

// Lazy load heavier pages for performance
const Onboarding = lazy(() => import("./pages/Onboarding"));
const StartWorkout = lazy(() => import("./pages/StartWorkout"));
const WorkoutDetail = lazy(() => import("./pages/WorkoutDetail"));
const Tracker = lazy(() => import("./pages/Tracker"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient();

// Loading component for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// App routes with authentication wrapper
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected routes wrapped in MainLayout and AuthGate */}
      <Route element={<AuthGate><MainLayout /></AuthGate>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={
          <Suspense fallback={<LoadingFallback />}>
            <Onboarding />
          </Suspense>
        } />
        <Route path="/start-workout" element={
          <Suspense fallback={<LoadingFallback />}>
            <StartWorkout />
          </Suspense>
        } />
        <Route path="/workout/:id" element={
          <Suspense fallback={<LoadingFallback />}>
            <WorkoutDetail />
          </Suspense>
        } />
        <Route path="/tracker" element={
          <Suspense fallback={<LoadingFallback />}>
            <Tracker />
          </Suspense>
        } />
        <Route path="/profile" element={
          <Suspense fallback={<LoadingFallback />}>
            <Profile />
          </Suspense>
        } />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider experimentalBypass={true}>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
