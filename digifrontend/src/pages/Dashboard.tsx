
import { useState, useEffect } from 'react';
import { apiCall } from '@/utils/auth';
import { User } from '@/utils/auth';
import Navigation from '@/components/Navigation';
import { Wallet, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletBalance {
  balance: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  receiver_email?: string;
  sender_email?: string;
  status: string;
  created_at: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
}

interface SuspiciousActivity {
  count: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suspiciousCount, setSuspiciousCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // First get user profile to check if admin
        const profileRes = await apiCall<User>('/auth/profile');
        if (profileRes.data) {
          setUser(profileRes.data);
        }

        // Fetch balance and transactions in parallel
        const [balanceRes, transactionsRes] = await Promise.all([
          apiCall<WalletBalance>('/wallet/balance'),
          apiCall<TransactionsResponse>('/wallet/transactions?limit=5'),
        ]);

        if (balanceRes.data) setBalance(balanceRes.data.balance);
        
        // Fix: Handle the correct response structure
        if (transactionsRes.data && transactionsRes.data.transactions) {
          setTransactions(transactionsRes.data.transactions);
        }

        // Only fetch suspicious transactions for admin users
        if (profileRes.data?.is_admin) {
          const suspiciousRes = await apiCall<SuspiciousActivity>('/admin/suspicious-transactions');
          if (suspiciousRes.data) {
            setSuspiciousCount(suspiciousRes.data.count);
          }
        }

        if (profileRes.error || balanceRes.error) {
          toast({
            title: "Error",
            description: "Failed to load some dashboard data.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vault-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your DigiVault account today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Wallet Balance */}
          <div className="vault-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Wallet Balance</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(balance)}</p>
              </div>
              <div className="w-12 h-12 bg-vault-100 rounded-xl flex items-center justify-center">
                <Wallet className="h-6 w-6 text-vault-600" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="vault-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Recent Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Security Alert - Only show for admin users */}
          {user?.is_admin && (
            <div className="vault-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Suspicious Activity</p>
                  <p className="text-3xl font-bold text-gray-900">{suspiciousCount}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  suspiciousCount > 0 ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    suspiciousCount > 0 ? 'text-red-600' : 'text-green-600'
                  }`} />
                </div>
              </div>
              {suspiciousCount > 0 && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Alert: Review Required
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="vault-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            <a href="/transactions" className="text-vault-600 hover:text-vault-700 font-medium text-sm">
              View all →
            </a>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions yet</p>
              <p className="text-gray-500 text-sm">Start by making your first transaction</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'deposit' || transaction.type === 'receive'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'receive' ? (
                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.receiver_email || transaction.sender_email || 'System'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'deposit' || transaction.type === 'receive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'receive' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <p className="text-sm text-gray-600">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
