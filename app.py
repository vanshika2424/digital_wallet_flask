from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_swagger_ui import get_swaggerui_blueprint
from apscheduler.schedulers.background import BackgroundScheduler
from tasks.scheduled_tasks import scan_for_fraud
from config import Config
from models import init_models, db
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

# Initialize Flask extensions
jwt = JWTManager()

# JWT configuration
def jwt_config(app):
    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_ACCESS_TOKEN_EXPIRES
    app.config['JWT_TOKEN_LOCATION'] = Config.JWT_TOKEN_LOCATION
    app.config['JWT_HEADER_NAME'] = Config.JWT_HEADER_NAME
    app.config['JWT_HEADER_TYPE'] = Config.JWT_HEADER_TYPE

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    jwt_config(app)
    jwt.init_app(app)
    init_models(app)
    
    # Simple test route
    @app.route('/test')
    def test():
        return jsonify({'message': 'Digital Wallet API is running!'})
        
    @app.route('/test/fraud-scan')
    def test_fraud_scan():
        with app.app_context():
            scan_for_fraud()
        return jsonify({'message': 'Fraud scan completed. Check app.log for results.'})
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.wallet import wallet_bp
    from routes.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(wallet_bp, url_prefix='/api/wallet')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Swagger configuration
    SWAGGER_URL = '/api/docs'
    API_URL = '/static/swagger.json'
    swagger_bp = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "Digital Wallet API"
        }
    )
    app.register_blueprint(swagger_bp, url_prefix=SWAGGER_URL)

    # Create database tables
    with app.app_context():
        db.create_all()

    # Initialize scheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(scan_for_fraud, 'cron', hour=0, minute=0)  # Run at midnight
    scheduler.start()
    
    return app

# Create the Flask application instance
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
