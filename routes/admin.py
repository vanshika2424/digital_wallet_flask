from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.wallet import Wallet
from models.transaction import Transaction
from models import db
from sqlalchemy import func
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

@admin_bp.route('/suspicious-transactions', methods=['GET'])
@jwt_required()
@admin_required
def get_suspicious_transactions():
    transactions = Transaction.query.filter_by(is_suspicious=True)\
        .order_by(Transaction.created_at.desc()).all()
    
    return jsonify({
        'suspicious_transactions': [t.to_dict() for t in transactions]
    }), 200

@admin_bp.route('/user-balances', methods=['GET'])
@jwt_required()
@admin_required
def get_user_balances():
    wallets = Wallet.query.join(User).filter(User.is_active == True).all()
    total_balance = sum(w.balance for w in wallets)
    
    return jsonify({
        'total_balance': total_balance,
        'wallets': [w.to_dict() for w in wallets]
    }), 200

@admin_bp.route('/top-users', methods=['GET'])
@jwt_required()
@admin_required
def get_top_users():
    # Top users by balance
    top_by_balance = db.session.query(
        User, Wallet.balance
    ).join(Wallet, User.id == Wallet.user_id).order_by(
        Wallet.balance.desc()
    ).limit(10).all()
    
    # Top users by transaction volume (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    top_by_volume = db.session.query(
        User,
        func.count(Transaction.id).label('transaction_count'),
        func.sum(Transaction.amount).label('total_amount')
    ).join(Wallet, User.id == Wallet.user_id).join(
        Transaction,
        Wallet.id == Transaction.wallet_id
    ).filter(
        Transaction.created_at >= thirty_days_ago
    ).group_by(User.id).order_by(
        func.sum(Transaction.amount).desc()
    ).limit(10).all()
    
    return jsonify({
        'top_by_balance': [{
            'user': user.to_dict(),
            'balance': balance
        } for user, balance in top_by_balance],
        'top_by_volume': [{
            'user': user.to_dict(),
            'transaction_count': int(count),
            'total_amount': float(amount) if amount else 0
        } for user, count, amount in top_by_volume]
    }), 200

@admin_bp.route('/system-stats', methods=['GET'])
@jwt_required()
@admin_required
def get_system_stats():
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    total_transactions = Transaction.query.count()
    total_volume = db.session.query(func.sum(Transaction.amount)).scalar() or 0
    suspicious_transactions = Transaction.query.filter_by(is_suspicious=True).count()
    
    # Daily transaction stats for the last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    daily_stats = db.session.query(
        func.strftime('%Y-%m-%d', Transaction.created_at).label('date'),
        func.count(Transaction.id).label('count'),
        func.sum(Transaction.amount).label('volume')
    ).filter(
        Transaction.created_at >= seven_days_ago
    ).group_by(
        func.strftime('%Y-%m-%d', Transaction.created_at)
    ).order_by(func.strftime('%Y-%m-%d', Transaction.created_at).desc()).all()

    daily_transactions = [{
        'date': stat.date,
        'count': int(stat.count),
        'volume': float(stat.volume) if stat.volume else 0
    } for stat in daily_stats]
    
    return jsonify({
        'total_users': total_users,
        'active_users': active_users,
        'total_transactions': total_transactions,
        'total_volume': float(total_volume),
        'suspicious_transactions': suspicious_transactions,
        'daily_stats': daily_transactions
    }), 200

@admin_bp.route('/transactions/<int:transaction_id>/delete', methods=['DELETE'])
@jwt_required()
@admin_required
def soft_delete_transaction(transaction_id):
    transaction = Transaction.query.get_or_404(transaction_id)
    transaction.is_active = False
    transaction.deleted_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Transaction soft deleted successfully'}), 200

@admin_bp.route('/users/<int:user_id>/delete', methods=['DELETE'])
@jwt_required()
@admin_required
def soft_delete_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = False
    user.deleted_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'User soft deleted successfully'}), 200

@admin_bp.route('/transactions/deleted', methods=['GET'])
@jwt_required()
@admin_required
def get_deleted_transactions():
    transactions = Transaction.query.filter_by(is_active=False).all()
    return jsonify({
        'deleted_transactions': [t.to_dict() for t in transactions]
    }), 200

@admin_bp.route('/users/deleted', methods=['GET'])
@jwt_required()
@admin_required
def get_deleted_users():
    users = User.query.filter_by(is_active=False).all()
    return jsonify({
        'deleted_users': [u.to_dict() for u in users]
    }), 200
