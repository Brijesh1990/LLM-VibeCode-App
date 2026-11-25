"""
Verification script for Vercel Serverless Function & Environment Setup.
Tests the api/index.py entry point, router resolution, and environment variables.
"""
import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))

from fastapi.testclient import TestClient
from api.index import app

client = TestClient(app)

print("=" * 60)
print("  NEXUSLMS VERCEL SERVERLESS CONFIGURATION TEST")
print("=" * 60)

# 1. Test Serverless Root / Health Endpoint
health_res = client.get("/api/v1/health")
print(f"[1/4] Health Check (/api/v1/health): Status {health_res.status_code}")
assert health_res.status_code == 200, f"Expected 200, got {health_res.status_code}"
health_data = health_res.json()
print(f"      App: {health_data.get('app_name')} | DB Status: {health_data.get('database')}")

# 2. Test Public Overview (Dynamic Courses)
overview_res = client.get("/api/v1/public/overview")
print(f"[2/4] Public Overview (/api/v1/public/overview): Status {overview_res.status_code}")
assert overview_res.status_code == 200, f"Expected 200, got {overview_res.status_code}"
overview_data = overview_res.json()
courses = overview_data.get("courses", [])
print(f"      Dynamic Courses Loaded: {len(courses)}")
for c in courses[:2]:
    print(f"      - {c.get('course_code')}: {c.get('title')}")

# 3. Test Payment Gateway Configuration Endpoint
gw_res = client.get("/api/v1/payments/gateway/config")
print(f"[3/4] Payment Gateway Config (/api/v1/payments/gateway/config): Status {gw_res.status_code}")
assert gw_res.status_code == 200, f"Expected 200, got {gw_res.status_code}"
gw_data = gw_res.json()
print(f"      Gateway: {gw_data.get('gateway')} | Key: {gw_data.get('key_id')} | Test Mode: {gw_data.get('test_mode')}")

# 4. Test API Discovery Root
root_res = client.get("/api/v1")
print(f"[4/4] API Index (/api/v1): Status {root_res.status_code}")
assert root_res.status_code == 200, f"Expected 200, got {root_res.status_code}"

print("=" * 60)
print("  ALL VERCEL SERVERLESS CHECKS PASSED SUCCESSFULLY!")
print("=" * 60)
