import requests

def test_server():
    try:
        response = requests.get('http://localhost:5000/test')
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Make sure it's running on http://localhost:5000")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == '__main__':
    test_server()
