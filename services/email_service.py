import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def send_transaction_alert(user_email, transaction_type, amount, currency, fraud_score=None):
    """
    Mock email service to send transaction alerts.
    In a production environment, this would use a real email service like SendGrid or AWS SES.
    """
    subject = f"Transaction Alert - {transaction_type}"
    message = (
        f"Dear User,\n\n"
        f"A {transaction_type} of {amount} {currency} has been processed on your account "
        f"at {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}.\n"
    )
    
    if fraud_score is not None and fraud_score > 0.7:
        message += f"\nWARNING: This transaction has been flagged as potentially suspicious (Fraud Score: {fraud_score}).\n"
    
    message += "\nIf you did not authorize this transaction, please contact support immediately.\n\nBest regards,\nDigital Wallet Team"
    
    # Log the email for demonstration purposes
    log_message = f"""

MOCK EMAIL SENT
{'='*50}
To: {user_email}
Subject: {subject}
Message:
{message}
{'='*50}
"""
    logger.info(log_message)
    return True

def send_fraud_report(admin_email, suspicious_transactions):
    """
    Mock email service to send daily fraud reports to administrators.
    """
    subject = f"Daily Fraud Report - {datetime.utcnow().strftime('%Y-%m-%d')}"
    
    if not suspicious_transactions:
        message = "No suspicious transactions were detected in the last 24 hours."
    else:
        message = "The following suspicious transactions were detected in the last 24 hours:\n\n"
        for tx in suspicious_transactions:
            message += (
                f"Transaction ID: {tx.id}\n"
                f"Amount: {tx.amount} {tx.currency}\n"
                f"Type: {tx.transaction_type}\n"
                f"Fraud Score: {tx.fraud_score}\n"
                f"Created At: {tx.created_at}\n"
                f"{'='*30}\n"
            )
    
    # Log the email for demonstration purposes
    log_message = f"""
MOCK ADMIN EMAIL SENT
{'='*50}
To: {admin_email}
Subject: {subject}
Message:
{message}
{'='*50}"""
    logger.info(log_message)
    return True
