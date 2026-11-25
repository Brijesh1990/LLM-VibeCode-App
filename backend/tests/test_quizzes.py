"""Tests for Quizzes, Hiding is_correct from Students, Attempt Start, Server-Side Scoring, and Duplicate Submission Prevention."""
from fastapi.testclient import TestClient


def test_quiz_creation_answer_hiding_server_scoring_and_duplicate_prevention(
    client: TestClient,
    instructor_headers: dict,
    student_headers: dict,
):
    # Instructor creates a quiz with 2 MCQ questions (total 30 marks, passing 15)
    create_res = client.post(
        "/api/v1/quizzes",
        headers=instructor_headers,
        json={
            "course_id": 1,
            "batch_id": 1,
            "title": "FastAPI & SQLAlchemy Security Assessment",
            "description": "Validates JWT, RBAC, and ORM concepts.",
            "instructions": "Select the single best answer for each question.",
            "total_marks": 30.0,
            "passing_marks": 15.0,
            "duration_minutes": 20,
            "max_attempts": 1,
            "allow_retake": False,
            "status": "published",
            "questions": [
                {
                    "question_text": "Which HTTP status code indicates an authenticated user lacks permission?",
                    "question_type": "mcq",
                    "marks": 15.0,
                    "explanation": "HTTP 403 Forbidden is returned when RBAC denies access.",
                    "sort_order": 1,
                    "options": [
                        {"option_text": "401 Unauthorized", "is_correct": False, "sort_order": 1},
                        {"option_text": "403 Forbidden", "is_correct": True, "sort_order": 2},
                        {"option_text": "404 Not Found", "is_correct": False, "sort_order": 3},
                    ],
                },
                {
                    "question_text": "Which algorithm is used to hash user passwords in NexusLMS?",
                    "question_type": "mcq",
                    "marks": 15.0,
                    "explanation": "Bcrypt with 12 salt rounds is used for password hashing.",
                    "sort_order": 2,
                    "options": [
                        {"option_text": "Plaintext Base64", "is_correct": False, "sort_order": 1},
                        {"option_text": "Bcrypt (12 rounds)", "is_correct": True, "sort_order": 2},
                        {"option_text": "CRC32", "is_correct": False, "sort_order": 3},
                    ],
                },
            ],
        },
    )
    assert create_res.status_code == 201
    quiz_admin_view = create_res.json()
    quiz_id = quiz_admin_view["id"]
    assert quiz_admin_view["total_marks"] == 30.0
    assert len(quiz_admin_view["questions"]) == 2

    # Instructor GET includes is_correct
    ins_get = client.get(f"/api/v1/quizzes/{quiz_id}", headers=instructor_headers)
    assert ins_get.status_code == 200
    assert "is_correct" in ins_get.json()["questions"][0]["options"][0]

    # Student GET hides is_correct and explanation prior to submission
    stu_get = client.get(f"/api/v1/quizzes/{quiz_id}", headers=student_headers)
    assert stu_get.status_code == 200
    for q in stu_get.json()["questions"]:
        assert q["explanation"] == ""
        for opt in q["options"]:
            assert "is_correct" not in opt

    # Student starts quiz attempt
    start_res = client.post(f"/api/v1/quizzes/{quiz_id}/start", headers=student_headers)
    assert start_res.status_code == 200
    start_data = start_res.json()
    attempt_id = start_data["attempt"]["id"]
    assert start_data["attempt"]["status"] == "in_progress"
    # Verify quiz payload inside /start also hides is_correct
    for q in start_data["quiz"]["questions"]:
        for opt in q["options"]:
            assert "is_correct" not in opt

    # Identify correct option for Q1 and wrong option for Q2 from instructor view to test server-side scoring
    q1 = quiz_admin_view["questions"][0]
    q2 = quiz_admin_view["questions"][1]
    q1_correct_opt_id = next(o["id"] for o in q1["options"] if o["is_correct"])
    q2_wrong_opt_id = next(o["id"] for o in q2["options"] if not o["is_correct"])

    # Submit attempt: 1 correct (15 marks) + 1 wrong (0 marks) => 15/30 (50.0%, is_passed=True)
    submit_res = client.post(
        f"/api/v1/quizzes/attempts/{attempt_id}/submit",
        headers=student_headers,
        json={
            "answers": [
                {"question_id": q1["id"], "selected_option_id": q1_correct_opt_id},
                {"question_id": q2["id"], "selected_option_id": q2_wrong_opt_id},
            ]
        },
    )
    assert submit_res.status_code == 200
    graded = submit_res.json()
    assert graded["status"] == "evaluated"
    assert graded["total_marks"] == 30.0
    assert graded["obtained_marks"] == 15.0
    assert graded["percentage"] == 50.0
    assert graded["is_passed"] is True

    # Duplicate submission of the same attempt is prevented with 409 Conflict
    dup_submit = client.post(
        f"/api/v1/quizzes/attempts/{attempt_id}/submit",
        headers=student_headers,
        json={
            "answers": [
                {"question_id": q1["id"], "selected_option_id": q1_correct_opt_id},
            ]
        },
    )
    assert dup_submit.status_code == 409

    # Starting a new attempt when max_attempts=1 and allow_retake=False is prevented with 409 Conflict
    retake_res = client.post(f"/api/v1/quizzes/{quiz_id}/start", headers=student_headers)
    assert retake_res.status_code == 409
