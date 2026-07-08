# ThreatMatrix — AI Fake News Detection System

## Project Structure
```
ai+cyber/
├── threatmatrix/          ← React Frontend (port 5174)
│   └── src/
│       ├── pages/
│       │   ├── Analysis.jsx     ← Main AI analyzer
│       │   ├── Dashboard.jsx    ← Analytics charts
│       │   ├── History.jsx      ← Past detections
│       │   └── Trending.jsx     ← Live misinformation feed
│       └── components/
│           └── Layout.jsx
│
└── threatmatrix-backend/  ← FastAPI Backend (port 8000)
    ├── main.py            ← FastAPI app + all routes
    ├── services/
    │   ├── nlp_engine.py  ← RoBERTa + spaCy + Sentence-Transformers
    │   └── verification.py ← Google Fact Check + NewsAPI + Wikipedia
    ├── database/
    │   └── mongodb.py     ← Motor async MongoDB
    ├── requirements.txt
    ├── setup.py           ← One-click setup
    └── .env               ← API keys (copy from .env.example)
```

## Quick Start

### Backend
```powershell
cd threatmatrix-backend
python setup.py           # Install deps + spaCy model
# Fill in .env with your API keys
python main.py            # Starts at http://localhost:8000
```

### Frontend
```powershell
cd threatmatrix
npm install
npm run dev               # Starts at http://localhost:5174
```

## Free API Keys Needed
| API | Get at | Free tier |
|-----|--------|-----------|
| Google Fact Check | console.cloud.google.com → "Fact Check Tools API" | Free |
| NewsAPI | newsapi.org/register | 100 req/day |
| MongoDB Atlas | mongodb.com/atlas | M0 free cluster |

## AI Models Used
- **RoBERTa** (`hamzab/roberta-fake-news-classification`) — fake news classification
- **DistilBERT** (`distilbert-base-uncased-finetuned-sst-2-english`) — sentiment
- **all-MiniLM-L6-v2** — semantic similarity
- **spaCy en_core_web_sm** — NER, claim extraction

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Full AI analysis pipeline |
| GET | `/api/history` | Past analyses |
| GET | `/api/stats` | Dashboard analytics |
| GET | `/api/trending` | Live misinformation feed |
| GET | `/docs` | Interactive Swagger UI |
