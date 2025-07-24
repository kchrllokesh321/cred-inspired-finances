import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
  type: 'income' | 'expense';
  timestamp: string;
}

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const found = transactions.find((t: Transaction) => t.id === id);
    setTransaction(found || null);
  }, [id]);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const updated = transactions.filter((t: Transaction) => t.id !== id);
      localStorage.setItem('transactions', JSON.stringify(updated));
      navigate('/', { replace: true });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background px-6 pt-8">
        <div className="text-center mt-20">
          <div className="text-body text-foreground">Transaction not found</div>
          <Button
            variant="neumorphic-primary"
            className="mt-4"
            onClick={() => navigate('/')}
          >
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 pt-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-title text-foreground">Transaction Details</h1>
      </div>

      {/* Transaction Card */}
      <div className="neumorphic rounded-3xl p-6 mb-8">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            transaction.type === 'income' ? 'bg-income/20' : 'bg-expense/20'
          }`}>
            {transaction.type === 'income' ? (
              <ArrowDownRight className="h-8 w-8 text-income" />
            ) : (
              <ArrowUpRight className="h-8 w-8 text-expense" />
            )}
          </div>
          
          <div className="text-display text-foreground mb-2">
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </div>
          
          <div className={`text-card ${
            transaction.type === 'income' ? 'text-income' : 'text-expense'
          }`}>
            {transaction.type === 'income' ? 'Income' : 'Expense'}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-body text-muted-foreground">Category</span>
            <span className="text-body text-foreground font-medium capitalize">
              {transaction.category}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-body text-muted-foreground">Date</span>
            <span className="text-body text-foreground font-medium">
              {formatDate(transaction.date)}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-body text-muted-foreground">Time</span>
            <span className="text-body text-foreground font-medium">
              {formatTime(transaction.timestamp)}
            </span>
          </div>

          {transaction.notes && (
            <div className="py-3">
              <div className="text-body text-muted-foreground mb-2">Notes</div>
              <div className="text-body text-foreground bg-background rounded-xl p-3">
                {transaction.notes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button
          variant="neumorphic"
          className="w-full"
          onClick={() => {
            // Edit functionality would go here
            alert("Edit functionality coming soon!");
          }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Transaction
        </Button>

        <Button
          variant="destructive"
          className="w-full rounded-2xl"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Transaction
        </Button>
      </div>

      {/* Transaction ID */}
      <div className="mt-8 text-center">
        <div className="text-subtext text-muted-foreground">
          Transaction ID: {transaction.id}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;