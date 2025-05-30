from datetime import datetime, timedelta
import logging
from models import db
from models.transaction import Transaction
from models.user import User
from models.wallet import Wallet
from services.email_service import send_transaction_alert, send_fraud_report

logger = logging.getLogger(__name__)

def calculate_fraud_score(transaction):
    """
    Calculate a fraud score for a transaction based on various factors.
    Returns a score between 0 and 1, where higher scores indicate more suspicious activity.
    """
    score = 0.0
    
    # Factor 1: Large transaction amounts (> $10,000)
    if transaction.amount > 10000:
        score += 0.4
    elif transaction.amount > 5000:
        score += 0.2
    
    # Factor 2: Unusual transaction timing (between 11 PM and 5 AM)
    hour = transaction.created_at.hour
    if hour >= 23 or hour < 5:
        score += 0.3
    
    # Factor 3: Multiple large transactions in a short time
    recent_large_txs = Transaction.query.filter(
        Transaction.wallet_id == transaction.wallet_id,
        Transaction.amount > 1000,
        Transaction.created_at >= (transaction.created_at - timedelta(hours=24)),
        Transaction.id != transaction.id
    ).count()
    
    if recent_large_txs >= 3:
        score += 0.3
    elif recent_large_txs >= 1:
        score += 0.1
    
    return min(score, 1.0)

def check_transaction_for_fraud(transaction):
    """
    Check a single transaction for potential fraud and update its fraud score.
    Returns True if the transaction is suspicious.
    """
    logger.info(f"Checking transaction {transaction.id} for fraud (amount: {transaction.amount} {transaction.currency})")
    fraud_score = calculate_fraud_score(transaction)
    transaction.fraud_score = fraud_score
    
    # Mark as suspicious if fraud score is above threshold
    is_suspicious = fraud_score > 0.7
    transaction.is_suspicious = is_suspicious
    
    # Send email alert for suspicious or large transactions
    if is_suspicious or transaction.amount > 5000:
        wallet = Wallet.query.get(transaction.wallet_id)
        if wallet and wallet.user:
            logger.info(f"Sending transaction alert to {wallet.user.email} for transaction {transaction.id}")
            send_transaction_alert(
                wallet.user.email,
                transaction.transaction_type,
                transaction.amount,
                transaction.currency,
                fraud_score
            )
            logger.info(f"Transaction alert sent successfully")
    
    db.session.commit()
    return is_suspicious
    if fraud_score > 0.7:
        transaction.is_suspicious = True
        
        # Send email alert for suspicious transaction
        user = User.query.get(transaction.wallet.user_id)
        if user:
            send_transaction_alert(
                user.email,
                transaction.transaction_type,
                transaction.amount,
                transaction.currency,
                fraud_score
            )
    
    db.session.commit()
    return transaction.is_suspicious

def daily_fraud_scan():
    """
    Perform a daily scan of recent transactions for potential fraud.
    This is scheduled to run once per day.
    """
    logger.info("Starting daily fraud scan...")
    
    # Get transactions from the last 24 hours
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_transactions = Transaction.query.filter(
        Transaction.created_at >= yesterday,
        Transaction.is_active == True
    ).all()
    
    suspicious_count = 0
    for transaction in recent_transactions:
        if check_transaction_for_fraud(transaction):
            suspicious_count += 1
    
    # Send daily report to admin
    suspicious_transactions = Transaction.query.filter(
        Transaction.created_at >= yesterday,
        Transaction.is_suspicious == True,
        Transaction.is_active == True
    ).all()
    
    admin_users = User.query.filter_by(is_admin=True).all()
    for admin in admin_users:
        send_fraud_report(admin.email, suspicious_transactions)
    
    logger.info(f"Daily fraud scan completed. Found {suspicious_count} suspicious transactions.")
    return suspicious_count
    """
    Perform a daily scan of recent transactions for potential fraud.
    This is scheduled to run once per day.
    """
    logger.info("Starting daily fraud scan...")
    yesterday = datetime.utcnow() - timedelta(days=1)
    
    # Find users with high transaction frequency
    high_frequency_users = db.session.query(
        User,
        func.count(Transaction.id).label('transaction_count')
    ).join(Wallet).join(
        Transaction,
        (Wallet.id == Transaction.sender_wallet_id)
    ).filter(
        Transaction.created_at >= yesterday
    ).group_by(User.id).having(
        func.count(Transaction.id) >= 20
    ).all()
    
    # Find large transactions
    large_transactions = Transaction.query.filter(
        Transaction.created_at >= yesterday,
        Transaction.amount >= 10000
    ).all()
    
    # Find users with sudden balance changes
    suspicious_balance_changes = db.session.query(
        User,
        func.sum(Transaction.amount).label('total_amount')
    ).join(Wallet).join(
        Transaction,
        (Wallet.id == Transaction.sender_wallet_id)
    ).filter(
        Transaction.created_at >= yesterday
    ).group_by(User.id).having(
        func.sum(Transaction.amount) >= 50000
    ).all()
    
    # Update fraud scores and flags
    for transaction in large_transactions:
        transaction.is_suspicious = True
        transaction.fraud_score = max(transaction.fraud_score, 0.7)
        transaction.notes = (transaction.notes or '') + ' | Flagged by daily scan: Large transaction'
    
    for user, count in high_frequency_users:
        transactions = Transaction.query.join(Wallet).filter(
            Wallet.user_id == user.id,
            Transaction.created_at >= yesterday
        ).all()
        for transaction in transactions:
            transaction.is_suspicious = True
            transaction.fraud_score = max(transaction.fraud_score, 0.5)
            transaction.notes = (transaction.notes or '') + ' | Flagged by daily scan: High frequency'
    
    for user, amount in suspicious_balance_changes:
        transactions = Transaction.query.join(Wallet).filter(
            Wallet.user_id == user.id,
            Transaction.created_at >= yesterday
        ).all()
        for transaction in transactions:
            transaction.is_suspicious = True
            transaction.fraud_score = max(transaction.fraud_score, 0.6)
            transaction.notes = (transaction.notes or '') + ' | Flagged by daily scan: Large volume'
    
    db.session.commit()
    
    # Here you would typically send email notifications to admins
    # For this implementation, we'll just print to console
    print(f"Daily Fraud Scan Report - {datetime.utcnow()}")
    print(f"High Frequency Users: {len(high_frequency_users)}")
    print(f"Large Transactions: {len(large_transactions)}")
    print(f"Suspicious Balance Changes: {len(suspicious_balance_changes)}")
