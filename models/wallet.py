from datetime import datetime
from . import db

class Wallet(db.Model):
    __tablename__ = 'wallet'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    balance = db.Column(db.Float, default=0.0)
    currency = db.Column(db.String(3), default='USD')
    is_active = db.Column(db.Boolean, default=True)
    is_deleted = db.Column(db.Boolean, default=False)  # Soft delete flag
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)  # Timestamp when soft deleted
    
    transactions_sent = db.relationship('Transaction',
                                    foreign_keys='Transaction.wallet_id',
                                    backref='sender_wallet',
                                    lazy=True)
    
    transactions_received = db.relationship('Transaction',
                                       foreign_keys='Transaction.receiver_wallet_id',
                                       backref='receiver_wallet',
                                       lazy=True)
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
        return self
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'balance': self.balance,
            'currency': self.currency,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
