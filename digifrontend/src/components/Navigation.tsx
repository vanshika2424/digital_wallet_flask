
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout, getProfile } from '@/utils/auth';
import { User } from '@/utils/auth';
import { useEffect } from 'react';
import { 
  Wallet, 
  Home, 
  User as UserIcon, 
  Users, 
  CreditCard, 
  Shield, 
  TrendingUp,
  Settings 
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await getProfile();
      if (response.data) {
        setUser(response.data);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  // Define different navigation items for admin vs regular users
  const adminNavItems = [
    { path: '/admin', label: 'Admin Overview', icon: Home },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/admin/fraud', label: 'Fraud', icon: Shield },
    { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  const regularNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/transactions', label: 'Transactions', icon: null },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  // Use admin navigation if user is admin, otherwise use regular navigation
  const navItems = user?.is_admin ? adminNavItems : regularNavItems;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user?.is_admin ? "/admin" : "/dashboard"} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-vault-600 rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                {user?.is_admin ? 'DigiVault Admin' : 'DigiVault'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-vault-50 text-vault-700 border border-vault-200'
                    : 'text-gray-600 hover:text-vault-600 hover:bg-vault-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-vault-50 text-vault-700'
                      : 'text-gray-600 hover:text-vault-600 hover:bg-vault-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
