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
import EditTransaction from "@/pages/EditTransaction";
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
    const initializeAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed:', event, session);
            setUser(session?.user?.id ?? null);
            setIsAuthenticated(!!session?.user);
            
            if (session?.user) {
              // Get username from session metadata or localStorage
              const sessionUsername = session.user.user_metadata?.username;
              const storedUsername = localStorage.getItem('username');
              const finalUsername = sessionUsername || storedUsername;
              
              if (finalUsername) {
                setUsername(finalUsername);
                setNeedsUsername(false);
              } else {
                setNeedsUsername(true);
              }
            } else {
              setNeedsUsername(true);
            }
            setLoading(false);
          }
        );

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (!session) {
          setNeedsUsername(true);
          setLoading(false);
        }

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
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
              <Route path="edit-transaction/:id" element={<EditTransaction />} />
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