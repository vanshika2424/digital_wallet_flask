from datetime import datetime
from . import db

class Transaction(db.Model):
    __tablename__ = 'transaction'
    
    id = db.Column(db.Integer, primary_key=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.id'), nullable=False)
    receiver_wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    transaction_type = db.Column(db.String(20), nullable=False)  # deposit, withdrawal, transfer
    status = db.Column(db.String(20), default='completed')  # completed, pending, failed
    fraud_score = db.Column(db.Float, default=0.0)
    is_suspicious = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)  # Soft delete flag
    deleted_at = db.Column(db.DateTime, nullable=True)  # Timestamp when soft deleted
    
    def soft_delete(self):
        self.is_deleted = True
        self.is_active = False
        self.deleted_at = datetime.utcnow()
        db.session.commit()
        return self

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
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_deleted': self.is_deleted,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None
        }
