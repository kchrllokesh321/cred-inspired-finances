import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';
import MainLayout from "@/components/MainLayout";
import Index from "@/pages/Index";
import Home from "@/pages/Home";
import Analytics from "@/pages/Analytics";
import People from "@/pages/People";
import PersonDetail from "@/pages/PersonDetail";
import TransactionDetail from "@/pages/TransactionDetail";
import Profile from "@/pages/Profile";
import PinEntry from "@/components/PinEntry";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // First check if we have a user ID stored locally
        const storedUserId = localStorage.getItem('userId');
        
        if (storedUserId) {
          // Check if user exists in database
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', storedUserId)
            .single();
          
          if (profile) {
            setUser({ id: storedUserId } as User);
            setLoading(false);
            return;
          }
        }

        // Create anonymous user in Supabase
        const { data, error } = await supabase.auth.signInAnonymously();
        
        if (error) {
          console.error('Error creating anonymous user:', error);
          setLoading(false);
          return;
        }

        if (data.user) {
          localStorage.setItem('userId', data.user.id);
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

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

  // If user exists but not authenticated with PIN, show PIN entry
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

  // If no user, something went wrong
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