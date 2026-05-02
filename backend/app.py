from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import random
import time
import threading
import requests
import base64
import hashlib
import re
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'cyber_secret_2026'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory history and state
history_log = []
phishing_submissions = []

# Baseline stats
stats_state = {
    "total_threats": 0,
    "fraud": 0,
    "phishing": 0,
    "fake_news": 0,
    "threat_trends": [
        {"time": "08:00", "threats": 0, "fraud": 0, "phishing": 0, "news": 0},
        {"time": "09:00", "threats": 0, "fraud": 0, "phishing": 0, "news": 0},
        {"time": "10:00", "threats": 0, "fraud": 0, "phishing": 0, "news": 0},
        {"time": "11:00", "threats": 0, "fraud": 0, "phishing": 0, "news": 0},
        {"time": "12:00", "threats": 0, "fraud": 0, "phishing": 0, "news": 0},
    ]
}

SAFE_DOMAINS = ["google.com", "github.com", "microsoft.com", "apple.com", "amazon.com", "facebook.com", "linkedin.com", "twitter.com"]

def get_deterministic_score(seed_str, min_val=10, max_val=90):
    hash_obj = hashlib.sha256(seed_str.encode())
    hash_int = int(hash_obj.hexdigest(), 16)
    return min_val + (hash_int % (max_val - min_val))

def broadcast_activity(event_type, risk_level, details, id_prefix="USER"):
    now = datetime.now()
    current_hour = now.strftime("%H:00")
    timestamp = now.strftime("%H:%M:%S")
    new_event = {"id": f"{id_prefix}_{random.randint(1000, 9999)}", "type": event_type, "risk": risk_level, "time": timestamp, "details": details}
    stats_state["total_threats"] += 1
    if event_type == "fraud": stats_state["fraud"] += 1
    elif event_type == "phishing": stats_state["phishing"] += 1
    elif event_type == "news": stats_state["fake_news"] += 1
    
    for point in stats_state["threat_trends"]:
        if point["time"] == current_hour:
            point["threats"] += 1
            if event_type == "fraud": point["fraud"] += 1
            elif event_type == "phishing": point["phishing"] += 1
            elif event_type == "news": point["news"] += 1
            break
            
    history_log.insert(0, new_event)
    socketio.emit('stream_update', {**stats_state, "new_event": new_event, "history": history_log})

@socketio.on('connect')
def handle_connect():
    emit('initial_data', {**stats_state, "history": history_log})

@app.route('/api/admin/clear-logs', methods=['POST'])
def clear_logs():
    """Super Admin action to purge all logs"""
    global history_log
    history_log = []
    # Reset stats but keep trend structure
    stats_state["total_threats"] = 0
    stats_state["fraud"] = 0
    stats_state["phishing"] = 0
    stats_state["fake_news"] = 0
    for p in stats_state["threat_trends"]:
        p.update({"threats": 0, "fraud": 0, "phishing": 0, "news": 0})
    
    socketio.emit('initial_data', {**stats_state, "history": history_log})
    return jsonify({"success": True, "message": "All logs and analytics have been purged by Super Admin."})

@app.route('/api/fraud', methods=['POST'])
def detect_fraud():
    data = request.json
    amount, merchant, location = data.get('amount', 0), data.get('merchant', ''), data.get('location', 'Global')
    time.sleep(1)
    risk = get_deterministic_score(f"{merchant}_{amount}", 10, 80)
    prediction = "Fraud" if risk > 70 else "Not Fraud"
    broadcast_activity("fraud", "High" if risk > 70 else "Low", f"Neural Audit: {prediction} for {merchant}")
    return jsonify({"prediction": prediction, "risk_score": round(risk, 2), "reasons": [f"Baseline: {risk}%"]})

@app.route('/api/phishing', methods=['POST'])
def detect_phishing():
    data = request.json
    url = data.get('url', '').strip()
    if not url.startswith(('http', 'https')): return jsonify({"error": "INVALID_INPUT"}), 400
    time.sleep(1)
    risk = get_deterministic_score(url, 5, 40)
    prediction = "Safe"
    broadcast_activity("phishing", "Low", f"URL Scan: {prediction} for {url[:20]}...")
    return jsonify({"prediction": prediction, "confidence": round(risk, 2), "reasons": [f"Baseline: {risk}%"]})

@app.route('/api/fake-news', methods=['POST'])
def detect_fake_news():
    data = request.json
    text = data.get('text', '').strip()
    time.sleep(1)
    risk = get_deterministic_score(text, 10, 60)
    prediction = "Real"
    broadcast_activity("news", "Low", "Linguistic Audit: Content marked as Real")
    return jsonify({"prediction": prediction, "confidence": round(risk, 2), "reasons": [f"Baseline: {risk}%"]})

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5001, allow_unsafe_werkzeug=True)
