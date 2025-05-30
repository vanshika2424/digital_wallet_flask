from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from models.user import User
from models import db
from models.transaction import Transaction
from models.wallet import Wallet
from services.email_service import send_transaction_alert
from tasks.fraud_detection import check_transaction_for_fraud
from sqlalchemy import func

wallet_bp = Blueprint('wallet', __name__)

def check_fraud(wallet_id, amount, transaction_type):
    """Basic fraud detection logic"""
    now = datetime.utcnow()
    hour_ago = now - timedelta(hours=1)
    day_ago = now - timedelta(days=1)
    
    # Check for multiple transfers in short period
    recent_transfers = Transaction.query.filter(
        Transaction.wallet_id == wallet_id,
        Transaction.created_at >= hour_ago
    ).count()
    
    # Check for large amounts
    daily_total = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.wallet_id == wallet_id,
        Transaction.created_at >= day_ago
    ).scalar() or 0
    
    is_suspicious = False
    fraud_score = 0.0
    notes = []
    
    if recent_transfers >= 10:
        is_suspicious = True
        fraud_score += 0.5
        notes.append("High frequency of transfers")
    
    if amount >= 10000:
        is_suspicious = True
        fraud_score += 0.3
        notes.append("Large transaction amount")
    
    if daily_total + amount >= 50000:
        is_suspicious = True
        fraud_score += 0.4
        notes.append("Daily transfer limit exceeded")
    
    return is_suspicious, fraud_score, " | ".join(notes) if notes else None

@wallet_bp.route('/balance', methods=['GET'])
@jwt_required()
def get_balance():
    current_user_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(user_id=current_user_id).first()
    
    if not wallet:
        return jsonify({'error': 'Wallet not found'}), 404
    
    return jsonify(wallet.to_dict()), 200

@wallet_bp.route('/deposit', methods=['POST'])
@jwt_required()
def deposit():
    current_user_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(user_id=current_user_id).first()
    
    if not wallet:
        return jsonify({'error': 'Wallet not found'}), 404
    
    data = request.get_json()
    amount = data.get('amount')
    
    if not amount or amount <= 0:
        return jsonify({'error': 'Invalid amount'}), 400
    
    is_suspicious, fraud_score, notes = check_fraud(wallet.id, amount, 'deposit')
    
    transaction = Transaction(
        wallet_id=wallet.id,
        amount=amount,
        transaction_type='deposit',
        status='completed',
        is_suspicious=is_suspicious,
        fraud_score=fraud_score
    )
    
    if is_suspicious:
        user = User.query.get(current_user_id)
        send_transaction_alert(user.email, 'deposit', amount, 'USD', fraud_score)
    
    wallet.balance += amount
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Deposit successful',
        'new_balance': wallet.balance,
        'transaction': transaction.to_dict()
    }), 200

@wallet_bp.route('/withdraw', methods=['POST'])
@jwt_required()
def withdraw():
    current_user_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(user_id=current_user_id).first()
    
    if not wallet:
        return jsonify({'error': 'Wallet not found'}), 404
    
    data = request.get_json()
    amount = data.get('amount')
    
    if not amount or amount <= 0:
        return jsonify({'error': 'Invalid amount'}), 400
    
    if wallet.balance < amount:
        return jsonify({'error': 'Insufficient funds'}), 400
    
    is_suspicious, fraud_score, notes = check_fraud(wallet.id, amount, 'withdrawal')
    
    transaction = Transaction(
        wallet_id=wallet.id,
        amount=amount,
        transaction_type='withdrawal',
        status='completed',
        is_suspicious=is_suspicious,
        fraud_score=fraud_score
    )
    
    if is_suspicious:
        user = User.query.get(current_user_id)
        send_transaction_alert(user.email, 'withdrawal', amount, 'USD', fraud_score)
    
    wallet.balance -= amount
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Withdrawal successful',
        'new_balance': wallet.balance,
        'transaction': transaction.to_dict()
    }), 200

@wallet_bp.route('/transfer', methods=['POST'])
@jwt_required()
def transfer():
    current_user_id = get_jwt_identity()
    sender_wallet = Wallet.query.filter_by(user_id=current_user_id).first()
    
    if not sender_wallet:
        return jsonify({'error': 'Wallet not found'}), 404
    
    data = request.get_json()
    receiver_email = data.get('receiver_email')
    amount = data.get('amount')
    
    if not receiver_email or not amount or amount <= 0:
        return jsonify({'error': 'Invalid transfer details'}), 400
    
    receiver = User.query.filter_by(email=receiver_email).first()
    if not receiver:
        return jsonify({'error': 'Receiver not found'}), 404
    
    receiver_wallet = Wallet.query.filter_by(user_id=receiver.id).first()
    if not receiver_wallet:
        return jsonify({'error': 'Receiver wallet not found'}), 404
    
    if sender_wallet.balance < amount:
        return jsonify({'error': 'Insufficient funds'}), 400
    
    is_suspicious, fraud_score, notes = check_fraud(sender_wallet.id, amount, 'transfer')
    
    transaction = Transaction(
        wallet_id=sender_wallet.id,
        receiver_wallet_id=receiver_wallet.id,
        amount=amount,
        transaction_type='transfer',
        status='completed',
        is_suspicious=is_suspicious,
        fraud_score=fraud_score
    )
    
    if is_suspicious:
        user = User.query.get(current_user_id)
        send_transaction_alert(user.email, 'transfer', amount, 'USD', fraud_score)
    
    sender_wallet.balance -= amount
    receiver_wallet.balance += amount
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({
        'message': 'Transfer successful',
        'new_balance': sender_wallet.balance,
        'transaction': transaction.to_dict()
    }), 200

@wallet_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    current_user_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(user_id=current_user_id).first()
    
    if not wallet:
        return jsonify({'error': 'Wallet not found'}), 404
    
    transactions = Transaction.query.filter(
        (Transaction.wallet_id == wallet.id) |
        (Transaction.receiver_wallet_id == wallet.id)
    ).order_by(Transaction.created_at.desc()).all()
    
    return jsonify({
        'transactions': [t.to_dict() for t in transactions]
    }), 200
