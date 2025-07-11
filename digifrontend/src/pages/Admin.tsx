
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { apiCall, getProfile, logout } from '@/utils/auth';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  CreditCard, 
  Shield, 
  TrendingUp, 
  Sun, 
  Moon, 
  Scan,
  ChevronDown,
  Trash2,
  Eye,
  UserCheck,
  Activity,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SystemStats {
  user_stats: {
    total_users: number;
    active_users_last_24h: number;
  };
  transaction_stats: {
    total_transactions: number;
    total_volume: number;
    suspicious_transactions: number;
    average_amount: number;
  };
  system_balance: number;
}

interface UserBalance {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  balance: number;
  currency: string;
}

interface TopUserBalance {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  balance: number;
  currency: string;
}

interface TopUserVolume {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  total_volume: number;
}

interface DeletedUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface SuspiciousTransaction {
  id: number;
  wallet_id: number;
  amount: number;
  transaction_type: string;
  created_at: string;
  fraud_score: number;
  status: string;
}

interface FraudScanResult {
  transactions_scanned?: number;
  suspicious_found?: number;
  new_suspicious?: number;
  scan_duration?: number;
  timestamp?: string;
  message?: string;
}

interface Transaction {
  id: number;
  wallet_id: number;
  receiver_wallet_id?: number;
  amount: number;
  transaction_type: string;
  status: string;
  created_at: string;
  is_suspicious?: boolean;
  fraud_score?: number;
  sender_name?: string;
  receiver_name?: string;
}

type AdminView = 'overview' | 'all-users' | 'deleted-users' | 'top-users' | 'suspicious-transactions' | 'manual-fraud-scan' | 'analytics' | 'transactions';

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Data states
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [userBalances, setUserBalances] = useState<UserBalance[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [topUsersByBalance, setTopUsersByBalance] = useState<TopUserBalance[]>([]);
  const [topUsersByVolume, setTopUsersByVolume] = useState<TopUserVolume[]>([]);
  const [suspiciousTransactions, setSuspiciousTransactions] = useState<SuspiciousTransaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scanResult, setScanResult] = useState<FraudScanResult | null>(null);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'suspicious'>('all');

  const { toast } = useToast();

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    try {
      const response = await getProfile();
      if (response.data) {
        setUser(response.data);
        if (!response.data.is_admin) {
          return;
        }
        await fetchAdminData();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      console.log('Fetching admin stats...');
      const statsRes = await apiCall<SystemStats>('/admin/stats');
      if (statsRes.data) {
        console.log('Stats data received:', statsRes.data);
        setStats(statsRes.data);
      } else {
        console.error('Stats error:', statsRes.error);
        toast({
          title: "Error",
          description: statsRes.error || "Failed to fetch system stats.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Admin data fetch error:', error);
    }
  };

  const fetchUserBalances = async () => {
    setActionLoading(true);
    try {
      console.log('Fetching user balances...');
      const response = await apiCall<{user_balances: UserBalance[], total_system_balance: number}>('/admin/balances');
      console.log('User balances response:', response);
      
      if (response.data) {
        setUserBalances(response.data.user_balances || []);
      } else {
        console.error('User balances fetch error:', response.error);
        toast({
          title: "Error",
          description: response.error || "Failed to fetch user balances.",
          variant: "destructive",
        });
        setUserBalances([]);
      }
    } catch (error) {
      console.error('User balances fetch exception:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user balances.",
        variant: "destructive",
      });
      setUserBalances([]);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchDeletedUsers = async () => {
    setActionLoading(true);
    try {
      console.log('Fetching deleted users...');
      const response = await apiCall<{deleted_users: DeletedUser[]}>('/admin/users/deleted');
      console.log('Deleted users response:', response);
      
      if (response.data) {
        setDeletedUsers(response.data.deleted_users || []);
      } else {
        console.error('Deleted users fetch error:', response.error);
        toast({
          title: "Error",
          description: response.error || "Failed to fetch deleted users.",
          variant: "destructive",
        });
        setDeletedUsers([]);
      }
    } catch (error) {
      console.error('Deleted users fetch exception:', error);
      toast({
        title: "Error",
        description: "Failed to fetch deleted users.",
        variant: "destructive",
      });
      setDeletedUsers([]);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchTopUsers = async () => {
    setActionLoading(true);
    try {
      console.log('Fetching top users...');
      const [balanceRes, volumeRes] = await Promise.all([
        apiCall<{top_users_by_balance: TopUserBalance[]}>('/admin/top-users/balance?limit=5'),
        apiCall<{top_users_by_volume: TopUserVolume[]}>('/admin/top-users/volume?limit=5&days=7')
      ]);
      
      console.log('Top users by balance response:', balanceRes);
      console.log('Top users by volume response:', volumeRes);
      
      if (balanceRes.data) {
        setTopUsersByBalance(balanceRes.data.top_users_by_balance || []);
      } else {
        setTopUsersByBalance([]);
        toast({
          title: "Error",
          description: balanceRes.error || "Failed to fetch top users by balance.",
          variant: "destructive",
        });
      }
      
      if (volumeRes.data) {
        setTopUsersByVolume(volumeRes.data.top_users_by_volume || []);
      } else {
        setTopUsersByVolume([]);
        toast({
          title: "Error",
          description: volumeRes.error || "Failed to fetch top users by volume.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Top users fetch exception:', error);
      toast({
        title: "Error",
        description: "Failed to fetch top users.",
        variant: "destructive",
      });
      setTopUsersByBalance([]);
      setTopUsersByVolume([]);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchSuspiciousTransactions = async () => {
    setActionLoading(true);
    try {
      console.log('Fetching suspicious transactions...');
      const response = await apiCall<{suspicious_transactions: SuspiciousTransaction[]}>('/admin/suspicious-transactions');
      console.log('Suspicious transactions response:', response);
      
      if (response.data) {
        setSuspiciousTransactions(response.data.suspicious_transactions || []);
      } else {
        console.error('Suspicious transactions fetch error:', response.error);
        toast({
          title: "Error",
          description: response.error || "Failed to fetch suspicious transactions.",
          variant: "destructive",
        });
        setSuspiciousTransactions([]);
      }
    } catch (error) {
      console.error('Suspicious transactions fetch exception:', error);
      toast({
        title: "Error",
        description: "Failed to fetch suspicious transactions.",
        variant: "destructive",
      });
      setSuspiciousTransactions([]);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setActionLoading(true);
    try {
      console.log('Fetching transactions...');
      const response = await apiCall<{transactions: Transaction[]}>('/wallet/transactions');
      console.log('Transactions response:', response);
      
      if (response.data) {
        setTransactions(response.data.transactions || []);
      } else {
        console.error('Transactions fetch error:', response.error);
        toast({
          title: "Error",
          description: response.error || "Failed to fetch transactions.",
          variant: "destructive",
        });
        setTransactions([]);
      }
    } catch (error) {
      console.error('Transactions fetch exception:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions.",
        variant: "destructive",
      });
      setTransactions([]);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSoftDeleteUser = async (userId: number) => {
    try {
      console.log('Deleting user:', userId);
      const response = await apiCall(`/admin/users/${userId}/soft-delete`, { method: 'DELETE' });
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "User deleted successfully.",
        });
        fetchUserBalances();
      }
    } catch (error) {
      console.error('User delete exception:', error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleFraudScan = async () => {
    setActionLoading(true);
    setScanResult(null);
    try {
      console.log('Running fraud scan...');
      const response = await apiCall<FraudScanResult>('/admin/scan/fraud', {
        method: 'POST',
      });

      if (response.error) {
        toast({
          title: "Scan Failed",
          description: response.error,
          variant: "destructive",
        });
      } else if (response.data) {
        setScanResult(response.data);
        const newFrauds = response.data.new_suspicious || 0;
        toast({
          title: "Fraud Scan Complete",
          description: `✅ Scan completed: ${newFrauds} new frauds detected`,
        });
        fetchAdminData();
      }
    } catch (error) {
      console.error('Fraud scan error:', error);
      toast({
        title: "Error",
        description: "Failed to run fraud scan.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewChange = (view: AdminView) => {
    console.log('Changing view to:', view);
    setCurrentView(view);
    switch (view) {
      case 'all-users':
        fetchUserBalances();
        break;
      case 'deleted-users':
        fetchDeletedUsers();
        break;
      case 'top-users':
        fetchTopUsers();
        break;
      case 'suspicious-transactions':
        fetchSuspiciousTransactions();
        break;
      case 'transactions':
        fetchTransactions();
        break;
      case 'overview':
      case 'analytics':
        fetchAdminData();
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.user_stats.total_users || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.transaction_stats.total_transactions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.transaction_stats.total_volume || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Transactions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.transaction_stats.suspicious_transactions || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
      </CardHeader>
      <CardContent>
        {actionLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userBalances.length > 0 ? (
                userBalances.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatCurrency(user.balance || 0)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleSoftDeleteUser(user.user_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const renderDeletedUsers = () => (
    <Card>
      <CardHeader>
        <CardTitle>Deleted Users</CardTitle>
      </CardHeader>
      <CardContent>
        {actionLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Deleted Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletedUsers.length > 0 ? (
                deletedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No deleted users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const renderTopUsers = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUsersByBalance.length > 0 ? (
                topUsersByBalance.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                    <TableCell>{formatCurrency(user.balance || 0)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Users by Volume (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUsersByVolume.length > 0 ? (
                topUsersByVolume.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                    <TableCell>{formatCurrency(user.total_volume || 0)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderSuspiciousTransactions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Suspicious Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {actionLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fraud Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suspiciousTransactions.length > 0 ? (
                suspiciousTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{transaction.transaction_type || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{transaction.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{transaction.fraud_score || 'N/A'}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No suspicious transactions found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  const renderManualFraudScan = () => (
    <Card>
      <CardHeader>
        <CardTitle>Manual Fraud Scan</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        <p className="text-gray-600">Run a comprehensive fraud detection scan across all transactions</p>
        
        <Button
          onClick={handleFraudScan}
          disabled={actionLoading}
          className="flex items-center space-x-2"
        >
          {actionLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Scan className="h-5 w-5" />
          )}
          <span>{actionLoading ? 'Scanning...' : 'Run Full Fraud Scan'}</span>
        </Button>

        {scanResult && (
          <Alert className="border-green-200 bg-green-50 text-left">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 space-y-2">
              <div className="font-medium">✅ Fraud Scan Results:</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>📊 Transactions scanned: <strong>{scanResult.transactions_scanned || 0}</strong></div>
                <div>⚠️ Suspicious found: <strong>{scanResult.suspicious_found || 0}</strong></div>
                <div>🔴 New suspicious: <strong>{scanResult.new_suspicious || 0}</strong></div>
                <div>⏱️ Scan duration: <strong>{scanResult.scan_duration || 0}s</strong></div>
              </div>
              {scanResult.timestamp && (
                <div className="text-xs text-green-700 mt-2">
                  Last scan: {new Date(scanResult.timestamp).toLocaleString()}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.user_stats.total_users || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.user_stats.active_users_last_24h || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.transaction_stats.total_transactions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.transaction_stats.total_volume || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.transaction_stats.average_amount || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Transactions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.transaction_stats.suspicious_transactions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.system_balance || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Transaction Overview</h4>
              <p className="text-sm text-muted-foreground">
                Fraud Rate: {stats ? ((stats.transaction_stats.suspicious_transactions / stats.transaction_stats.total_transactions) * 100).toFixed(2) : 0}%
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">System Health</h4>
              <p className="text-sm text-muted-foreground">
                Average per transaction: {formatCurrency(stats?.transaction_stats.average_amount || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTransactions = () => {
    const filteredTransactions = transactionFilter === 'suspicious' 
      ? suspiciousTransactions.map(st => ({
          id: st.id,
          wallet_id: st.wallet_id,
          receiver_wallet_id: undefined,
          amount: st.amount,
          transaction_type: st.transaction_type,
          status: st.status,
          created_at: st.created_at,
          is_suspicious: true,
          fraud_score: st.fraud_score
        }))
      : transactions;

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Transactions</CardTitle>
            <Select value={transactionFilter} onValueChange={(value: 'all' | 'suspicious') => {
              setTransactionFilter(value);
              if (value === 'suspicious') {
                fetchSuspiciousTransactions();
              } else {
                fetchTransactions();
              }
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">🔘 All Transactions</SelectItem>
                <SelectItem value="suspicious">🔘 Suspicious Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {actionLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  {transactionFilter === 'suspicious' && <TableHead>Fraud Score</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      <TableCell>Wallet {transaction.wallet_id}</TableCell>
                      <TableCell>
                        {transaction.receiver_wallet_id ? `Wallet ${transaction.receiver_wallet_id}` : 'N/A'}
                      </TableCell>
                      <TableCell className="capitalize">{transaction.transaction_type}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'destructive'}>
                          {transaction.status}
                        </Badge>
                        {transaction.is_suspicious && (
                          <Badge variant="destructive" className="ml-2">Suspicious</Badge>
                        )}
                      </TableCell>
                      {transactionFilter === 'suspicious' && (
                        <TableCell>
                          <Badge variant="destructive">{transaction.fraud_score || 'N/A'}</Badge>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={transactionFilter === 'suspicious' ? 7 : 6} className="text-center">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return renderOverview();
      case 'all-users':
        return renderUsers();
      case 'deleted-users':
        return renderDeletedUsers();
      case 'top-users':
        return renderTopUsers();
      case 'suspicious-transactions':
        return renderSuspiciousTransactions();
      case 'manual-fraud-scan':
        return renderManualFraudScan();
      case 'analytics':
        return renderAnalytics();
      case 'transactions':
        return renderTransactions();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">DigiVault Admin</h1>
              
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  variant={currentView === 'overview' ? 'default' : 'ghost'}
                  onClick={() => handleViewChange('overview')}
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Overview</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleViewChange('all-users')}>
                      All Users
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewChange('deleted-users')}>
                      Deleted Users
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewChange('top-users')}>
                      Top Users
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Transactions</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleViewChange('transactions')}>
                      All Transactions
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewChange('suspicious-transactions')}>
                      Suspicious Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Fraud</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleViewChange('manual-fraud-scan')}>
                      Manual Fraud Scan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Analytics</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleViewChange('analytics')}>
                      View Analytics
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="destructive"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;
