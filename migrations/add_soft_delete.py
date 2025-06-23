import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask
from models import init_models, db
from config import Config
from sqlalchemy import Column, Boolean, DateTime

def upgrade_db():
    app = Flask(__name__)
    app.config.from_object(Config)
    init_models(app)
    
    with app.app_context():
        # Add columns to User model
        with db.engine.connect() as conn:
            conn.execute(db.text('ALTER TABLE user ADD COLUMN is_deleted INTEGER DEFAULT 0'))
            conn.execute(db.text('ALTER TABLE user ADD COLUMN deleted_at TIMESTAMP'))
            
            # Add columns to Transaction model
            conn.execute(db.text('ALTER TABLE transaction ADD COLUMN is_deleted INTEGER DEFAULT 0'))
            conn.execute(db.text('ALTER TABLE transaction ADD COLUMN deleted_at TIMESTAMP'))
            
            # Add columns to Wallet model
            conn.execute(db.text('ALTER TABLE wallet ADD COLUMN is_deleted INTEGER DEFAULT 0'))
            conn.execute(db.text('ALTER TABLE wallet ADD COLUMN deleted_at TIMESTAMP'))
            
            conn.commit()
            
        print("Database migration completed successfully!")

if __name__ == '__main__':
    upgrade_db()
