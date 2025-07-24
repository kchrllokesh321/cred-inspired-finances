import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
  type: 'income' | 'expense';
  timestamp: string;
}

const Home = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load transactions from localStorage
    const stored = localStorage.getItem('transactions');
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  }, []);

  const calculateBalance = () => {
    return transactions.reduce((balance, transaction) => {
      return transaction.type === 'income' 
        ? balance + transaction.amount 
        : balance - transaction.amount;
    }, 0);
  };

  const balance = calculateBalance();
  const recentTransactions = transactions.slice(0, 10);

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
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-title text-foreground mb-2">Good evening!</h1>
        <p className="text-subtext text-muted-foreground">Here's your financial overview</p>
      </div>

      {/* Balance Card */}
      <div className="neumorphic rounded-3xl p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-card text-muted-foreground">Total Balance</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="h-8 w-8"
          >
            {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <div className="text-display text-foreground">
          {isBalanceVisible ? formatCurrency(balance) : "••••••"}
        </div>
        <div className={`text-subtext mt-2 ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
          {balance >= 0 ? '↗ Positive balance' : '↘ Negative balance'}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="neumorphic-sm rounded-2xl p-4 flex items-center">
          <div className="bg-income/20 rounded-xl p-2 mr-3">
            <ArrowDownRight className="h-5 w-5 text-income" />
          </div>
          <div>
            <div className="text-card text-foreground">Income</div>
            <div className="text-subtext text-muted-foreground">This month</div>
          </div>
        </div>
        <div className="neumorphic-sm rounded-2xl p-4 flex items-center">
          <div className="bg-expense/20 rounded-xl p-2 mr-3">
            <ArrowUpRight className="h-5 w-5 text-expense" />
          </div>
          <div>
            <div className="text-card text-foreground">Expenses</div>
            <div className="text-subtext text-muted-foreground">This month</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-card text-foreground">Recent Transactions</h2>
          {transactions.length > 5 && (
            <Button variant="ghost" className="text-primary">
              View All
            </Button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="neumorphic-sm rounded-2xl p-8 text-center">
            <div className="text-muted-foreground text-body">
              No transactions yet
            </div>
            <div className="text-subtext text-muted-foreground mt-1">
              Tap the + button to add your first transaction
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="neumorphic-sm rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/transaction/${transaction.id}`)}
              >
                <div className="flex items-center">
                  <div className={`rounded-xl p-2 mr-3 ${
                    transaction.type === 'income' 
                      ? 'bg-income/20' 
                      : 'bg-expense/20'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowDownRight className="h-4 w-4 text-income" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-expense" />
                    )}
                  </div>
                  <div>
                    <div className="text-body text-foreground">{transaction.category}</div>
                    <div className="text-subtext text-muted-foreground">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                </div>
                <div className={`text-body font-medium ${
                  transaction.type === 'income' ? 'text-income' : 'text-expense'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;