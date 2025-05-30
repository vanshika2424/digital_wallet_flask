import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

import logging
from logging.handlers import RotatingFileHandler

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///digital_wallet.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    
    @staticmethod
    def init_app(app):
        # Set up logging to file
        handler = RotatingFileHandler('logs/app.log', maxBytes=10000000, backupCount=5)
        handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        handler.setLevel(logging.INFO)
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Digital Wallet startup')
    
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # Fraud Detection Settings
    MAX_TRANSFERS_PER_HOUR = 10
    SUSPICIOUS_AMOUNT_THRESHOLD = 10000
    MAX_DAILY_TRANSFER_AMOUNT = 50000
    
    # Email Settings (for mock notifications)
    MAIL_SERVER = 'smtp.example.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'test@example.com')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', 'password')
