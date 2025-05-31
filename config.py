import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

import logging
from logging.handlers import RotatingFileHandler

class Config:
    SECRET_KEY = os.environ['SECRET_KEY']
    SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ['JWT_SECRET_KEY']
    
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
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
