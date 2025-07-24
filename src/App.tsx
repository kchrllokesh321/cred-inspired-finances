import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import PinEntry from "./components/PinEntry";
import MainLayout from "./components/MainLayout";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import People from "./pages/People";
import Profile from "./pages/Profile";
import TransactionDetail from "./pages/TransactionDetail";
import PersonDetail from "./pages/PersonDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    // Simulate splash screen delay and check for PIN
    const timer = setTimeout(() => {
      const storedPin = localStorage.getItem('userPin');
      setHasPin(!!storedPin);
      setIsLoading(false);
      if (!storedPin) {
        setIsAuthenticated(true); // No PIN required, go directly to app
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handlePinSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  if (hasPin && !isAuthenticated) {
    return <PinEntry onSuccess={handlePinSuccess} />;
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