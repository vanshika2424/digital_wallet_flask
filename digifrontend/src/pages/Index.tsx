
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/utils/auth';

const Index = () => {
  // Redirect to dashboard if authenticated, otherwise to landing page
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />;
};

export default Index;
