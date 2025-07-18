from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.wallet import Wallet
from models.transaction import Transaction
from models import db
from sqlalchemy import func
from datetime import datetime, timedelta
from tasks.scheduled_tasks import scan_for_fraud, generate_daily_report

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

@admin_bp.route('/balances', methods=['GET'])
@jwt_required()
@admin_required
def get_user_balances():
    wallets = Wallet.query.join(User).filter(User.is_active == True).all()
    total_balance = sum(w.balance for w in wallets)
    
    user_balances = [{
        'user_id': w.user_id,
        'email': w.user.email,
        'first_name': w.user.first_name,
        'last_name': w.user.last_name,
        'balance': w.balance,
        'currency': w.currency
    } for w in wallets]
    
    return jsonify({
        'total_system_balance': total_balance,
        'user_balances': user_balances
    }), 200

@admin_bp.route('/top-users/balance', methods=['GET'])
@jwt_required()
@admin_required
def get_top_users_by_balance():
    limit = request.args.get('limit', default=10, type=int)
    
    top_users = db.session.query(
        User.id,
        User.email,
        User.first_name,
        User.last_name,
        Wallet.balance,
        Wallet.currency
    ).join(Wallet).filter(
        User.is_active == True
    ).order_by(
        Wallet.balance.desc()
    ).limit(limit).all()
    
    result = [{
        'user_id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'balance': user.balance,
        'currency': user.currency
    } for user in top_users]
    
    return jsonify({'top_users_by_balance': result}), 200

@admin_bp.route('/top-users/volume', methods=['GET'])
@jwt_required()
@admin_required
def get_top_users_by_volume():
    limit = request.args.get('limit', default=10, type=int)
    days = request.args.get('days', default=30, type=int)
    
    # Calculate the date threshold
    threshold_date = datetime.utcnow() - timedelta(days=days)
    
    # Get transaction volume per user
    volume_by_user = db.session.query(
        User.id,
        User.email,
        User.first_name,
        User.last_name,
        func.sum(Transaction.amount).label('total_volume')
    ).select_from(User).join(
        Wallet, User.id == Wallet.user_id
    ).join(
        Transaction,
        (Wallet.id == Transaction.wallet_id) |
        (Wallet.id == Transaction.receiver_wallet_id)
    ).filter(
        User.is_active == True,
        Transaction.created_at >= threshold_date
    ).group_by(
        User.id,
        User.email,
        User.first_name,
        User.last_name
    ).order_by(
        func.sum(Transaction.amount).desc()
    ).limit(limit).all()
    
    result = [{
        'user_id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'total_volume': float(user.total_volume)
    } for user in volume_by_user]
    
    return jsonify({
        'top_users_by_volume': result,
        'days': days
    }), 200

@admin_bp.route('/users/<int:user_id>/soft-delete', methods=['DELETE'])
@jwt_required()
@admin_required
def soft_delete_user(user_id):
    user = User.query.get_or_404(user_id)
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    balance = wallet.balance if wallet else 0
    
    user.soft_delete()
    
    return jsonify({
        'message': 'User soft deleted successfully',
        'details': {
            'user_id': user.id,
            'email': user.email,
            'name': f'{user.first_name} {user.last_name}',
            'wallet_balance': balance,
            'deleted_at': user.deleted_at.isoformat() if user.deleted_at else None
        }
    }), 200

@admin_bp.route('/transactions/<int:transaction_id>/soft-delete', methods=['DELETE'])
@jwt_required()
@admin_required
def soft_delete_transaction(transaction_id):
    transaction = Transaction.query.get_or_404(transaction_id)
    transaction.soft_delete()
    return jsonify({'message': 'Transaction soft deleted successfully'}), 200

@admin_bp.route('/users/deleted', methods=['GET'])
@jwt_required()
@admin_required
def get_deleted_users():
    deleted_users = User.query.filter_by(is_deleted=True).all()
    return jsonify({
        'deleted_users': [user.to_dict() for user in deleted_users]
    }), 200

@admin_bp.route('/transactions/deleted', methods=['GET'])
@jwt_required()
@admin_required
def get_deleted_transactions():
    deleted_transactions = Transaction.query.filter_by(is_deleted=True).all()
    return jsonify({
        'deleted_transactions': [t.to_dict() for t in deleted_transactions]
    }), 200

@admin_bp.route('/scan/fraud', methods=['POST'])
@jwt_required()
@admin_required
def manual_fraud_scan():
    try:
        scan_for_fraud()
        generate_daily_report()
        return jsonify({
            'message': 'Manual fraud scan completed successfully',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to complete fraud scan',
            'details': str(e)
        }), 500

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_system_stats():
    # Get total users
    total_users = User.query.filter_by(is_active=True).count()
    # For active users, we'll use created_at as a proxy
    active_users_last_24h = User.query.filter(
        User.created_at >= (datetime.utcnow() - timedelta(hours=24))
    ).count()
    
    # Get transaction stats
    total_transactions = Transaction.query.count()
    total_volume = db.session.query(func.sum(Transaction.amount)).scalar() or 0
    
    # Get suspicious transaction stats
    suspicious_transactions = Transaction.query.filter_by(is_suspicious=True).count()
    
    # Get average transaction amount
    avg_transaction = db.session.query(
        func.avg(Transaction.amount)
    ).scalar() or 0
    
    # Get total system balance
    total_balance = db.session.query(
        func.sum(Wallet.balance)
    ).scalar() or 0
    
    return jsonify({
        'user_stats': {
            'total_users': total_users,
            'active_users_last_24h': active_users_last_24h
        },
        'transaction_stats': {
            'total_transactions': total_transactions,
            'total_volume': float(total_volume),
            'average_amount': float(avg_transaction),
            'suspicious_transactions': suspicious_transactions
        },
        'system_balance': float(total_balance)
    }), 200
