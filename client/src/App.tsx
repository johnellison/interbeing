import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Landing from "@/pages/Landing";
import OnboardingPage from "@/pages/onboarding";
import ImpactTimeline from "@/pages/impact-timeline";
import Analytics from "@/pages/analytics";
import ImpactMap from "@/pages/impact-map";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route path="/" component={Landing} />
      ) : !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : !user?.onboardingCompleted ? (
        <Route path="/" component={OnboardingPage} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/impact-timeline" component={ImpactTimeline} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/impact-map" component={ImpactMap} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
