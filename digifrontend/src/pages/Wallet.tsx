
import { useState, useEffect } from 'react';
import { apiCall } from '@/utils/auth';
import Navigation from '@/components/Navigation';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletBalance {
  balance: number;
}

const Wallet = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const { toast } = useToast();

  // Form states
  const [receiverEmail, setReceiverEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await apiCall<WalletBalance>('/wallet/balance');
      if (response.data) {
        setBalance(response.data.balance);
      } else if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Balance fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet balance.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverEmail || !transferAmount) return;

    setOperationLoading(true);
    try {
      const response = await apiCall('/wallet/transfer', {
        method: 'POST',
        body: JSON.stringify({
          receiver_email: receiverEmail,
          amount: parseFloat(transferAmount),
        }),
      });

      if (response.error) {
        toast({
          title: "Transfer Failed",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transfer Successful",
          description: `Successfully sent $${transferAmount} to ${receiverEmail}`,
        });
        setReceiverEmail('');
        setTransferAmount('');
        fetchBalance();
      }
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Error",
        description: "Transfer failed.",
        variant: "destructive",
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount) return;

    setOperationLoading(true);
    try {
      const response = await apiCall('/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
        }),
      });

      if (response.error) {
        toast({
          title: "Deposit Failed",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Deposit Successful",
          description: `Successfully deposited $${depositAmount}`,
        });
        setDepositAmount('');
        fetchBalance();
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: "Error",
        description: "Deposit failed.",
        variant: "destructive",
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount) return;

    setOperationLoading(true);
    try {
      const response = await apiCall('/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
        }),
      });

      if (response.error) {
        toast({
          title: "Withdrawal Failed",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Withdrawal Successful",
          description: `Successfully withdrew $${withdrawAmount}`,
        });
        setWithdrawAmount('');
        fetchBalance();
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Error",
        description: "Withdrawal failed.",
        variant: "destructive",
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
          <p className="text-gray-600">Manage your digital wallet operations</p>
        </div>

        {/* Balance Card */}
        <div className="vault-card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Current Balance</p>
              <p className="text-4xl font-bold text-gray-900">{formatCurrency(balance)}</p>
            </div>
            <div className="w-16 h-16 bg-vault-100 rounded-2xl flex items-center justify-center">
              <WalletIcon className="h-8 w-8 text-vault-600" />
            </div>
          </div>
        </div>

        {/* Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Send Money */}
          <div className="vault-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Send Money</h2>
            </div>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receiver Email
                </label>
                <input
                  type="email"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  className="vault-input w-full"
                  placeholder="Enter recipient's email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="vault-input w-full"
                  placeholder="0.00"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={operationLoading}
                className="w-full vault-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading ? 'Processing...' : 'Send Money'}
              </button>
            </form>
          </div>

          {/* Deposit */}
          <div className="vault-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Deposit</h2>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="vault-input w-full"
                  placeholder="0.00"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={operationLoading}
                className="w-full vault-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading ? 'Processing...' : 'Deposit Funds'}
              </button>
            </form>
          </div>

          {/* Withdraw */}
          <div className="vault-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ArrowDownLeft className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Withdraw</h2>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="vault-input w-full"
                  placeholder="0.00"
                  required
                />
              </div>
              <p className="text-sm text-gray-600">
                Available: {formatCurrency(balance)}
              </p>
              <button
                type="submit"
                disabled={operationLoading}
                className="w-full vault-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading ? 'Processing...' : 'Withdraw Funds'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
