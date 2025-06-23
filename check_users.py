from flask import Flask
from models import db
from models.user import User
from app import create_app

def list_users():
    app = create_app()
    with app.app_context():
        users = User.query.all()
        print("\nRegistered Users:")
        print("-" * 80)
        print(f"{'ID':<5} {'Email':<30} {'Name':<30} {'Admin':<10}")
        print("-" * 80)
        for user in users:
            print(f"{user.id:<5} {user.email:<30} {user.first_name + ' ' + user.last_name:<30} {str(user.is_admin):<10}")
        print("-" * 80)

if __name__ == '__main__':
    list_users()
