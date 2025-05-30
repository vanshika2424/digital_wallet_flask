import requests
import json
from time import sleep

BASE_URL = 'http://localhost:5000/api'

def test_endpoint(method, endpoint, data=None, token=None, expected_status=200):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers)
        elif method == 'PUT':
            response = requests.put(url, json=data, headers=headers)
        else:
            print(f"Unsupported method: {method}")
            return False

        print(f"\n{'-'*50}")
        print(f"Testing {method} {endpoint}")
        print(f"Status Code: {response.status_code} (Expected: {expected_status})")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == expected_status, response.json()
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to server at {url}")
        return False, None
    except Exception as e:
        print(f"Error testing {endpoint}: {str(e)}")
        return False, None

def run_tests():
    print("Starting API Tests...")
    
    # Test basic server health
    test_endpoint('GET', '/test')
    
    # Test Authentication Endpoints
    print("\nTesting Authentication...")
    success, register_response = test_endpoint('POST', '/auth/register', {
        'username': 'testuser',
        'password': 'Test123!',
        'email': 'test@example.com'
    }, expected_status=201)
    
    success, login_response = test_endpoint('POST', '/auth/login', {
        'username': 'testuser',
        'password': 'Test123!'
    })
    
    if not success:
        print("Login failed, cannot continue with authenticated tests")
        return
    
    token = login_response.get('access_token')
    
    # Test Wallet Endpoints
    print("\nTesting Wallet Operations...")
    test_endpoint('POST', '/wallet/deposit', {
        'amount': 1000
    }, token)
    
    sleep(1)  # Add small delay between requests
    
    test_endpoint('GET', '/wallet/balance', None, token)
    
    test_endpoint('POST', '/wallet/withdraw', {
        'amount': 500
    }, token)
    
    test_endpoint('POST', '/wallet/transfer', {
        'recipient_username': 'admin',
        'amount': 100
    }, token)
    
    test_endpoint('GET', '/wallet/transactions', None, token)
    
    # Test Admin Endpoints
    print("\nTesting Admin Endpoints...")
    test_endpoint('GET', '/admin/users', None, token)
    test_endpoint('GET', '/admin/transactions', None, token)
    test_endpoint('GET', '/admin/flagged-transactions', None, token)

if __name__ == '__main__':
    run_tests()
