import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Person {
  id: string;
  name: string;
  balance: number;
  lastTransaction: string;
}

interface SharedTransaction {
  id: string;
  personId: string;
  amount: number;
  description: string;
  date: string;
  type: 'lent' | 'borrowed'; // lent = user gave money, borrowed = user received money
  timestamp: string;
}

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [transactions, setTransactions] = useState<SharedTransaction[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<'lent' | 'borrowed'>('lent');

  useEffect(() => {
    // Load person data
    const people = JSON.parse(localStorage.getItem('people') || '[]');
    const found = people.find((p: Person) => p.id === id);
    setPerson(found || null);

    // Load shared transactions
    const sharedTransactions = JSON.parse(localStorage.getItem('sharedTransactions') || '[]');
    const personTransactions = sharedTransactions.filter((t: SharedTransaction) => t.personId === id);
    setTransactions(personTransactions);
  }, [id]);

  const handleAddTransaction = () => {
    if (!newAmount || !newDescription.trim() || !person) return;

    const transaction: SharedTransaction = {
      id: Date.now().toString(),
      personId: person.id,
      amount: parseFloat(newAmount),
      description: newDescription.trim(),
      date: new Date().toISOString().split('T')[0],
      type: newType,
      timestamp: new Date().toISOString(),
    };

    // Update transactions
    const allTransactions = JSON.parse(localStorage.getItem('sharedTransactions') || '[]');
    allTransactions.push(transaction);
    localStorage.setItem('sharedTransactions', JSON.stringify(allTransactions));
    setTransactions([transaction, ...transactions]);

    // Update person's balance
    const people = JSON.parse(localStorage.getItem('people') || '[]');
    const updatedPeople = people.map((p: Person) => {
      if (p.id === person.id) {
        const balanceChange = newType === 'lent' ? parseFloat(newAmount) : -parseFloat(newAmount);
        return {
          ...p,
          balance: p.balance + balanceChange,
          lastTransaction: new Date().toISOString(),
        };
      }
      return p;
    });
    localStorage.setItem('people', JSON.stringify(updatedPeople));
    
    const updatedPerson = updatedPeople.find((p: Person) => p.id === person.id);
    if (updatedPerson) setPerson(updatedPerson);

    // Reset form
    setNewAmount("");
    setNewDescription("");
    setShowAddForm(false);
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
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) {
      return `${person?.name} owes you ${formatCurrency(balance)}`;
    } else if (balance < 0) {
      return `You owe ${person?.name} ${formatCurrency(Math.abs(balance))}`;
    } else {
      return "All settled up";
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-income";
    if (balance < 0) return "text-debt";
    return "text-muted-foreground";
  };

  if (!person) {
    return (
      <div className="min-h-screen bg-background px-6 pt-8">
        <div className="text-center mt-20">
          <div className="text-body text-foreground">Person not found</div>
          <Button
            variant="neumorphic-primary"
            className="mt-4"
            onClick={() => navigate('/people')}
          >
            Go Back
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
          onClick={() => navigate('/people')}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-title text-foreground">{person.name}</h1>
      </div>

      {/* Balance Card */}
      <div className="neumorphic rounded-3xl p-6 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-primary font-bold text-2xl">
              {person.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className={`text-card ${getBalanceColor(person.balance)}`}>
            {getBalanceText(person.balance)}
          </div>
          {person.balance !== 0 && (
            <div className="text-display text-foreground mt-2">
              {formatCurrency(Math.abs(person.balance))}
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Button */}
      <Button
        variant="neumorphic-primary"
        className="w-full mb-8"
        onClick={() => setShowAddForm(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Shared Expense
      </Button>

      {/* Add Transaction Form */}
      {showAddForm && (
        <div className="neumorphic rounded-3xl p-6 mb-8">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={newType === 'lent' ? "neumorphic-primary" : "neumorphic"}
                className="flex-1"
                onClick={() => setNewType('lent')}
              >
                I Lent Money
              </Button>
              <Button
                variant={newType === 'borrowed' ? "neumorphic-primary" : "neumorphic"}
                className="flex-1"
                onClick={() => setNewType('borrowed')}
              >
                I Borrowed Money
              </Button>
            </div>

            <input
              type="number"
              placeholder="Amount"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-full bg-background border-0 rounded-xl p-3 text-body text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="text"
              placeholder="Description (e.g., Dinner, Movie tickets)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-background border-0 rounded-xl p-3 text-body text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex gap-3">
              <Button
                variant="neumorphic-primary"
                className="flex-1"
                onClick={handleAddTransaction}
              >
                Add
              </Button>
              <Button
                variant="neumorphic"
                className="flex-1"
                onClick={() => {
                  setShowAddForm(false);
                  setNewAmount("");
                  setNewDescription("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="mb-8">
        <h2 className="text-card text-foreground mb-4">Transaction History</h2>
        
        {transactions.length === 0 ? (
          <div className="neumorphic-sm rounded-2xl p-8 text-center">
            <div className="text-body text-foreground mb-2">No transactions yet</div>
            <div className="text-subtext text-muted-foreground">
              Add a shared expense to get started
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="neumorphic-sm rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className={`rounded-xl p-2 mr-3 ${
                    transaction.type === 'lent' ? 'bg-income/20' : 'bg-debt/20'
                  }`}>
                    {transaction.type === 'lent' ? (
                      <ArrowUpRight className="h-4 w-4 text-income" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-debt" />
                    )}
                  </div>
                  <div>
                    <div className="text-body text-foreground">{transaction.description}</div>
                    <div className="text-subtext text-muted-foreground">
                      {formatDate(transaction.date)} • {transaction.type === 'lent' ? 'You lent' : 'You borrowed'}
                    </div>
                  </div>
                </div>
                <div className={`text-body font-medium ${
                  transaction.type === 'lent' ? 'text-income' : 'text-debt'
                }`}>
                  {transaction.type === 'lent' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonDetail;