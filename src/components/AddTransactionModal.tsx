import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, DollarSign, Tag, Calendar, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionAdded: () => void;
}

const AddTransactionModal = ({ isOpen, onClose, onTransactionAdded }: AddTransactionModalProps) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!amount || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in amount and category",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        toast({
          title: "Authentication Error", 
          description: "Please sign in to add transactions",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: parseFloat(amount),
          category,
          date,
          notes: notes || null,
          type,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Transaction Added",
        description: `${type === 'income' ? 'Income' : 'Expense'} of ₹${amount} recorded`,
      });

      // Reset form
      setAmount("");
      setCategory("");
      setNotes("");
      onTransactionAdded();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-card w-full max-w-md rounded-t-3xl p-6 animate-in slide-in-from-bottom-full duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title text-foreground">Add Transaction</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={type === 'expense' ? "clean-primary" : "clean"}
            className="flex-1"
            onClick={() => setType('expense')}
          >
            Expense
          </Button>
          <Button
            variant={type === 'income' ? "clean-primary" : "clean"}
            className="flex-1"
            onClick={() => setType('income')}
          >
            Income
          </Button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              className="pl-10 bg-background border-0 text-body"
            />
          </div>

          <div className="relative">
            <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Category (e.g., Food, Transport)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-10 bg-background border-0 text-body"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 bg-background border-0 text-body"
            />
          </div>

          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="pl-10 bg-background border-0 text-body resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Save Button */}
        <Button
          variant="clean-primary"
          className="w-full mt-6"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Transaction"}
        </Button>
      </div>
    </div>
  );
};

export default AddTransactionModal;