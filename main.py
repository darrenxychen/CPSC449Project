from dotenv import load_dotenv
import os
import requests 
from datetime import datetime
from flask import render_template, redirect, request, jsonify, session, Flask
import urllib.parse

#grabs our SECRET_KEY variable in the .env file
load_dotenv()  

# app is set to the entry point of our server
app = Flask(__name__)

# sercret_key allows us to access the Flask session where user data can be accessed later on between requests 
app.secret_key = 'super-secret-please-replace-later-key'

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REDIRECT_URI = 'http://127.0.0.1:5000/callback'

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

# Creating the endpoint for "Login with Spotify"
@app.route('/login')
def login():
    scope = 'user-read-private user-read-email'

    params = {
        'client_id' : CLIENT_ID,
        'response_type' : 'code',
        'scope' : scope,
        'redirect_uri' : REDIRECT_URI,
        'show_dialog' : True #forces the user to log in every time which helps us test. change this to false for deployment.
    }

    auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"

    return redirect(auth_url)

@app.route('/callback')
def callback():
    if 'error' in request.args:
        return jsonify({"error": request.args['error']})
    
    if 'code' in request.args:
        req_body = {
            'code' : request.args['code'],
            'grant_type' : 'authorization_code',
            'redirect_uri' : REDIRECT_URI,
            'client_id' : CLIENT_ID,
            'client_secret' : CLIENT_SECRET
        }

    response = requests.post(TOKEN_URL, data=req_body)
    token_info = response.json()

    session['access_token'] = token_info['access_token']
    session['refresh_token'] = token_info['refresh_token']
    session['expires_at'] = datetime.now().timestamp() + token_info['expires_in']

    return redirect('/playlists')

@app.route('/playlists')
def get_playlists():
    if 'access_token' not in session:
        return redirect('/login')
    
    #if user token is expired then we will refresh it so they dont have to log in again
    if datetime.now().timestamp() > session['expires_at']:
        return redirect('/refresh-token')
    
    headers = {
        'Authorization' : f"Bearer {session['access_token']}",
    }

    response = request.get(API_BASE_URL + 'me/playlists', headers=headers)
    playlists = response.json()

    return jsonify(playlists)

@app.route('/refresh-token')
def refresh_toekn():
    if 'refresh_toekn' not in session:
        return redirect('/login')
    
    if datetime.now().timestamp() > session['expires_at']:
        req_body = {
            'grant_type' : 'refresh_token',
            'refresh_token' : session['refresh_token'],
            'client_id' : CLIENT_ID,
            'client_secret' : CLIENT_SECRET
        }
        response = requests.post(TOKEN_URL, data=req_body)
        new_token_info = response.json()

        session['access_token'] = new_token_info['access_token']
        session['expires_at'] = datetime.now().timestamp() + new_token_info['expires_in']

        return redirect('/playlists')


if __name__ == '__main__':
    app.run(debug=True)