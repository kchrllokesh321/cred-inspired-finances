import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/MainLayout";
import Index from "@/pages/Index";
import Home from "@/pages/Home";
import Analytics from "@/pages/Analytics";
import People from "@/pages/People";
import PersonDetail from "@/pages/PersonDetail";
import TransactionDetail from "@/pages/TransactionDetail";
import Profile from "@/pages/Profile";
import PinEntry from "@/components/PinEntry";
import { UsernameEntry } from "@/components/UsernameEntry";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsUsername, setNeedsUsername] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if user exists in localStorage
        const storedUserId = localStorage.getItem('userId');
        const storedUsername = localStorage.getItem('username');
        
        if (storedUserId && storedUsername) {
          setUser(storedUserId);
          setUsername(storedUsername);
          setLoading(false);
          return;
        }

        // If no stored user, show username entry
        setNeedsUsername(true);
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const handleUsernameSuccess = (userId: string, username: string) => {
    setUser(userId);
    setUsername(username);
    setNeedsUsername(false);
  };

  const handlePinSuccess = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (needsUsername) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <UsernameEntry onSuccess={handleUsernameSuccess} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-title text-foreground mb-2">Error</h1>
          <p className="text-subtext text-muted-foreground">Unable to initialize app</p>
        </div>
      </div>
    );
  }

  if (user && !isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PinEntry onSuccess={handlePinSuccess} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="people" element={<People />} />
              <Route path="profile" element={<Profile />} />
              <Route path="transaction/:id" element={<TransactionDetail />} />
              <Route path="person/:id" element={<PersonDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;