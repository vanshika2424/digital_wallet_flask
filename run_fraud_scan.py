from tasks.fraud_detection import daily_fraud_scan
from app import create_app

app = create_app()
with app.app_context():
    daily_fraud_scan()
