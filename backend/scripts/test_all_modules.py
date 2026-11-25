import requests

BASE = 'http://localhost:5173/api/v1'  # Testing through Vite proxy!
print('=== Testing via Vite Proxy (http://localhost:5173/api/v1) ===')

# 1. Health & Database
h = requests.get(f'{BASE}/health').json()
print('[OK] Health:', h.get('status'), '| Database:', h.get('database'))

# 2. Public Overview (Dynamic Courses / Programmes List)
ov = requests.get(f'{BASE}/public/overview').json()
courses = ov.get('courses', [])
print(f'[OK] Public Overview: {len(courses)} published courses loaded dynamically from database:')
for c in courses:
    print(f"   - {c['course_code']}: {c['title']} (${c['fee']})")

# 3. Gateway Config
gw = requests.get(f'{BASE}/payments/gateway/config').json()
print('[OK] Payment Gateway Config:', gw)

# 4. Auth Tests
users = [
    ('admin@lms.com', 'Admin@123', 'admin'),
    ('instructor@lms.com', 'Instructor@123', 'instructor'),
    ('student@lms.com', 'Student@123', 'student'),
]
tokens = {}
for email, pwd, role in users:
    r = requests.post(f'{BASE}/auth/login', json={'email': email, 'password': pwd})
    assert r.status_code == 200, f'Login failed for {email}'
    tokens[role] = r.json()['access_token']
    print(f'[OK] Login success for {role} ({email})')

admin_hdr = {'Authorization': f"Bearer {tokens['admin']}"}
stu_hdr = {'Authorization': f"Bearer {tokens['student']}"}
ins_hdr = {'Authorization': f"Bearer {tokens['instructor']}"}

# 5. Test All Modules
endpoints = [
    ('Categories', f'{BASE}/categories', None),
    ('Courses', f'{BASE}/courses', None),
    ('Batches', f'{BASE}/batches', admin_hdr),
    ('Enrollments', f'{BASE}/enrollments', stu_hdr),
    ('Lectures', f'{BASE}/lectures', stu_hdr),
    ('Materials', f'{BASE}/materials', stu_hdr),
    ('Assignments', f'{BASE}/assignments', stu_hdr),
    ('Quizzes', f'{BASE}/quizzes', stu_hdr),
    ('Attendance', f'{BASE}/attendance', stu_hdr),
    ('Progress', f'{BASE}/progress', stu_hdr),
    ('Certificates', f'{BASE}/certificates', stu_hdr),
    ('Payments', f'{BASE}/payments', stu_hdr),
    ('Announcements', f'{BASE}/announcements', stu_hdr),
    ('Notifications', f'{BASE}/notifications', stu_hdr),
    ('Reports Dashboard', f'{BASE}/reports/dashboard', admin_hdr),
]

print('\n=== Verifying All 15 Core Modules ===')
for name, url, hdr in endpoints:
    resp = requests.get(url, headers=hdr)
    assert resp.status_code == 200, f'Failed {name}: {resp.status_code} {resp.text}'
    data = resp.json()
    count = data.get('total') if isinstance(data, dict) and 'total' in data else (len(data.get('items', [])) if isinstance(data, dict) and 'items' in data else 'OK')
    print(f'[OK] {name:<18} -> 200 OK (count/status: {count})')

print('\n=== All tests passed with flying colors! ===')
