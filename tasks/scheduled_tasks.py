from datetime import datetime, timedelta
from flask import current_app
from models import db
from models.transaction import Transaction
from models.user import User
from models.wallet import Wallet
from sqlalchemy import func
import logging

logger = logging.getLogger(__name__)

def scan_for_fraud():
    """Daily fraud scan job"""
    try:
        # Get transactions from the last 24 hours
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_transactions = Transaction.query.filter(
            Transaction.created_at >= yesterday
        ).all()

        # Scan for patterns
        suspicious_count = 0
        for transaction in recent_transactions:
            # Get user's transactions in last hour
            one_hour_ago = transaction.created_at - timedelta(hours=1)
            user_transactions = Transaction.query.filter(
                Transaction.wallet_id == transaction.wallet_id,
                Transaction.created_at >= one_hour_ago,
                Transaction.created_at <= transaction.created_at
            ).all()

            # Check patterns
            if len(user_transactions) > 10:  # High frequency
                transaction.is_suspicious = True
                transaction.fraud_score = 0.7
                suspicious_count += 1
                send_alert_email(transaction, "High frequency transactions detected")

            if transaction.amount > 10000:  # Large amount
                transaction.is_suspicious = True
                transaction.fraud_score = 0.8
                suspicious_count += 1
                send_alert_email(transaction, "Large transaction amount detected")

        db.session.commit()
        
        # Generate daily report
        generate_daily_report()
        
        logger.info(f"Daily fraud scan completed. Found {suspicious_count} suspicious transactions.")
    except Exception as e:
        logger.error(f"Error in daily fraud scan: {str(e)}")

def generate_daily_report():
    """Generate daily transaction and fraud report"""
    try:
        yesterday = datetime.utcnow() - timedelta(days=1)
        
        # Get daily stats
        stats = db.session.query(
            func.count(Transaction.id).label('total_transactions'),
            func.sum(Transaction.amount).label('total_volume'),
            func.count(Transaction.id).filter(Transaction.is_suspicious == True).label('suspicious_count')
        ).filter(
            Transaction.created_at >= yesterday
        ).first()
        
        report = f"""
Daily Transaction Report ({yesterday.strftime('%Y-%m-%d')})
----------------------------------------
Total Transactions: {stats.total_transactions}
Total Volume: ${stats.total_volume or 0:,.2f}
Suspicious Transactions: {stats.suspicious_count}
"""
        
        # Send report email
        send_report_email("Daily Transaction Report", report)
        
        logger.info("Daily report generated and sent successfully")
    except Exception as e:
        logger.error(f"Error generating daily report: {str(e)}")

def send_alert_email(transaction, reason):
    """Mock function to send alert emails"""
    wallet = Wallet.query.get(transaction.wallet_id)
    user = User.query.get(wallet.user_id)
    
    message = f"""
ALERT: Suspicious Transaction Detected
------------------------------------
User: {user.email}
Amount: ${transaction.amount:,.2f}
Type: {transaction.transaction_type}
Reason: {reason}
Time: {transaction.created_at}
Transaction ID: {transaction.id}
"""
    logger.info(f"[MOCK] Alert email sent:\n{message}")

def send_report_email(subject, body):
    """Mock function to send report emails"""
    logger.info(f"[MOCK] Report email sent:\nSubject: {subject}\n{body}")
