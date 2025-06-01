#  Digital Wallet System with Cash Management and Fraud Detection

A secure, Flask-based backend system for digital wallet operations. Supports user registration, wallet transactions, fraud detection, admin analytics, and bonus features like email alerts and soft deletes.

---
## Demo Video

Here is the demo video showcasing the features of the Digital Wallet system:  
https://drive.google.com/file/d/1Sla0l1vITRhp63QGeJiibZZneGl6qHrG/view?usp=sharing

##  Features

### 1.  User Authentication & Session Management
- User registration and login
- Secure password hashing using **bcrypt**
- JWT-based session authentication
- Auth middleware to protect endpoints

### 2.  Wallet Operations
- Deposit, withdraw, and transfer funds
- Per-user transaction history
- Soft delete for users and transactions

### 3.  Transaction Processing & Validation
- Fully atomic operations (credit/debit together)
- Validations:
  - No overdrafts
  - No negative or invalid amounts

### 4.  Basic Fraud Detection Logic
- Detects:
  - Large transactions (>$10,000)
  - High-frequency transfers (>10/hour)
  - Daily total limit breaches (>$50,000)
- Logs and flags suspicious patterns

### 5.  Admin & Reporting APIs
- View flagged transactions
- Aggregate user balances
- View system stats
- Soft-delete & view deleted users/transactions

---

##  Bonus Features

- Scheduled daily fraud scan
- Soft delete with audit trail
- Mocked email alerts for suspicious activity

---

## Tech Stack

- **Framework**: Python Flask
- **Authentication**: JWT + bcrypt
- **Database**: SQLite (configurable)
- **Docs**: Swagger at `/api/docs`
- **Testing**: Postman, cURL, Python `requests`, PowerShell

## API Reference

### User Endpoints
```http
POST   /api/auth/register     # Register new user
POST   /api/auth/login        # Login and get token
GET    /api/wallet/balance    # Get wallet balance
POST   /api/wallet/deposit    # Make deposit
POST   /api/wallet/withdraw   # Make withdrawal
POST   /api/wallet/transfer   # Transfer funds
GET    /api/wallet/transactions # Get transaction history
```

### Admin Endpoints
```http
GET    /api/admin/suspicious-transactions  # View suspicious activity
GET    /api/admin/user-balances    # View all balances
GET    /api/admin/system-stats     # System statistics
DELETE /api/admin/users/{id}/delete      # Soft delete user
DELETE /api/admin/transactions/{id}/delete # Soft delete transaction
GET    /api/admin/users/deleted    # View deleted users
GET    /api/admin/transactions/deleted    # View deleted transactions
```



### Alternative Testing Methods

1. Using PowerShell:
```powershell
$response = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method Post -Headers @{ "Content-Type" = "application/json" } -Body '{"email":"admin@example.com","password":"admin123"}'
$token = $response.access_token
Invoke-RestMethod -Uri http://localhost:5000/api/wallet/balance -Method Get -Headers @{ "Authorization" = "Bearer $token" }
```

2. Using Python requests:
```python
import requests

# Login
response = requests.post(
    'http://localhost:5000/api/auth/login',
    json={'email': 'admin@example.com', 'password': 'admin123'}
)
token = response.json()['access_token']

# Check balance
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:5000/api/wallet/balance', headers=headers)
print(response.json())
```



## Testing with PowerShell

### 1. Authentication
```powershell
# Register new user
$body = @{
    email = "user@example.com"
    password = "password123"
    first_name = "John"
    last_name = "Doe"
} | ConvertTo-Json

$headers = @{ 'Content-Type' = 'application/json' }
Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' -Method Post -Headers $headers -Body $body

# Login
$loginBody = @{
    email = "user@example.com"
    password = "password123"
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -Headers $headers -Body $loginBody
$token = $response.access_token
$authHeaders = @{
    'Authorization' = "Bearer $token"
    'Content-Type' = 'application/json'
}
```

### 2. Wallet Operations
```powershell
# Check balance
Invoke-RestMethod -Uri 'http://localhost:5000/api/wallet/balance' -Method Get -Headers $authHeaders

# Make deposit
$body = @{ amount = 1000 } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/wallet/deposit' -Method Post -Headers $authHeaders -Body $body

# Make withdrawal
$body = @{ amount = 500 } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/wallet/withdraw' -Method Post -Headers $authHeaders -Body $body

# Make transfer
$body = @{
    receiver_id = 2
    amount = 300
} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/wallet/transfer' -Method Post -Headers $authHeaders -Body $body

# View transaction history
Invoke-RestMethod -Uri 'http://localhost:5000/api/wallet/transactions' -Method Get -Headers $authHeaders
```

### 3. Admin Operations
```powershell
# Get admin token
$adminBody = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -Headers $headers -Body $adminBody
$adminToken = $response.access_token
$adminHeaders = @{
    'Authorization' = "Bearer $adminToken"
    'Content-Type' = 'application/json'
}

# View suspicious transactions
Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/suspicious-transactions' -Method Get -Headers $adminHeaders

# View user balances
Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/user-balances' -Method Get -Headers $adminHeaders

# View system statistics
Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/system-stats' -Method Get -Headers $adminHeaders

# View top users by balance
Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/top-users/balance?limit=5' -Method Get -Headers $adminHeaders

# View top users by volume
Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/top-users/volume?days=30' -Method Get -Headers $adminHeaders
```

### 4. Soft Delete Operations
```powershell
# Soft delete user
$userId = 1  # Replace with actual user ID
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users/$userId/delete" -Method Delete -Headers $adminHeaders

# View deleted users
Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/users/deleted' -Method Get -Headers $adminHeaders

# Soft delete transaction
$transactionId = 1  # Replace with actual transaction ID
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/transactions/$transactionId/delete" -Method Delete -Headers $adminHeaders

# View deleted transactions
Invoke-RestMethod -Uri 'http://localhost:5000/api/admin/transactions/deleted' -Method Get -Headers $adminHeaders
```

### 5. Trigger Alert Scenarios
```powershell
# Trigger large transaction alert
$body = @{ amount = 15000 } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/wallet/deposit' -Method Post -Headers $authHeaders -Body $body

# Trigger high-frequency transfers alert
1..11 | ForEach-Object {
    $body = @{
        receiver_id = 2
        amount = 100
    } | ConvertTo-Json
    Invoke-RestMethod -Uri 'http://localhost:5000/api/wallet/transfer' -Method Post -Headers $authHeaders -Body $body
    Start-Sleep -Seconds 1
}
```


## Fraud Detection

The system includes several fraud detection mechanisms:

1. **Real-time Transaction Monitoring**:
   - Large transactions (>$10,000)
   - High frequency of transactions
   - Unusual transaction timing

2. **Daily Fraud Scans**:
   - Runs automatically at midnight
   - Checks for suspicious patterns
   - Generates reports for administrators

3. **Email Alerts**:
   - Alerts for suspicious transactions
   - Daily fraud reports
   - User notifications for large transactions

## Security Features

1. **Password Security**:
   - Passwords are hashed using Bcrypt
   - Secure password reset functionality

2. **JWT Authentication**:
   - Token-based authentication
   - Token expiration and refresh

3. **Soft Delete**:
   - No permanent deletion of records
   - Maintains audit trail
   - Recovery possible

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Development

1. Run tests:
```bash
python -m pytest tests/
```

2. Check code style:
```bash
flake8 .
```

3. Generate API documentation:
```bash
python generate_swagger.py
```

## Default Admin Account

The system comes with a default admin account:
- Email: admin@example.com
- Password: admin123

**Note**: Change these credentials in production.

## License

MIT License

A secure digital wallet system built with Flask that supports user authentication, wallet operations, fraud detection, and administrative features.

## Features

- User Authentication & Session Management
- Wallet Operations (deposits, withdrawals, transfers)
- Transaction Processing & Validation
- Basic Fraud Detection
- Admin & Reporting APIs
- Scheduled Jobs for Fraud Detection
- Email Alerts for Suspicious Activities

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables in .env file:
```
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///digital_wallet.db
JWT_SECRET_KEY=your_jwt_secret
```

4. Initialize the database:
```bash
python init_db.py
```

5. Run the application:
```bash
python app.py
```

## Testing & Security

### Fraud Detection Testing
```bash
# Large transaction alert
curl -X POST http://localhost:5000/api/wallet/deposit \
     -H "Authorization: Bearer <token>" \
     -d '{"amount": 15000}'

# High-frequency alert
# Make 11 transfers within an hour
```

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

Access the Swagger documentation at `/api/docs` when the application is running.








