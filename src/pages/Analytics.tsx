import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

const Analytics = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | '30days' | 'year'>('30days');

  useEffect(() => {
    const stored = localStorage.getItem('transactions');
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  }, []);

  const filterTransactionsByPeriod = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  const filteredTransactions = filterTransactionsByPeriod();

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;

  const getCategoryData = () => {
    const categoryMap = new Map<string, number>();
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
      });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const categoryData = getCategoryData();
  const maxCategoryAmount = Math.max(...categoryData.map(c => c.amount), 1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'day': return 'Today';
      case '30days': return 'Last 30 Days';
      case 'year': return 'This Year';
      default: return 'Last 30 Days';
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-title text-foreground mb-2">Analytics</h1>
        <p className="text-subtext text-muted-foreground">Your spending insights</p>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'day', label: 'Day' },
          { key: '30days', label: '30 Days' },
          { key: 'year', label: 'Year' }
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={selectedPeriod === key ? "neumorphic-primary" : "neumorphic"}
            className="flex-1"
            onClick={() => setSelectedPeriod(key as any)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="neumorphic rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-card text-muted-foreground">{getPeriodLabel()} Summary</span>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-body text-foreground">Income</span>
              <span className="text-body text-income font-medium">
                {formatCurrency(totalIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body text-foreground">Expenses</span>
              <span className="text-body text-expense font-medium">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center">
                <span className="text-card text-foreground">Net Amount</span>
                <div className="flex items-center">
                  {netAmount >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-income mr-2" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-expense mr-2" />
                  )}
                  <span className={`text-card font-medium ${
                    netAmount >= 0 ? 'text-income' : 'text-expense'
                  }`}>
                    {formatCurrency(Math.abs(netAmount))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="neumorphic rounded-3xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-card text-foreground">Top Categories</span>
          <PieChart className="h-5 w-5 text-primary" />
        </div>

        {categoryData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-body">No expense data</div>
            <div className="text-subtext text-muted-foreground mt-1">
              Add some transactions to see insights
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {categoryData.map(({ category, amount }) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-body text-foreground capitalize">{category}</span>
                  <span className="text-body text-foreground font-medium">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(amount / maxCategoryAmount) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Count */}
      <div className="neumorphic-sm rounded-2xl p-4 mb-8">
        <div className="text-center">
          <div className="text-display text-foreground">
            {filteredTransactions.length}
          </div>
          <div className="text-subtext text-muted-foreground">
            Total transactions in {getPeriodLabel().toLowerCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;