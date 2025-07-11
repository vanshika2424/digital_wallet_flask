import { Link } from 'react-router-dom';
import { Wallet, Shield, Send, BarChart, Lock, CheckCircle, TrendingUp } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-vault-50/30">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-vault-200/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-vault-600 to-vault-700 rounded-lg flex items-center justify-center shadow-lg animate-glow">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-vault-700 bg-clip-text text-transparent">DigiVault</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-600 hover:text-vault-700 px-4 py-2 font-medium transition-all duration-200 hover:bg-vault-50 rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-gradient-to-r from-vault-600 to-vault-700 hover:from-vault-700 hover:to-vault-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center relative">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-vault-200/30 rounded-full blur-xl animate-float"></div>
            <div className="absolute top-40 right-20 w-32 h-32 bg-vault-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-slate-900/10 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-vault-500 to-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-glow">
              <Wallet className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Your Digital Wallet, <br />
              <span className="bg-gradient-to-r from-vault-600 via-slate-800 to-vault-700 bg-clip-text text-transparent animate-pulse-vault">
                Simplified
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the future of digital payments with DigiVault. Send, receive, and manage your money with bank-level security and lightning-fast transactions.
            </p>

            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-8 mb-12 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-vault-600" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-vault-600" />
                <span>High Availability</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-vault-600" />
                <span>End-to-End Encryption</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <Link
                to="/register"
                className="px-10 py-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 group"
              >
                Start Your Journey 
                <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
              </Link>
              <Link
                to="/login"
                className="px-10 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-900 font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Powerful Features Built for You
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to manage your digital finances efficiently, securely, and intelligently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <div className="group vault-card hover:scale-105 transition-all duration-300 border-l-4 border-slate-900">
              <div className="w-16 h-16 bg-gradient-to-br from-vault-500 to-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Send className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Instant Transfers</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Send and receive money instantly with real-time processing and immediate notifications across all platforms.
              </p>
              <div className="flex items-center text-vault-600 font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Real-time processing</span>
              </div>
            </div>

            <div className="group vault-card hover:scale-105 transition-all duration-300 border-l-4 border-vault-600">
              <div className="w-16 h-16 bg-gradient-to-br from-vault-500 to-vault-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Smart Analytics</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Track spending patterns, financial health, and get AI-powered insights to optimize your money management.
              </p>
              <div className="flex items-center text-vault-600 font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>AI-powered insights</span>
              </div>
            </div>

            <div className="group vault-card hover:scale-105 transition-all duration-300 border-l-4 border-slate-900">
              <div className="w-16 h-16 bg-gradient-to-br from-vault-500 to-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Advanced Security</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Multi-layer security with biometric authentication, fraud detection, and end-to-end encryption.
              </p>
              <div className="flex items-center text-vault-600 font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>256-bit encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose DigiVault Section */}
        <div className="mt-32 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 text-white">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6">
              Why Choose DigiVault?
            </h2>
            <p className="text-xl text-slate-200 max-w-3xl mx-auto">
              Built for the modern world with cutting-edge technology and user-centric design principles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-vault-500 to-vault-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Bank-Grade Security</h3>
                <p className="text-slate-200 leading-relaxed">
                  Your data is protected with the same security standards used by major financial institutions, including 256-bit encryption and multi-factor authentication.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-vault-500 to-vault-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Enterprise Ready</h3>
                <p className="text-slate-200 leading-relaxed">
                  Built with enterprise-grade infrastructure to ensure reliability, scalability, and performance for all your financial needs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-vault-500 to-vault-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Real-Time Processing</h3>
                <p className="text-slate-200 leading-relaxed">
                  Experience lightning-fast transactions with real-time processing and instant confirmations for all your digital payments.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-vault-500 to-vault-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Simple & Intuitive</h3>
                <p className="text-slate-200 leading-relaxed">
                  Clean, user-friendly interface designed to make digital payments effortless, with smart assistance to guide your financial decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="vault-glass rounded-3xl p-12 max-w-4xl mx-auto border-2 border-slate-900/10">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Ready to Transform Your Financial Life?
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Experience the future of digital payments with DigiVault's secure and intelligent platform.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 group"
            >
              Get Started Today
              <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 mt-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-slate-800/80"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-vault-600 to-vault-700 rounded-lg flex items-center justify-center shadow-lg">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-vault-200 bg-clip-text text-transparent">DigiVault</span>
            </div>
            <p className="text-slate-300 mb-4">
              Empowering financial freedom through innovative digital solutions.
            </p>
            <p className="text-slate-400 text-sm">
              © 2024 DigiVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
