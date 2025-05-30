from flask import Flask
from models import init_models, db
from models.user import User
from models.wallet import Wallet
from config import Config

def create_test_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    init_models(app)
    return app

def init_db():
    app = create_test_app()
    
    with app.app_context():
        # Import models to ensure they're registered with SQLAlchemy
        from models.transaction import Transaction
        
        print("Dropping all tables...")
        db.drop_all()
        
        print("Creating all tables...")
        db.create_all()
        
        print("Creating admin user...")
        admin = User(
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            is_admin=True
        )
        admin.set_password('admin123')  # Change this in production
        
        # Create admin wallet
        admin_wallet = Wallet(user=admin)
        
        db.session.add(admin)
        db.session.add(admin_wallet)
        db.session.commit()
        print("Admin user and wallet created successfully!")

if __name__ == '__main__':
    init_db()
