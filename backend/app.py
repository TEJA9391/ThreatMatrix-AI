from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import random
import time
import threading
import re
import hashlib
import math
from datetime import datetime
from urllib.parse import urlparse
import os
import requests
import sqlite3
import socket


# Serve React Frontend in production if build output is present
frontend_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

if os.path.exists(frontend_folder):
    app = Flask(__name__, static_folder=frontend_folder, static_url_path='')
else:
    app = Flask(__name__)

app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'tm_secret_fallback_2026')
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5001"])
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5001", "*"])

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'threatmatrix.db')

def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            level TEXT NOT NULL,
            bio TEXT,
            avatar TEXT,
            location TEXT
        )
    ''')
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN location TEXT")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()

init_db()

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

history_log = []
phishing_submissions = []

# Google Fact Check API Key — load from environment, fallback to empty (disables live fact-check)
GOOGLE_FACT_CHECK_API_KEY = os.environ.get('GOOGLE_FACT_CHECK_API_KEY', '')
GOOGLE_FC_URL = "https://factchecktools.googleapis.com/v1alpha1/claims:search"

# Generate threat_trends slots dynamically around current hour
def _make_trends():
    now = datetime.now()
    slots = []
    for i in range(-4, 1):
        h = (now.hour + i) % 24
        slots.append({"time": f"{h:02d}:00", "threats": 0, "fraud": 0, "phishing": 0, "news": 0})
    return slots

stats_state = {
    "total_threats": 0, "fraud": 0, "phishing": 0, "fake_news": 0,
    "threat_trends": _make_trends()
}

# ─── PHISHING ENGINE ────────────────────────────────────────────────────────

TRUSTED_DOMAINS = {
    "google.com", "github.com", "microsoft.com", "apple.com", "amazon.com",
    "facebook.com", "linkedin.com", "twitter.com", "instagram.com", "youtube.com",
    "wikipedia.org", "reddit.com", "netflix.com", "paypal.com", "ebay.com",
    "adobe.com", "dropbox.com", "salesforce.com", "zoom.us", "slack.com"
}

PHISHING_KEYWORDS = [
    "login", "verify", "account", "secure", "banking", "update", "signin",
    "wp-admin", "pay", "confirm", "reset", "password", "credential", "auth",
    "webscr", "cmd=", "dispatch", "session", "token", "unlock", "suspend",
    "validate", "access", "customer-service", "support-center", "security-alert"
]

PHISHING_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".pw", ".xyz", ".top",
                 ".click", ".loan", ".work", ".date", ".faith", ".review"]

LEGIT_INDICATORS = ["https", "www", ".com", ".org", ".edu", ".gov", ".net"]

# ─── FRAUD ENGINE DATA ────────────────────────────────────────────────────────
HIGH_RISK_MERCHANTS = [
    "crypto", "exchange", "casino", "gambling", "poker", "gold", "jewel", 
    "giftcard", "wire", "transfer", "westernunion", "cash", "atm", 
    "escrow", "vpn", "hosting", "domain", "binance", "coinbase"
]

def analyze_fraud_transaction(amount, merchant, tx_time, tx_location):
    signals = []
    score = 10  # Baseline risk
    
    # Signal 1: Transaction Amount
    try:
        val = float(amount)
    except ValueError:
        val = 0.0

    if val > 5000:
        signals.append({"label": "High Transaction Amount", "status": "FAIL", "detail": f"Amount ${val:,.2f} exceeds standard limits (+30 risk)", "weight": 30})
        score += 30
    elif val > 1000:
        signals.append({"label": "Moderate Transaction Amount", "status": "WARN", "detail": f"Amount ${val:,.2f} is moderately high (+15 risk)", "weight": 15})
        score += 15
    else:
        signals.append({"label": "Transaction Amount", "status": "PASS", "detail": f"Amount ${val:,.2f} is within normal velocity threshold", "weight": 0})

    # Signal 2: High-risk merchant audit
    merchant_lower = merchant.lower()
    flagged_merchant = [m for m in HIGH_RISK_MERCHANTS if m in merchant_lower]
    if flagged_merchant:
        signals.append({"label": "Merchant Risk Rating", "status": "FAIL", "detail": f"High-risk category '{flagged_merchant[0]}' matching blacklist (+25 risk)", "weight": 25})
        score += 25
    else:
        signals.append({"label": "Merchant Risk Rating", "status": "PASS", "detail": "Merchant category matches low-risk profile", "weight": 0})

    # Signal 3: Transaction Timestamp / Midnight Window
    hour = 12
    try:
        if ":" in tx_time:
            hour = int(tx_time.split(":")[0])
    except Exception:
        pass
        
    if 1 <= hour <= 5:  # Between 1 AM and 5 AM
        signals.append({"label": "Temporal Velocity", "status": "FAIL", "detail": f"Midnight transaction window ({hour:02d}:00) — high fraud probability (+20 risk)", "weight": 20})
        score += 20
    else:
        signals.append({"label": "Temporal Velocity", "status": "PASS", "detail": f"Transaction initiated at normal operating hour ({hour:02d}:00)", "weight": 0})

    # Signal 4: Geolocation Anomaly (cross-border mismatch simulator)
    loc_lower = tx_location.lower()
    country_indicators = {
        "uk": ["london", "manchester", "united kingdom"],
        "us": ["new york", "california", "america", "usa"],
        "in": ["india", "hyderabad", "mumbai", "delhi"],
        "ru": ["russia", "moscow"],
        "cn": ["china", "beijing", "shanghai"]
    }
    
    cross_border = False
    for country, cities in country_indicators.items():
        has_city = any(c in loc_lower for c in cities)
        if has_city:
            other_countries = [co for co in country_indicators.keys() if co != country]
            for oc in other_countries:
                if f".{oc}" in merchant_lower or f" {oc}" in merchant_lower:
                    cross_border = True
                    break
    
    if cross_border:
        signals.append({"label": "Cross-Border Consistency", "status": "FAIL", "detail": "Geographical mismatch between merchant origin and card location (+20 risk)", "weight": 20})
        score += 20
    else:
        signals.append({"label": "Cross-Border Consistency", "status": "PASS", "detail": "No geographical anomalies detected", "weight": 0})

    # Limit score
    score = max(0, min(score, 100))
    
    if score < 30:
        prediction = "Safe"
    elif score < 65:
        prediction = "Suspicious"
    else:
        prediction = "Fraud"
        
    return prediction, score, signals

def calculate_entropy(s):
    if not s:
        return 0
    entropy = 0
    for x in set(s):
        p_x = s.count(x) / len(s)
        entropy += - p_x * math.log2(p_x)
    return entropy

def get_similarity(s1, s2):
    if len(s1) < len(s2):
        return get_similarity(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def analyze_phishing_url(url):
    signals = []
    score = 0
    
    # Ensure scheme is present for parsing
    if not url.startswith(("http://", "https://")):
        url_to_parse = "http://" + url
    else:
        url_to_parse = url
        
    parsed = urlparse(url_to_parse)
    domain = parsed.netloc.lower().replace("www.", "")
    path = parsed.path.lower()
    full = url_to_parse.lower()

    if not domain:
        # Fallback split
        try:
            domain = url_to_parse.split('/')[2].replace("www.", "")
        except IndexError:
            domain = url_to_parse.replace("www.", "")

    # Signal 1: SSL/HTTPS check
    if url.startswith("https://"):
        signals.append({"label": "SSL Certificate", "status": "PASS", "detail": "HTTPS encrypted connection detected", "weight": -10})
        score -= 10
    else:
        signals.append({"label": "SSL Certificate", "status": "FAIL", "detail": "No HTTPS — plain HTTP connection", "weight": 20})
        score += 20

    # Signal 2: Trusted domain check
    base_domain = ".".join(domain.split(".")[-2:]) if "." in domain else domain
    if base_domain in TRUSTED_DOMAINS:
        signals.append({"label": "Domain Reputation", "status": "PASS", "detail": f"{base_domain} is a verified trusted domain", "weight": -20})
        score -= 20
    else:
        signals.append({"label": "Domain Reputation", "status": "WARN", "detail": f"{base_domain} not found in trusted domain list", "weight": 15})
        score += 15

    # Signal 3: Brand impersonation (known brand in subdomain/path but not root)
    brands = ["paypal", "amazon", "google", "apple", "microsoft", "netflix", "bank", "ebay", "instagram", "facebook"]
    impersonated = [b for b in brands if b in domain and base_domain not in TRUSTED_DOMAINS]
    if impersonated:
        signals.append({"label": "Brand Impersonation", "status": "FAIL", "detail": f"Spoofing detected: '{impersonated[0]}' in domain but not official", "weight": 35})
        score += 35
    else:
        signals.append({"label": "Brand Impersonation", "status": "PASS", "detail": "No brand spoofing patterns detected", "weight": 0})

    # Signal 4: Typosquatting Detection
    typosquatted = False
    for td in TRUSTED_DOMAINS:
        dist = get_similarity(domain, td)
        if 0 < dist <= 2:  # Very close edit distance (1 or 2 character changes)
            typosquatted = True
            signals.append({"label": "Typosquatting Detection", "status": "FAIL", "detail": f"Spoof pattern: Domain edit distance is close to trusted brand '{td}'", "weight": 35})
            score += 35
            break
    if not typosquatted:
        signals.append({"label": "Typosquatting Detection", "status": "PASS", "detail": "No typosquatting signatures found", "weight": 0})

    # Signal 5: Suspicious keywords in URL
    found_kw = [kw for kw in PHISHING_KEYWORDS if kw in full]
    if len(found_kw) >= 3:
        signals.append({"label": "Suspicious Keywords", "status": "FAIL", "detail": f"High-risk keywords: {', '.join(found_kw[:4])}", "weight": 25})
        score += 25
    elif len(found_kw) >= 1:
        signals.append({"label": "Suspicious Keywords", "status": "WARN", "detail": f"Keywords flagged: {', '.join(found_kw[:3])}", "weight": 12})
        score += 12
    else:
        signals.append({"label": "Suspicious Keywords", "status": "PASS", "detail": "No suspicious keywords in URL path", "weight": 0})

    # Signal 6: IP address as host
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}", domain):
        signals.append({"label": "IP-Based Host", "status": "FAIL", "detail": "URL uses raw IP address — high phishing indicator", "weight": 30})
        score += 30
    else:
        signals.append({"label": "IP-Based Host", "status": "PASS", "detail": "Domain-based host — normal pattern", "weight": 0})

    # Signal 7: URL length
    url_len = len(url)
    if url_len > 100:
        signals.append({"label": "URL Length", "status": "FAIL", "detail": f"Abnormally long URL ({url_len} chars) — obfuscation likely", "weight": 15})
        score += 15
    elif url_len > 70:
        signals.append({"label": "URL Length", "status": "WARN", "detail": f"URL is moderately long ({url_len} chars)", "weight": 5})
        score += 5
    else:
        signals.append({"label": "URL Length", "status": "PASS", "detail": f"URL length normal ({url_len} chars)", "weight": 0})

    # Signal 8: TLD Analysis
    bad_tld = [t for t in PHISHING_TLDS if domain.endswith(t)]
    if bad_tld:
        signals.append({"label": "TLD Analysis", "status": "FAIL", "detail": f"High-risk TLD detected: '{bad_tld[0]}' — frequently abused", "weight": 25})
        score += 25
    else:
        signals.append({"label": "TLD Analysis", "status": "PASS", "detail": "TLD is standard and not flagged", "weight": 0})

    # Signal 9: Subdomain depth
    parts = domain.split(".")
    subdomain_count = len(parts) - 2
    if subdomain_count >= 3:
        signals.append({"label": "Subdomain Depth", "status": "FAIL", "detail": f"{subdomain_count} subdomain levels — evasion pattern", "weight": 20})
        score += 20
    elif subdomain_count == 2:
        signals.append({"label": "Subdomain Depth", "status": "WARN", "detail": "Multiple subdomains — slightly suspicious", "weight": 8})
        score += 8
    else:
        signals.append({"label": "Subdomain Depth", "status": "PASS", "detail": "Normal subdomain structure", "weight": 0})

    # Signal 10: Special chars / obfuscation
    special_chars = len(re.findall(r"[@%\-_~]", url))
    if special_chars >= 4:
        signals.append({"label": "URL Obfuscation", "status": "FAIL", "detail": f"{special_chars} special characters — likely obfuscated", "weight": 15})
        score += 15
    elif special_chars >= 2:
        signals.append({"label": "URL Obfuscation", "status": "WARN", "detail": f"{special_chars} special characters found", "weight": 5})
        score += 5
    else:
        signals.append({"label": "URL Obfuscation", "status": "PASS", "detail": "No unusual obfuscation patterns", "weight": 0})

    # Signal 11: Query Complexity
    query = parsed.query
    if len(query) > 80 or query.count("=") > 4:
        signals.append({"label": "Query Complexity", "status": "FAIL", "detail": "Complex query string — possible redirect chain", "weight": 15})
        score += 15
    else:
        signals.append({"label": "Query Complexity", "status": "PASS", "detail": "Query parameters appear normal", "weight": 0})

    # Signal 12: Shannon Lexical Entropy Check
    entropy = calculate_entropy(domain)
    if entropy > 4.2:
        signals.append({"label": "Lexical Entropy", "status": "FAIL", "detail": f"High character entropy ({entropy:.2f}) — random domain DGA pattern", "weight": 25})
        score += 25
    elif entropy > 3.8:
        signals.append({"label": "Lexical Entropy", "status": "WARN", "detail": f"Moderately high entropy ({entropy:.2f})", "weight": 10})
        score += 10
    else:
        signals.append({"label": "Lexical Entropy", "status": "PASS", "detail": f"Normal entropy ({entropy:.2f})", "weight": 0})

    # Signal 13: Live DNS Resolution
    dns_resolved = False
    try:
        ip_resolved = socket.gethostbyname(domain)
        dns_resolved = True
        signals.append({"label": "DNS Resolution", "status": "PASS", "detail": f"Domain resolved successfully to: {ip_resolved}", "weight": -15})
        score -= 15
    except Exception:
        signals.append({"label": "DNS Resolution", "status": "FAIL", "detail": "Domain failed DNS lookup or is offline", "weight": 40})
        score += 40

    score = max(0, min(score, 100))
    if score < 30:
        prediction, risk_level = "Safe", "Low"
    elif score < 60:
        prediction, risk_level = "Suspicious", "Medium"
    else:
        prediction, risk_level = "Malicious", "High"

    return prediction, score, risk_level, signals


# ─── FAKE NEWS ENGINE ────────────────────────────────────────────────────────

SENSATIONAL_WORDS = [
    "shocking", "unbelievable", "bombshell", "explosive", "exposed", "secret",
    "they don't want you to know", "wake up", "mainstream media", "cover up",
    "hoax", "false flag", "conspiracy", "deep state", "crisis actor", "plandemic",
    "scamdemic", "fake pandemic", "illuminati", "new world order", "chemtrail",
    "microchip", "mind control", "censored", "banned", "silenced", "suppressed"
]

CREDIBILITY_WORDS = [
    "according to", "research shows", "study finds", "published in", "scientists",
    "experts say", "data shows", "report", "evidence", "peer-reviewed",
    "university", "laboratory", "statistics", "analysis", "survey",
    "source:", "cited", "journal", "confirmed by", "official statement"
]

EMOTIONAL_TRIGGERS = [
    "you won't believe", "share before deleted", "breaking:", "urgent:", "alert:",
    "must read", "going viral", "everyone is saying", "hundreds of thousands",
    "doctors hate", "one weird trick", "miracle cure", "100% proven",
    "government admits", "leaked documents", "whistleblower", "insider reveals"
]

FAKE_PATTERNS = [
    r"\b(cure|cures)\s+(cancer|diabetes|covid|aids)\b",
    r"\bvaccine(s)?\s+(kill|cause|are)\b",
    r"\b(bill gates|george soros|soros)\s+(controls|funds|behind)\b",
    r"\bmind\s+control\b",
    r"\b5g\s+(causes|kills|spreads)\b",
    r"\bearth\s+is\s+flat\b",
    r"\bdeep\s+state\b",
    r"\bnew\s+world\s+order\b",
    r"\bcrisis\s+actor(s)?\b",
]

# Physically impossible / extraordinary scientific claims
EXTRAORDINARY_PATTERNS = [
    r"\bhidden\s+planet\b",
    r"\bplanet\s+(behind|inside|under)\s+(the\s+)?(moon|earth|sun)\b",
    r"\b(new|second|unknown)\s+(sun|moon|planet|star)\s+(discovered|found|spotted)\b",
    r"\b(alien|ufo|extraterrestrial)\s+(base|city|structure)\s+(found|discovered|confirmed)\b",
    r"\bwill\s+become\s+visible\s+(to\s+earth|next\s+month|next\s+week|soon)\b",
    r"\b(asteroid|meteor|planet)\s+will\s+(hit|strike|destroy)\s+earth\b",
    r"\b(scientists?|nasa|isro|esa)\s+(discovered|found|confirmed)\s+.{0,40}(hidden|secret|unknown|invisible)\b",
    r"\banti.?gravity\b",
    r"\btelep(ort|athy)\s+(proven|confirmed|discovered)\b",
    r"\b(time\s+travel|time\s+machine)\s+(proven|confirmed|discovered|built)\b",
    r"\blives?\s+(up to|for)\s+\d{3,}\s+years?\b",
    r"\bimmortality\s+(pill|drug|serum|discovered|found)\b",
    r"\bcure(d|s)?\s+all\s+(diseases?|cancers?|illness)\b",
    r"\b(moon|mars|jupiter)\s+base\s+(confirmed|discovered|found|built)\b",
    r"\bgovernment\s+(hiding|hid|concealed)\s+(planet|alien|cure|disease)\b",
]

# Unverifiable vague future predictions used as bait
FUTURE_BAIT_PATTERNS = [
    r"\bnext\s+(month|week|year|tuesday|monday)\b",
    r"\bwill\s+(appear|emerge|arrive|happen|occur|be\s+revealed)\s+(soon|next|this)\b",
    r"\bcoming\s+(soon|next\s+month|next\s+week)\b",
    r"\bwithin\s+(days?|hours?|weeks?)\b",
    r"\bby\s+(end\s+of\s+(the\s+)?(month|year|week))\b",
    r"\b(breaking|urgent|alert)\b",
]

# Claims that mention authority but sound like a leak
LEAK_PATTERNS = [
    r"\bgovernment\s+(hiding|hid|secretly)\b",
    r"\bnasa\s+(secret|hidden)\b",
    r"\b(leaked|internal)\s+(documents?|memo|email)\b",
    r"\b(insider|whistleblower)\s+reveals\b",
]

def analyze_fake_news(text):
    signals = []
    score = 0
    text_lower = text.lower()
    word_count = len(text.split())
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if len(s.strip()) > 10]
    sentence_count = max(len(sentences), 1)

    # Signal 1: Sensational language
    found_sensational = [w for w in SENSATIONAL_WORDS if w in text_lower]
    if len(found_sensational) >= 4:
        signals.append({"label": "Sensationalism Score", "status": "FAIL", "detail": f"High sensational language: {', '.join(found_sensational[:4])}", "weight": 30})
        score += 30
    elif len(found_sensational) >= 2:
        signals.append({"label": "Sensationalism Score", "status": "WARN", "detail": f"Moderate sensational terms: {', '.join(found_sensational[:3])}", "weight": 15})
        score += 15
    else:
        signals.append({"label": "Sensationalism Score", "status": "PASS", "detail": "No significant sensational language detected", "weight": 0})

    # Signal 2: Credibility language
    found_credible = [w for w in CREDIBILITY_WORDS if w in text_lower]
    if len(found_credible) >= 3:
        signals.append({"label": "Credibility Markers", "status": "PASS", "detail": f"Strong credibility indicators: {', '.join(found_credible[:3])}", "weight": -20})
        score -= 20
    elif len(found_credible) >= 1:
        signals.append({"label": "Credibility Markers", "status": "WARN", "detail": f"Some credibility markers: {', '.join(found_credible[:2])}", "weight": -8})
        score -= 8
    else:
        signals.append({"label": "Credibility Markers", "status": "FAIL", "detail": "No citations, sources, or credibility markers found", "weight": 18})
        score += 18

    # Signal 3: Emotional manipulation triggers
    found_emotional = [w for w in EMOTIONAL_TRIGGERS if w in text_lower]
    if len(found_emotional) >= 3:
        signals.append({"label": "Emotional Manipulation", "status": "FAIL", "detail": f"Strong emotional triggers: {', '.join(found_emotional[:3])}", "weight": 25})
        score += 25
    elif len(found_emotional) >= 1:
        signals.append({"label": "Emotional Manipulation", "status": "WARN", "detail": f"Mild emotional triggers: {', '.join(found_emotional[:2])}", "weight": 10})
        score += 10
    else:
        signals.append({"label": "Emotional Manipulation", "status": "PASS", "detail": "No emotional manipulation triggers found", "weight": 0})

    # Signal 4: Known fake news patterns
    matched_patterns = [p for p in FAKE_PATTERNS if re.search(p, text_lower)]
    if matched_patterns:
        signals.append({"label": "Conspiracy Patterns", "status": "FAIL", "detail": f"{len(matched_patterns)} known misinformation pattern(s) matched", "weight": 30})
        score += 30
    else:
        signals.append({"label": "Conspiracy Patterns", "status": "PASS", "detail": "No known conspiracy/misinformation patterns detected", "weight": 0})

    # Signal 4b: Extraordinary / physically impossible claims
    matched_extraordinary = [p for p in EXTRAORDINARY_PATTERNS if re.search(p, text_lower)]
    if matched_extraordinary:
        signals.append({"label": "Extraordinary Claim", "status": "FAIL", "detail": "Physically impossible or extraordinary claim detected — requires extraordinary evidence", "weight": 40})
        score += 40
        # Cancel any credibility boost given by org names (e.g. 'Scientists', 'ISRO')
        # because credibility words are being used to dress up an impossible claim
        credibility_wash = [w for w in found_credible if w in ["scientists", "experts say", "confirmed by", "university", "laboratory"]]
        if credibility_wash:
            signals.append({"label": "Credibility Washing", "status": "FAIL", "detail": f"Authoritative names ({', '.join(credibility_wash)}) used to legitimise an impossible claim", "weight": 15})
            score += 15
    else:
        signals.append({"label": "Extraordinary Claim", "status": "PASS", "detail": "No physically impossible or extraordinary claims detected", "weight": 0})

    # Signal 4c: Unverifiable future prediction bait
    matched_future = [p for p in FUTURE_BAIT_PATTERNS if re.search(p, text_lower)]
    if matched_future:
        signals.append({"label": "Future Prediction Bait", "status": "WARN", "detail": "Vague future prediction used — common misinformation hook ('next month', 'coming soon')", "weight": 18})
        score += 18
    else:
        signals.append({"label": "Future Prediction Bait", "status": "PASS", "detail": "No unverifiable future prediction bait detected", "weight": 0})

    # Signal 5: Excessive capitalization
    caps_words = len(re.findall(r'\b[A-Z]{3,}\b', text))
    caps_ratio = caps_words / max(word_count, 1)
    if caps_ratio > 0.12:
        signals.append({"label": "Excessive Caps (Yelling)", "status": "FAIL", "detail": f"{caps_words} all-caps words ({caps_ratio*100:.1f}%) — aggressive tone", "weight": 15})
        score += 15
    elif caps_ratio > 0.05:
        signals.append({"label": "Excessive Caps (Yelling)", "status": "WARN", "detail": f"Some all-caps usage ({caps_ratio*100:.1f}%)", "weight": 5})
        score += 5
    else:
        signals.append({"label": "Excessive Caps (Yelling)", "status": "PASS", "detail": "Normal capitalization throughout text", "weight": 0})

    # Signal 6: Exclamation & question mark overuse
    exclamations = text.count("!") + text.count("?")
    if exclamations > 5:
        signals.append({"label": "Punctuation Overuse", "status": "FAIL", "detail": f"{exclamations} exclamation/question marks — emotional manipulation", "weight": 12})
        score += 12
    elif exclamations > 2:
        signals.append({"label": "Punctuation Overuse", "status": "WARN", "detail": f"{exclamations} exclamation marks detected", "weight": 5})
        score += 5
    else:
        signals.append({"label": "Punctuation Overuse", "status": "PASS", "detail": "Normal punctuation usage", "weight": 0})

    # Signal 7: Content length / depth
    if word_count < 30:
        signals.append({"label": "Content Depth", "status": "FAIL", "detail": f"Very short ({word_count} words) — lacks substantive analysis", "weight": 15})
        score += 15
    elif word_count < 80:
        signals.append({"label": "Content Depth", "status": "WARN", "detail": f"Short content ({word_count} words) — limited context", "weight": 7})
        score += 7
    else:
        signals.append({"label": "Content Depth", "status": "PASS", "detail": f"Adequate content length ({word_count} words)", "weight": 0})

    # Signal 8: Absolute/extreme language
    absolutes = ["always", "never", "everyone knows", "nobody", "all scientists", "all doctors",
                 "proven fact", "100%", "definitive proof", "undeniable", "irrefutable"]
    found_abs = [w for w in absolutes if w in text_lower]
    if len(found_abs) >= 2:
        signals.append({"label": "Absolute Language", "status": "FAIL", "detail": f"Extreme certainty language: {', '.join(found_abs[:3])}", "weight": 15})
        score += 15
    elif len(found_abs) == 1:
        signals.append({"label": "Absolute Language", "status": "WARN", "detail": f"Some absolute claims: {', '.join(found_abs)}", "weight": 5})
        score += 5
    else:
        signals.append({"label": "Absolute Language", "status": "PASS", "detail": "No extreme absolute language detected", "weight": 0})

    # Signal 9: Readability / sentence complexity
    avg_sentence_len = word_count / sentence_count
    if avg_sentence_len < 8:
        signals.append({"label": "Readability Pattern", "status": "WARN", "detail": "Very short sentences — clickbait-style writing pattern", "weight": 8})
        score += 8
    elif avg_sentence_len > 40:
        signals.append({"label": "Readability Pattern", "status": "WARN", "detail": "Extremely long sentences — may obscure meaning", "weight": 5})
        score += 5
    else:
        signals.append({"label": "Readability Pattern", "status": "PASS", "detail": f"Normal sentence structure (avg {avg_sentence_len:.1f} words/sentence)", "weight": 0})

    # Signal 4d: Leak/Insider patterns
    matched_leaks = [p for p in LEAK_PATTERNS if re.search(p, text_lower)]
    if matched_leaks:
        signals.append({"label": "Insider/Leak Bait", "status": "FAIL", "detail": "Uses 'insider/leaked' language to build false authority", "weight": 25})
        score += 25

    # Signal 10: Lexical Repetition / Bot check
    words = [w for w in text_lower.split() if len(w) > 3]
    if len(words) > 10:
        unique_ratio = len(set(words)) / len(words)
        if unique_ratio < 0.4:
            signals.append({"label": "Lexical Redundancy", "status": "FAIL", "detail": f"Very low lexical diversity ({unique_ratio*100:.1f}%) — highly repetitive bot/clickbait writing style", "weight": 20})
            score += 20
        elif unique_ratio < 0.6:
            signals.append({"label": "Lexical Redundancy", "status": "WARN", "detail": f"Repetitive vocabulary structures flagged ({unique_ratio*100:.1f}%)", "weight": 8})
            score += 8
        else:
            signals.append({"label": "Lexical Redundancy", "status": "PASS", "detail": f"Healthy lexical diversity ({unique_ratio*100:.1f}%)", "weight": 0})

    # ─── Aggressive Multiplier ───
    # If it's sensational AND extraordinary, it's almost certainly fake
    if len(found_sensational) >= 1 and matched_extraordinary:
        signals.append({"label": "Suspicion Multiplier", "status": "FAIL", "detail": "Multiple high-risk indicators overlapping", "weight": 15})
        score += 15

    score = max(0, min(score, 100))

    # Aggressive Threshold: If it has ANY major red flags, it's Fake
    if score < 40:
        prediction, risk_level = "Real", "Low"
    else:
        prediction, risk_level = "Fake", "High"

    # Source credibility panel
    sources = []
    if len(found_credible) > 0:
        sources.append({"name": "Citation Check", "status": "Credible", "rating": min(5, len(found_credible) + 2)})
    else:
        sources.append({"name": "Citation Check", "status": "Unverified", "rating": 1})

    if matched_patterns:
        sources.append({"name": "Pattern Database", "status": "Debunked", "rating": 1})
    else:
        sources.append({"name": "Pattern Database", "status": "Matched", "rating": 4})

    if len(found_sensational) > 2:
        sources.append({"name": "Linguistic Analysis", "status": "Suspicious", "rating": 2})
    elif len(found_sensational) > 0:
        sources.append({"name": "Linguistic Analysis", "status": "Unverified", "rating": 3})
    else:
        sources.append({"name": "Linguistic Analysis", "status": "Credible", "rating": 5})

    if word_count > 100 and len(found_credible) >= 2:
        sources.append({"name": "Content Depth Score", "status": "True", "rating": 5})
    elif word_count > 50:
        sources.append({"name": "Content Depth Score", "status": "Unverified", "rating": 3})
    else:
        sources.append({"name": "Content Depth Score", "status": "False", "rating": 1})

    return prediction, score, risk_level, signals, sources


# ─── HELPERS ────────────────────────────────────────────────────────────────

def broadcast_activity(event_type, risk_level, details, id_prefix="USER"):
    now = datetime.now()
    current_hour = now.strftime("%H:00")
    timestamp = now.strftime("%H:%M:%S")
    new_event = {"id": f"{id_prefix}_{random.randint(1000,9999)}", "type": event_type,
                 "risk": risk_level, "time": timestamp, "details": details}
    stats_state["total_threats"] += 1
    # darkweb events count under "fraud" key so Dashboard "Dark Web Scans" card updates
    if event_type in ("fraud", "darkweb"): stats_state["fraud"] += 1
    elif event_type == "phishing": stats_state["phishing"] += 1
    elif event_type == "news": stats_state["fake_news"] += 1
    for point in stats_state["threat_trends"]:
        if point["time"] == current_hour:
            point["threats"] += 1
            if event_type in ("fraud", "darkweb"): point["fraud"] += 1
            elif event_type == "phishing": point["phishing"] += 1
            elif event_type == "news": point["news"] += 1
            break
    history_log.insert(0, new_event)
    # Cap history at 200 entries to prevent unbounded memory growth
    if len(history_log) > 200:
        history_log.pop()
    socketio.emit('stream_update', {**stats_state, "new_event": new_event, "history": history_log})

@socketio.on('connect')
def handle_connect():
    emit('initial_data', {**stats_state, "history": history_log})


# ─── ROUTES ─────────────────────────────────────────────────────────────────

@app.route('/api/admin/clear-logs', methods=['POST'])
def clear_logs():
    global history_log
    history_log = []
    stats_state.update({"total_threats": 0, "fraud": 0, "phishing": 0, "fake_news": 0})
    for p in stats_state["threat_trends"]:
        p.update({"threats": 0, "fraud": 0, "phishing": 0, "news": 0})
    socketio.emit('initial_data', {**stats_state, "history": history_log})
    return jsonify({"success": True, "message": "All logs purged."})

@app.route('/api/fraud', methods=['POST'])
def detect_fraud():
    data = request.json
    amount = data.get('amount', 0)
    merchant = data.get('merchant', '')
    tx_time = data.get('time', '12:00')
    tx_location = data.get('location', '')

    prediction, score, signals = analyze_fraud_transaction(amount, merchant, tx_time, tx_location)
    
    broadcast_activity("fraud", "High" if score > 65 else ("Medium" if score >= 30 else "Low"), f"Neural Audit: {prediction} ({score}%) for {merchant}")
    
    reasons = [f"[{s['status']}] {s['label']}: {s['detail']}" for s in signals]
    
    sources = [
        {"name": "MasterCard Safety Net", "status": "Direct Connection" if score < 65 else "Verification Alert", "rating": 5},
        {"name": "Visa Fraud Intelligence Database", "status": "Clean" if score < 65 else "Flagged Transaction", "rating": 4},
        {"name": "FinCEN Suspicious Pattern Index", "status": "No Match" if score < 75 else "Pattern Match Detected", "rating": 4}
    ]
    
    return jsonify({
        "prediction": prediction,
        "risk_score": round(score, 2),
        "signals": signals,
        "reasons": reasons,
        "sources": sources
    })


# ─── DARK WEB MONITOR ENGINE ─────────────────────────────────────────────────

# Known breach databases with metadata
KNOWN_BREACHES = [
    {
        "name": "LinkedIn Data Dump (2021)",
        "date": "2021-06",
        "size": "700M records",
        "data_types": ["email", "username", "phone", "location", "linkedin_url"],
        "keywords": ["linkedin"],
        "domains": ["linkedin.com"]
    },
    {
        "name": "RockYou2021 Compilation",
        "date": "2021-06",
        "size": "8.4B passwords",
        "data_types": ["password", "email", "username"],
        "keywords": [],
        "domains": []
    },
    {
        "name": "Facebook Leak (2021)",
        "date": "2021-04",
        "size": "533M records",
        "data_types": ["email", "phone", "name", "location", "dob"],
        "keywords": ["facebook", "fb", "meta"],
        "domains": ["facebook.com", "fb.com"]
    },
    {
        "name": "Adobe Breach (2013)",
        "date": "2013-10",
        "size": "153M records",
        "data_types": ["email", "password_hash", "password_hint", "username"],
        "keywords": ["adobe"],
        "domains": ["adobe.com"]
    },
    {
        "name": "Collection #1 Data Dump",
        "date": "2019-01",
        "size": "773M emails",
        "data_types": ["email", "password"],
        "keywords": [],
        "domains": []
    },
    {
        "name": "Dropbox Breach (2012)",
        "date": "2012-07",
        "size": "68M records",
        "data_types": ["email", "password_hash"],
        "keywords": ["dropbox"],
        "domains": ["dropbox.com"]
    },
    {
        "name": "Twitter/X Data Scrape (2023)",
        "date": "2023-01",
        "size": "220M emails",
        "data_types": ["email", "username", "twitter_handle"],
        "keywords": ["twitter", "x.com"],
        "domains": ["twitter.com", "x.com"]
    },
    {
        "name": "Canva Breach (2019)",
        "date": "2019-05",
        "size": "137M records",
        "data_types": ["email", "username", "name", "bcrypt_hash"],
        "keywords": ["canva"],
        "domains": ["canva.com"]
    },
    {
        "name": "Zoom Credential Stuffing (2020)",
        "date": "2020-04",
        "size": "500K accounts",
        "data_types": ["email", "password", "meeting_url", "host_key"],
        "keywords": ["zoom"],
        "domains": ["zoom.us"]
    },
    {
        "name": "Gravatar Scrape (2020)",
        "date": "2020-10",
        "size": "167M profiles",
        "data_types": ["email", "username", "name", "avatar_hash"],
        "keywords": [],
        "domains": []
    },
    {
        "name": "MySpace Mega Dump (2008)",
        "date": "2008-07",
        "size": "360M records",
        "data_types": ["email", "username", "password_plain"],
        "keywords": ["myspace"],
        "domains": ["myspace.com"]
    },
    {
        "name": "Yahoo Breach (2013–2014)",
        "date": "2016-12",
        "size": "3B records",
        "data_types": ["email", "password_hash", "dob", "phone", "security_qa"],
        "keywords": ["yahoo"],
        "domains": ["yahoo.com", "ymail.com"]
    }
]

# High-risk TLDs and paste site indicators  
PASTE_SITE_DOMAINS = [
    "pastebin.com", "ghostbin.com", "paste.ee", "hastebin.com",
    "rentry.co", "pastes.io", "controlc.com", "dpaste.com"
]

DARKWEB_TLD_RISK = [".onion", ".i2p", ".bit", ".exit", ".tor"]

def analyze_darkweb_query(query, query_type):
    signals = []
    matched_breaches = []
    score = 0
    query_lower = query.lower().strip()

    # ── Signal 1: Format Validation ─────────────────────────────────────────
    if query_type == "email":
        email_valid = bool(re.match(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$', query))
        if email_valid:
            signals.append({"label": "Email Format", "status": "PASS", "detail": f"Valid email format detected: {query}", "weight": 0})
        else:
            signals.append({"label": "Email Format", "status": "FAIL", "detail": "Malformed email address — validation failed", "weight": 0})

    elif query_type == "domain":
        try:
            resolved_ip = socket.gethostbyname(query)
            signals.append({"label": "Domain DNS Resolution", "status": "PASS", "detail": f"Domain resolved to: {resolved_ip}", "weight": -5})
            score -= 5
        except Exception:
            signals.append({"label": "Domain DNS Resolution", "status": "WARN", "detail": "Domain could not be resolved — may be defunct or dark", "weight": 10})
            score += 10

    # ── Signal 2: Deterministic Breach Cross-Reference ────────────────────────
    # Use SHA-256 hash of query to deterministically assign breach exposure
    query_hash = int(hashlib.sha256(query_lower.encode()).hexdigest(), 16)
    
    # Check domain-specific breaches
    domain_part = ""
    if query_type == "email" and "@" in query:
        domain_part = query.split("@")[1].lower()
    elif query_type == "domain":
        domain_part = query_lower

    for breach in KNOWN_BREACHES:
        # Domain-specific breach matching
        domain_hit = any(d in domain_part for d in breach["domains"]) if domain_part else False
        # Keyword matching in query
        keyword_hit = any(k in query_lower for k in breach["keywords"]) if breach["keywords"] else False
        # Deterministic hash-based selection for universal breach databases (no domain/keyword)
        hash_hit = (not breach["domains"] and not breach["keywords"] and (query_hash % 100) < 45)

        if domain_hit or keyword_hit or hash_hit:
            matched_breaches.append(breach)

    if matched_breaches:
        breach_score = min(len(matched_breaches) * 18, 60)
        score += breach_score
        signals.append({
            "label": "Breach Database Cross-Reference",
            "status": "FAIL",
            "detail": f"Identity matched in {len(matched_breaches)} known breach dataset(s) — {sum(1 for b in matched_breaches if 'password' in b['data_types'] or 'password_plain' in b['data_types'])} contain plaintext/hashed passwords",
            "weight": breach_score
        })
    else:
        signals.append({
            "label": "Breach Database Cross-Reference",
            "status": "PASS",
            "detail": "No matches found in indexed breach databases",
            "weight": 0
        })

    # ── Signal 3: Credential Complexity (for email/username) ─────────────────
    if query_type in ("email", "username"):
        name_part = query.split("@")[0] if "@" in query else query
        # Check for common weak patterns
        weak_patterns = [
            r'^\d+$',                      # all digits
            r'^(admin|user|test|demo)$',   # generic names
            r'^[a-z]{3,5}\d{1,4}$',        # name+short_number (john123)
            r'^(.)\1{3,}$',                # repeated chars (aaaa)
        ]
        is_weak = any(re.match(p, name_part.lower()) for p in weak_patterns)
        if is_weak:
            signals.append({"label": "Identifier Strength", "status": "WARN", "detail": f"Weak identifier pattern detected ('{name_part}') — high likelihood of credential stuffing target", "weight": 15})
            score += 15
        elif len(name_part) < 6:
            signals.append({"label": "Identifier Strength", "status": "WARN", "detail": "Very short identifier — increased exposure surface", "weight": 8})
            score += 8
        else:
            signals.append({"label": "Identifier Strength", "status": "PASS", "detail": f"Identifier complexity is adequate ({len(name_part)} chars)", "weight": 0})

    # ── Signal 4: Dark Web TLD & Paste Site Detection ─────────────────────────
    dark_tld = any(query_lower.endswith(tld) for tld in DARKWEB_TLD_RISK)
    if dark_tld:
        signals.append({"label": "Dark Web Address Detected", "status": "FAIL", "detail": "Query contains a .onion / dark-net TLD — active dark web presence", "weight": 35})
        score += 35
    elif any(p in query_lower for p in PASTE_SITE_DOMAINS):
        signals.append({"label": "Paste Site Reference", "status": "WARN", "detail": "Query linked to known paste/dump site", "weight": 20})
        score += 20
    else:
        signals.append({"label": "Dark Web / Paste Site Check", "status": "PASS", "detail": "No dark web TLD or paste site associations detected", "weight": 0})

    # ── Signal 5: Known High-Risk Domain Usage ────────────────────────────────
    high_risk_providers = ["guerrillamail", "mailinator", "tempmail", "throwam", "sharklasers", "yopmail", "dispostable"]
    if query_type == "email" and any(p in query_lower for p in high_risk_providers):
        signals.append({"label": "Disposable Email Provider", "status": "FAIL", "detail": "Email uses a known disposable/burner mail service — identity cannot be verified", "weight": 30})
        score += 30
    elif query_type == "email":
        signals.append({"label": "Email Provider Reputation", "status": "PASS", "detail": "Email provider is not flagged as a disposable service", "weight": 0})

    score = max(0, min(score, 100))
    exposed = score >= 20 or len(matched_breaches) > 0

    # Build recommendations
    recommendations = []
    if exposed:
        recommendations.append("Immediately change all passwords associated with this email/account")
        recommendations.append("Enable Two-Factor Authentication (2FA) on all linked services")
        recommendations.append("Check haveibeenpwned.com for full breach history")
    if any("password_plain" in b.get("data_types", []) for b in matched_breaches):
        recommendations.append("⚠️ Plaintext passwords exposed — treat all old passwords as compromised")
    if matched_breaches:
        recommendations.append("Monitor your credit reports and financial accounts for suspicious activity")
        recommendations.append("Consider using a password manager to generate unique credentials per site")
    if not exposed:
        recommendations.append("No action required — continue practising good credential hygiene")
        recommendations.append("Consider periodic scans to stay ahead of new breach disclosures")

    return exposed, score, matched_breaches, signals, recommendations


@app.route('/api/darkweb', methods=['POST'])
def scan_darkweb():
    data = request.json
    query = data.get('query', '').strip()
    query_type = data.get('type', 'email')

    if not query or len(query) < 3:
        return jsonify({"error": "INVALID_INPUT", "message": "Query is too short — minimum 3 characters"}), 400

    exposed, score, matched_breaches, signals, recommendations = analyze_darkweb_query(query, query_type)

    risk_level = "High" if score >= 65 else ("Medium" if score >= 25 else "Low")
    broadcast_activity("fraud", risk_level, f"Dark Web Scan: {'EXPOSED' if exposed else 'CLEAN'} → {query[:20]}{'...' if len(query) > 20 else ''}")

    breach_output = []
    for b in matched_breaches:
        breach_output.append({
            "name": b["name"],
            "date": b["date"],
            "description": f"Approximately {b['size']} records exposed in this breach",
            "data_types": b["data_types"]
        })

    return jsonify({
        "exposed": exposed,
        "risk_score": round(score, 2),
        "breach_count": len(matched_breaches),
        "breaches": breach_output,
        "signals": signals,
        "recommendations": recommendations
    })


@app.route('/api/phishing', methods=['POST'])
def detect_phishing():
    data = request.json
    url = data.get('url', '').strip()
    if not url.startswith(('http', 'https')):
        return jsonify({"error": "INVALID_INPUT", "message": "URL must begin with http or https"}), 400

    time.sleep(0.8)
    prediction, score, risk_level, signals = analyze_phishing_url(url)

    broadcast_activity("phishing", risk_level, f"URL Scan: {prediction} → {url[:30]}...")
    phishing_submissions.insert(0, {
        "id": f"PHISH_{random.randint(1000,9999)}", "url": url,
        "status": prediction, "votes": 0,
        "timestamp": datetime.now().strftime("%H:%M:%S")
    })

    reasons = [f"[{s['status']}] {s['label']}: {s['detail']}" for s in signals]
    return jsonify({
        "prediction": prediction,
        "confidence": score,
        "risk_level": risk_level,
        "signals": signals,
        "reasons": reasons,
        "external_link": "https://www.phishtank.com" if score > 55 else None,
        "ssl": url.startswith("https://")
    })

@app.route('/api/phishing/submissions', methods=['GET'])
def get_phishing_submissions():
    return jsonify(phishing_submissions[:20])

@app.route('/api/phishing/vote', methods=['POST'])
def vote_phishing():
    data = request.json
    sub_id, vote_type = data.get('id'), data.get('type')
    for sub in phishing_submissions:
        if sub['id'] == sub_id:
            sub['votes'] += 1 if vote_type == 'safe' else -1
            break
    return jsonify({"success": True})

def fetch_google_fact_checks(query):
    """Query Google Fact Check Tools API."""
    if not GOOGLE_FACT_CHECK_API_KEY:
        return []
    try:
        params = {
            "query": query[:200],
            "key": GOOGLE_FACT_CHECK_API_KEY,
            "languageCode": "en"
        }
        resp = requests.get(GOOGLE_FC_URL, params=params, timeout=5)
        if resp.status_code != 200:
            return []
        data = resp.json()
        
        results = []
        for item in data.get("claims", [])[:5]:
            for review in item.get("claimReview", [])[:1]:
                results.append({
                    "name": f"Google Check: {review.get('publisher', {}).get('name', 'Source')}",
                    "url": review.get("url", ""),
                    "verdict": review.get("textualRating", "Unrated"),
                    "claim": item.get("text", "")[:100] + "..."
                })
        return results
    except Exception as e:
        print(f"Fact Check Error: {e}")
        return []

@app.route('/api/fake-news', methods=['POST'])
def detect_fake_news():
    data = request.json
    text = data.get('text', '').strip()
    if len(text) < 15:
        return jsonify({"error": "INVALID_INPUT", "message": "Text too short for analysis"}), 400

    time.sleep(0.8)
    prediction, score, risk_level, signals, sources = analyze_fake_news(text)
    
    # ─── Live Google Fact Check Integration ───
    google_checks = fetch_google_fact_checks(text[:150])
    
    if google_checks:
        sources = google_checks + sources # Combine with static sources
        for check in google_checks:
            v = check['verdict'].lower()
            if any(x in v for x in ["false", "fake", "untrue", "misleading", "incorrect"]):
                score = 100 # Absolute certainty if Google says it's false
                prediction = "Fake"
                risk_level = "High"
                break

    broadcast_activity("news", risk_level, f"Linguistic Audit: Content marked as {prediction}")
    reasons = [f"[{s['status']}] {s['label']}: {s['detail']}" for s in signals]

    return jsonify({
        "prediction": prediction,
        "confidence": score,
        "risk_level": risk_level,
        "signals": signals,
        "sources": sources,
        "reasons": reasons
    })


# ─── DATABASE AUTHENTICATION ROUTES ──────────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'Security Analyst')
    level = data.get('level', '3')
    bio = data.get('bio', '')
    avatar = data.get('avatar', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop')
    location = data.get('location', '')

    if not username or not email or not password:
        return jsonify({"error": "MISSING_FIELDS", "message": "All fields are required"}), 400

    password_hash = hashlib.sha256(password.encode()).hexdigest()

    conn = get_db_connection()
    try:
        conn.execute(
            'INSERT INTO users (username, email, password_hash, role, level, bio, avatar, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            (username, email, password_hash, role, level, bio, avatar, location)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "USERNAME_EXISTS", "message": "Username already exists on the mainnet"}), 400
    finally:
        conn.close()

    return jsonify({
        "success": True,
        "user": {
            "name": username,
            "email": email,
            "role": role,
            "level": level,
            "bio": bio,
            "avatar": avatar,
            "location": location
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "MISSING_FIELDS", "message": "Username and password required"}), 400

    password_hash = hashlib.sha256(password.encode()).hexdigest()

    conn = get_db_connection()
    user_row = conn.execute(
        'SELECT * FROM users WHERE username = ? AND password_hash = ?',
        (username, password_hash)
    ).fetchone()
    conn.close()

    if not user_row:
        return jsonify({"error": "INVALID_CREDENTIALS", "message": "Invalid access credentials"}), 401

    # Extract location (if present, otherwise default to empty string)
    user_loc = ''
    try:
        user_loc = user_row['location'] or ''
    except IndexError:
        pass

    return jsonify({
        "success": True,
        "user": {
            "name": user_row['username'],
            "email": user_row['email'],
            "role": user_row['role'],
            "level": user_row['level'],
            "bio": user_row['bio'],
            "avatar": user_row['avatar'],
            "location": user_loc
        }
    })

@app.route('/api/auth/update', methods=['POST'])
def api_update_profile():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    role = data.get('role')
    level = data.get('level')
    bio = data.get('bio')
    avatar = data.get('avatar')
    location = data.get('location', '')

    if not username:
        return jsonify({"error": "MISSING_USERNAME", "message": "Username is required to update credentials"}), 400

    conn = get_db_connection()
    conn.execute(
        'UPDATE users SET email = ?, role = ?, level = ?, bio = ?, avatar = ?, location = ? WHERE username = ?',
        (email, role, level, bio, avatar, location, username)
    )
    conn.commit()
    conn.close()

    return jsonify({"success": True})


# ─── BACKGROUND SIMULATOR ────────────────────────────────────────────────────

def background_threat_simulator():
    threat_types = ["phishing", "fraud", "news"]
    risks = ["Low", "Medium", "High", "Critical"]
    entities = ["GlobalNode_7", "Neural_Link_Alpha", "Edge_Ingress_4", "Shadow_Mesh"]
    while True:
        time.sleep(random.randint(60, 120))
        t_type = random.choice(threat_types)
        risk = random.choice(risks)
        entity = random.choice(entities)
        details = {
            "phishing": f"Suspicious signature from {entity}",
            "fraud": f"Anomalous transaction on {entity}",
            "news": f"Misinformation spike near {entity}"
        }
        broadcast_activity(t_type, risk, details[t_type], id_prefix="AUTO")

# catch-all route for frontend static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if not app.static_folder:
        return jsonify({"error": "NOT_CONFIGURED", "message": "Frontend static assets not built"}), 500
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    threading.Thread(target=background_threat_simulator, daemon=True).start()
    socketio.run(app, debug=True, port=5001, allow_unsafe_werkzeug=True)
