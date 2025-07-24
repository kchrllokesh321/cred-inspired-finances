import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PinEntryProps {
  onSuccess: () => void;
}

const PinEntry = ({ onSuccess }: PinEntryProps) => {
  const [pin, setPin] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const { toast } = useToast();

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      
      if (newPin.length === 4) {
        // Verify PIN
        const storedPin = localStorage.getItem('userPin');
        if (newPin === storedPin) {
          onSuccess();
        } else {
          setIsShaking(true);
          setPin("");
          toast({
            title: "Incorrect PIN",
            description: "Please try again",
            variant: "destructive",
          });
          setTimeout(() => setIsShaking(false), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const pinButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete']
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="text-title text-foreground mb-2">Welcome back!</h1>
          <p className="text-subtext text-muted-foreground">Enter your PIN to continue</p>
        </div>

        {/* PIN Dots */}
        <div className={`flex justify-center gap-4 mb-12 transition-transform duration-200 ${isShaking ? 'animate-pulse' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                index < pin.length 
                  ? 'bg-primary border-primary shadow-lg' 
                  : 'border-border bg-card'
              }`}
            />
          ))}
        </div>

        {/* PIN Keypad */}
        <div className="grid grid-cols-3 gap-4">
          {pinButtons.flat().map((button, index) => {
            if (button === '') return <div key={index} />;
            
            if (button === 'delete') {
              return (
                <Button
                  key={index}
                  variant="pin-button"
                  size="pin"
                  onClick={handleDelete}
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
                onClick={() => handlePinInput(button)}
              >
                {button}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PinEntry;