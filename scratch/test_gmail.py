import os
from dotenv import load_dotenv
import requests
import base64

load_dotenv()

CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
REFRESH_TOKEN = os.getenv('GOOGLE_REFRESH_TOKEN')

def get_access_token():
    res = requests.post('https://oauth2.googleapis.com/token', json={
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'refresh_token': REFRESH_TOKEN,
        'grant_type': 'refresh_token'
    })
    return res.json().get('access_token')

def send_test_email():
    token = get_access_token()
    if not token:
        print("Error: Could not get access token. Check your credentials.")
        return

    to = "bangalexf@gmail.com"
    subject = "AutoFlow Gmail Test 🚀"
    body = "<h2>Success!</h2><p>This email was sent via the Gmail API integration. Your batch email system is now fully functional.</p>"
    
    mime = f"To: {to}\nSubject: {subject}\nContent-Type: text/html; charset=utf-8\nMIME-Version: 1.0\n\n{body}"
    raw = base64.urlsafe_b64encode(mime.encode()).decode()

    res = requests.post(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        json={'raw': raw}
    )
    
    if res.status_code == 200:
        print("✅ Test email sent successfully to bangalexf@gmail.com!")
    else:
        print(f"❌ Error sending email: {res.text}")

if __name__ == '__main__':
    send_test_email()
