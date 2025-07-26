import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User, CreditCard, Download, LogOut, Shield, Settings, Activity, FileText, Lock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [newPin, setNewPin] = useState("");
  const { toast } = useToast();

  const checkPinStatus = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('pin_enabled')
        .eq('user_id', userId)
        .single();

      if (profile) {
        setIsPinEnabled(profile.pin_enabled || false);
      }
    } catch (error) {
      console.error('Error checking PIN status:', error);
    }
  };

  useEffect(() => {
    checkPinStatus();
  }, []);

  const hashPin = async (pin: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSetPin = () => {
    setShowPinDialog(true);
  };

  const handlePinDigit = (digit: string) => {
    if (newPin.length < 4) {
      const updatedPin = newPin + digit;
      setNewPin(updatedPin);
      
      if (updatedPin.length === 4) {
        updatePin(updatedPin);
      }
    }
  };

  const updatePin = async (pin: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const hashedPin = await hashPin(pin);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          pin_hash: hashedPin,
          pin_enabled: true
        });

      if (error) throw error;

      toast({
        title: "PIN Updated",
        description: "Your PIN has been successfully updated",
      });
      
      setShowPinDialog(false);
      setNewPin("");
    } catch (error) {
      console.error('Error updating PIN:', error);
      toast({
        title: "Error",
        description: "Failed to update PIN. Please try again.",
        variant: "destructive",
      });
      setNewPin("");
    }
  };

  const handleDeletePin = () => {
    if (newPin.length > 0) {
      setNewPin(prev => prev.slice(0, -1));
    }
  };

  const handleEditProfile = () => {
    const newName = prompt("Enter your name:", userName);
    if (newName && newName.trim()) {
      setUserName(newName.trim());
      localStorage.setItem('userName', newName.trim());
      toast({
        title: "Profile Updated",
        description: "Your name has been updated",
      });
    }
  };

  const handleExportData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      const { data: people } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', userId);

      const csvContent = [
        ['Type', 'Date', 'Category', 'Amount', 'Notes'],
        ...(transactions || []).map((t: any) => [
          t.type,
          t.date,
          t.category,
          t.amount,
          t.notes || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expense-tracker-data.csv';
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been exported to CSV",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout? This will clear all your data.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const menuItems = [
    {
      icon: Lock,
      title: isPinEnabled ? "Change PIN" : "Set PIN",
      subtitle: isPinEnabled ? "Update your PIN" : "Secure your app with a PIN",
      onClick: handleSetPin,
    },
    {
      icon: User,
      title: "User Details",
      subtitle: "Edit your profile information",
      onClick: handleEditProfile,
    },
    {
      icon: Download,
      title: "Export to CSV",
      subtitle: "Download your transaction data",
      onClick: handleExportData,
    },
  ];

  return (
    <div className="min-h-screen bg-background px-6 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-title text-foreground mb-2">Profile</h1>
        <p className="text-subtext text-muted-foreground">Manage your account and settings</p>
      </div>

      {/* User Info Card */}
      <div className="clean-card rounded-3xl p-6 mb-8">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mr-4">
            <span className="text-primary font-bold text-2xl">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-card text-foreground font-medium">{userName}</div>
            <div className="text-subtext text-muted-foreground">@{username}</div>
          </div>
        </div>
      </div>

      {/* App Stats */}
      <div className="clean-card rounded-3xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-card text-foreground">Your Activity</span>
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-title text-foreground">--</div>
            <div className="text-subtext text-muted-foreground">Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-title text-foreground">--</div>
            <div className="text-subtext text-muted-foreground">People</div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-4 mb-8">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="clean-sm rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-all"
              onClick={item.onClick}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-body text-foreground font-medium">{item.title}</div>
                  <div className="text-subtext text-muted-foreground">{item.subtitle}</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          );
        })}
      </div>

      {/* Security Info */}
      <div className="clean-sm rounded-2xl p-4 mb-8 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-primary mr-3" />
            <div>
              <div className="text-body text-foreground font-medium">PIN Protection</div>
              <div className="text-subtext text-muted-foreground">
                {isPinEnabled ? 'Your app is secured with a PIN' : 'PIN protection is disabled'}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const userId = localStorage.getItem('userId');
                if (!userId) return;

                const newStatus = !isPinEnabled;
                const { error } = await supabase
                  .from('profiles')
                  .update({ pin_enabled: newStatus })
                  .eq('user_id', userId);

                if (error) throw error;

                setIsPinEnabled(newStatus);
                toast({
                  title: newStatus ? "PIN Enabled" : "PIN Disabled",
                  description: newStatus ? "Your app is now secured with a PIN" : "PIN protection has been disabled",
                });
              } catch (error) {
                console.error('Error toggling PIN:', error);
                toast({
                  title: "Error",
                  description: "Failed to update PIN setting",
                  variant: "destructive",
                });
              }
            }}
          >
            {isPinEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>

      {/* Logout Button */}
      <Button
        variant="destructive"
        className="w-full rounded-2xl"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout & Clear Data
      </Button>

      {/* Version Info */}
      <div className="text-center mt-8 pb-8">
        <div className="text-subtext text-muted-foreground">
          The Expense Tracker v1.0
        </div>
        <div className="text-subtext text-muted-foreground mt-1">
          Made with ❤️ by Lovable
        </div>
      </div>
        
      {/* PIN Update Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>Change PIN</DialogTitle>
            <DialogDescription>Enter a new 4-digit PIN</DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            {/* PIN Dots */}
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    index < newPin.length 
                      ? 'bg-primary border-primary shadow-lg' 
                      : 'border-border bg-card'
                  }`}
                />
              ))}
            </div>

            {/* PIN Keypad */}
            <div className="grid grid-cols-3 gap-4">
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['', '0', 'delete']
              ].flat().map((button, index) => {
                if (button === '') return <div key={index} />;
                
                if (button === 'delete') {
                  return (
                    <Button
                      key={index}
                      variant="pin-button"
                      size="pin"
                      onClick={handleDeletePin}
                      className="col-span-1"
                    >
                      ⌫
                    </Button>
                  );
                }

                return (
                  <Button
                    key={index}
                    variant="pin-button"
                    size="pin"
                    onClick={() => handlePinDigit(button)}
                  >
                    {button}
                  </Button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;