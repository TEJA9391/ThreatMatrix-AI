#!/usr/bin/env python3
"""
ThreatMatrix Backend — Quick Setup & Run Script
Run: python setup.py
"""
import os, subprocess, sys

def run(cmd, **kw):
    print(f"\n$ {cmd}")
    subprocess.run(cmd, shell=True, check=True, **kw)

if __name__ == "__main__":
    print("=" * 55)
    print("  ThreatMatrix AI Backend — Setup")
    print("=" * 55)

    # 1. Install deps
    run(f"{sys.executable} -m pip install -r requirements.txt")

    # 2. Download spaCy model
    run(f"{sys.executable} -m spacy download en_core_web_sm")

    # 3. Copy .env if not exists
    if not os.path.exists(".env") and os.path.exists(".env.example"):
        import shutil
        shutil.copy(".env.example", ".env")
        print("\n⚠️  .env created from template — fill in your API keys!")

    print("\n✅ Setup complete!")
    print("\nTo start the server:")
    print("   python main.py")
    print("   → API running at http://localhost:8000")
    print("   → Docs at http://localhost:8000/docs")
