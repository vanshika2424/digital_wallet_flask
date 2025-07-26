# DigiVault – Digital Wallet System

A secure, scalable, and intelligent digital wallet platform supporting seamless cash management, real-time fraud detection, role-based access control, and an analytics-driven admin dashboard — powered by a modern tech stack.

---
## Features

### User Features
- Secure registration and login with email verification
- Real-time wallet balance updates
- Transaction history with search and filtering
- Quick deposit and withdrawal operations
- Transfer funds to other users
- Dark/light theme support
- Responsive design for all devices

### Admin Features
- User management dashboard
- Transaction monitoring and analytics
- Fraud detection and alerts
- System statistics and reports
- Top users analytics
- Transaction volume tracking
- Soft delete and recovery

### Security Features
- JWT authentication & bcrypt password hashing
- Role-based access control
- Transaction monitoring with fraud scores
- Automatic daily fraud scans
- Real-time email alerts for:
  - Large transactions
  - High-frequency activity
  - Daily limit breaches
- Soft delete with audit trail

### Monitoring
- Application logs in app.log
- Daily fraud reports
- System statistics
- Transaction rollback on failures
- Rate limiting on endpoints


---

## Tech Stack

- **Backend**: Flask with PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **UI**: Shadcn UI + Tailwind CSS
- **Authentication**: JWT
- **State Management**: React Query

## Project Structure

```
digital_wallet_flask/
├── app.py              # Main Flask application
├── config.py           # Configuration settings
├── models/             # Database models
├── routes/             # API routes
├── services/           # Business logic services
├── static/             # Static files
├── templates/          # HTML templates
├── digifrontend/       # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/      # Frontend pages
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Utility functions
│   ├── public/        # Static assets
│   └── vite.config.ts # Vite configuration
└── requirements.txt    # Python dependencies
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
---
## Setup Instructions

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/digital-wallet.git
cd digital-wallet
```

2. Backend Setup:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
mv .env.example .env
# Edit .env with your configuration

# Initialize database
python init_db.py
```

3. Frontend Setup:
```bash
cd digifrontend
npm install
```

4. Run both servers:
```bash
# In one terminal (backend)
python run_server.py

# In another terminal (frontend)
cd digifrontend
npm run dev
```

### Environment Variables

```bash
# Flask Configuration
FLASK_APP=run_server.py
FLASK_ENV=development
FLASK_DEBUG=true

# Database Configuration
DATABASE_URL=sqlite:///digital_wallet.db  # For local development
# DATABASE_URL=postgresql://user:password@host:port/dbname  # For production

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES=3600

# CORS Configuration
CORS_ORIGINS=http://localhost:5173  # Frontend development server

# Other Configuration
SECRET_KEY=your-secret-key-here
```







