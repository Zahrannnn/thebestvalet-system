import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EntranceDashboard from "./pages/EntranceDashboard";
import ValetDashboard from "./pages/ValetDashboard";
import UserCarRequest from "./pages/UserCarRequest";
import Settings from "./pages/Settings";

import NotFound from "./pages/NotFound";
import { ValetProvider } from "./context/ValetContext";
import Test from "./components/test";
import { Analytics } from "@vercel/analytics/react"
import React from 'react';

const queryClient = new QueryClient();



const App = () => (
  <QueryClientProvider client={queryClient}>
    <ValetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/entrance" element={<EntranceDashboard />} />
            <Route path="/valet" element={<ValetDashboard />} />
            <Route path="/request" element={<UserCarRequest />} />
            <Route path="/settings" element={<Settings />} />
        
            <Route path="/test" element={<Test />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </ValetProvider>
  </QueryClientProvider>
);

export default App;
