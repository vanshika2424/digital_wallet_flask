from datetime import datetime
from . import db

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=False)
    receiver_wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    transaction_type = db.Column(db.String(20), nullable=False)  # deposit, withdrawal, transfer
    status = db.Column(db.String(20), default='completed')  # completed, pending, failed
    fraud_score = db.Column(db.Float, default=0.0)
    is_suspicious = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)  # Soft delete flag
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)
    is_deleted = db.Column(db.Boolean, default=False)
    deleted_at = db.Column(db.DateTime, nullable=True)  # Timestamp when soft deleted
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
        db.session.commit()

    def to_dict(self):
        return {
            'id': self.id,
            'wallet_id': self.wallet_id,
            'receiver_wallet_id': self.receiver_wallet_id,
            'amount': self.amount,
            'currency': self.currency,
            'transaction_type': self.transaction_type,
            'status': self.status,
            'fraud_score': self.fraud_score,
            'is_suspicious': self.is_suspicious,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def soft_delete(self):
        self.is_active = False
        self.deleted_at = datetime.utcnow()
        return self
