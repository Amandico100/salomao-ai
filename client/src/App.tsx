import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import Dashboard from "@/pages/Dashboard";
import Monitor from "@/pages/Monitor";
import NotFound from "@/pages/not-found";
import FloatingSalomao from "@/components/FloatingSalomao";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/chat" component={Chat} />
          <Route path="/monitor" component={Monitor} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/chat" component={Chat} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/monitor" component={Monitor} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark min-h-screen bg-dark-900 text-white">
          <Router />
          <FloatingSalomao />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
