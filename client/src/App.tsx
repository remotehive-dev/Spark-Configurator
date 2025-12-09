import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AdminPanel from "@/pages/AdminPanel";
import AdminLogin from "@/pages/AdminLogin";
import CounsellorEntry from "@/pages/CounsellorEntry";
import Calculator from "@/pages/Calculator";
import PresentationMode from "@/pages/PresentationMode";
import PaymentSuccess from "@/pages/PaymentSuccess";
import AdmissionComparison from "@/pages/AdmissionComparison";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CounsellorEntry} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminPanel} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/presentation" component={PresentationMode} />
      <Route path="/admission" component={AdmissionComparison} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
