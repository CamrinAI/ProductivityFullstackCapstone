#!/usr/bin/env bash
set -euo pipefail
BASE_URL=${BASE_URL:-http://localhost:3000}

# Helpers
json() { python3 - <<'PY'
import sys, json
print(json.dumps(json.loads(sys.stdin.read()), indent=2))
PY
}

echo "=== Register User A ==="
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{"username":"userA","email":"userA@example.com","password":"demo123"}' | tee /tmp/regA.json | json
TOKEN_A=$(python3 -c "import json; print(json.load(open('/tmp/regA.json'))['access_token'])")

echo "=== Register User B ==="
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{"username":"userB","email":"userB@example.com","password":"demo123"}' | tee /tmp/regB.json | json
TOKEN_B=$(python3 -c "import json; print(json.load(open('/tmp/regB.json'))['access_token'])")

echo "=== Create Asset for User A ==="
ASSET_A=$(curl -s -X POST "$BASE_URL/api/assets" \
  -H "Authorization: Bearer $TOKEN_A" -H 'Content-Type: application/json' \
  -d '{"name":"Milwaukee Drill Kit","asset_type":"power_tool","location":"Warehouse"}')
echo "$ASSET_A" | json > /tmp/assetA.json
ASSET_ID_A=$(python3 -c "import json; print(json.load(open('/tmp/assetA.json'))['asset']['id'])")

echo "=== Auth Gate: User B tries to get User A's asset ==="
curl -s -i "$BASE_URL/api/assets/$ASSET_ID_A" -H "Authorization: Bearer $TOKEN_B" | sed -n '1,20p'

echo "=== Materials CRUD (User A) ==="
MAT_CREATE=$(curl -s -X POST "$BASE_URL/api/assets/materials" \
  -H "Authorization: Bearer $TOKEN_A" -H 'Content-Type: application/json' \
  -d '{"name":"Romex 12-2","unit":"spool","quantity":5,"min_stock":2}')
echo "$MAT_CREATE" | json > /tmp/materialA.json
MAT_ID_A=$(python3 -c "import json; print(json.load(open('/tmp/materialA.json'))['material']['id'])")

echo "=== Update Material Quantity (User A) ==="
curl -s -X PUT "$BASE_URL/api/assets/materials/$MAT_ID_A" \
  -H "Authorization: Bearer $TOKEN_A" -H 'Content-Type: application/json' \
  -d '{"quantity":8}' | json

echo "=== Pagination Test (User A) ==="
curl -s "$BASE_URL/api/assets?page=1&per_page=10" -H "Authorization: Bearer $TOKEN_A" | json

echo "=== Delete Material (User A) ==="
curl -s -X DELETE "$BASE_URL/api/assets/materials/$MAT_ID_A" -H "Authorization: Bearer $TOKEN_A" | json

echo "=== Delete Asset (User A) ==="
curl -s -X DELETE "$BASE_URL/api/assets/$ASSET_ID_A" -H "Authorization: Bearer $TOKEN_A" | json

echo "All tests executed. Review outputs above."