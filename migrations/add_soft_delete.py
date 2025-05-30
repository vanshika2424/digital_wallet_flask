from flask import Flask
import sys
sys.path.append('..')
from models import init_models, db
from config import Config

def upgrade_db():
    app = Flask(__name__)
    app.config.from_object(Config)
    init_models(app)
    
    with app.app_context():
        # Add is_deleted and deleted_at columns to User model
        db.session.execute('''
            ALTER TABLE user 
            ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
        ''')
        db.session.execute('''
            ALTER TABLE user 
            ADD COLUMN deleted_at DATETIME;
        ''')
        
        # Add is_deleted and deleted_at columns to Transaction model
        db.session.execute('''
            ALTER TABLE transaction 
            ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
        ''')
        db.session.execute('''
            ALTER TABLE transaction 
            ADD COLUMN deleted_at DATETIME;
        ''')
        
        db.session.commit()
        print("Database migration completed successfully!")

if __name__ == '__main__':
    upgrade_db()
