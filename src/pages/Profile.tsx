import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Lock, 
  User, 
  Download, 
  LogOut, 
  Settings, 
  Shield,
  ChevronRight,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');
  const { toast } = useToast();

  const handleSetPin = () => {
    // Simple PIN setup for demo
    const newPin = prompt("Enter a 4-digit PIN:");
    if (newPin && newPin.length === 4 && !isNaN(Number(newPin))) {
      localStorage.setItem('userPin', newPin);
      toast({
        title: "PIN Set Successfully",
        description: "Your PIN has been updated",
      });
    } else if (newPin) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit number",
        variant: "destructive",
      });
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

  const handleExportData = () => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const people = JSON.parse(localStorage.getItem('people') || '[]');
    
    const csvContent = [
      ['Type', 'Date', 'Category', 'Amount', 'Notes'],
      ...transactions.map((t: any) => [
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
      title: "Set/Change PIN",
      subtitle: "Secure your app with a PIN",
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
      <div className="neumorphic rounded-3xl p-6 mb-8">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mr-4">
            <span className="text-primary font-bold text-2xl">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-card text-foreground font-medium">{userName}</div>
            <div className="text-subtext text-muted-foreground">Premium Member</div>
          </div>
        </div>
      </div>

      {/* App Stats */}
      <div className="neumorphic rounded-3xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-card text-foreground">Your Activity</span>
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-title text-foreground">
              {JSON.parse(localStorage.getItem('transactions') || '[]').length}
            </div>
            <div className="text-subtext text-muted-foreground">Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-title text-foreground">
              {JSON.parse(localStorage.getItem('people') || '[]').length}
            </div>
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
              className="neumorphic-sm rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
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
      <div className="neumorphic-sm rounded-2xl p-4 mb-8 bg-primary/5">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-primary mr-3" />
          <div>
            <div className="text-body text-foreground font-medium">Data Privacy</div>
            <div className="text-subtext text-muted-foreground">
              All your data is stored securely on your device
            </div>
          </div>
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
    </div>
  );
};

export default Profile;