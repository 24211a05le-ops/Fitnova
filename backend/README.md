# Gym Progress Intelligence System - REST API Backend

This is the production-ready REST API backend for the **Gym Progress Intelligence System (Fitnova)**. Built using Flask and following professional MVC controller-service-routing separation, it offers a secure, validated database mapping and session handling framework.

---

## 🚀 Technology Stack

* **Core**: Python & Flask (App Factory Pattern)
* **Authentication**: Flask-JWT-Extended (JSON Web Tokens)
* **Security & Encryption**: bcrypt (Secure password hashing)
* **Database & ORM**: Flask-SQLAlchemy (PostgreSQL-ready schemas, running SQLite locally)
* **Cross-Origin Requests**: Flask-CORS

---

## 📂 Backend Directory Structure

```
backend/
├── app/
│   ├── config/
│   │   └── config.py        # Centralized configurations (SQLite/PostgreSQL, JWT)
│   ├── models/
│   │   ├── __init__.py      # Models aggregator namespace
│   │   ├── user.py          # User vital stats and password hashing
│   │   ├── workout.py       # Workout telemetry schema
│   │   └── progress.py      # Physical progress checkpoint schema
│   ├── utils/
│   │   └── responses.py     # Standardized JSON response formatters
│   ├── controllers/
│   │   ├── auth_controller.py      # Registration, Login, Logout actions
│   │   ├── user_controller.py      # Profile management actions
│   │   ├── workout_controller.py   # Workouts CRUD actions
│   │   ├── progress_controller.py  # Biometrics progress CRUD actions
│   │   └── dashboard_controller.py # Dashboard metrics aggregator
│   ├── routes/
│   │   ├── __init__.py      # Blueprints aggregator namespace
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   ├── workout_routes.py
│   │   ├── progress_routes.py
│   │   ├── dashboard_routes.py
│   │   ├── prediction_routes.py    # Mock biomechanics trajectory forecaster
│   │   └── diet_routes.py          # Mock AI daily meal menu generator
│   ├── middleware/
│   │   └── auth_middleware.py      # Telemetry logging & Centralized error handler
│   └── __init__.py          # Main Flask App Factory, Extensions, and DB bootstrap
├── venv/                    # Local Python virtual environment
├── run.py                   # Application launcher script
├── requirements.txt         # Package dependency lock list
├── .env.example             # Configuration variables template
└── .env                     # Local active environment variables (created)
```

---

## 📝 Standardized API Response Structure

All endpoint responses automatically follow a standardized JSON format:

### Success Response (Status 200/201):
```json
{
  "success": true,
  "message": "Workout record synchronized successfully with backend database",
  "data": {
    "id": 1,
    "workout_name": "Push Day: Chest & Triceps",
    "exercise_name": "Incline Bench Press",
    "sets": 3,
    "reps": 10,
    "calories_burned": 350,
    "duration": 45
  }
}
```

### Error Response (Status 400/401/409/500):
```json
{
  "success": false,
  "message": "Invalid email address or password. Please try again.",
  "data": {}
}
```

---

## 🔒 Complete REST API Endpoints Registry

All protected endpoints require your JWT token inside the request headers as: `Authorization: Bearer <your_jwt_token_here>`.

### 1. Authentication Module (`/api/auth`)
* `POST /api/auth/register` - Create account & input onboarding physical stats.
* `POST /api/auth/login` - Verify credentials and receive JWT session access token.
* `POST /api/auth/logout` - Invalidate current session (placeholder).

### 2. User Profile Module (`/api`)
* `GET /api/profile` *(Protected)* - Load user biological statistics.
* `PUT /api/profile` *(Protected)* - Edit user weight, height, age, or goals.
* `DELETE /api/profile` *(Protected)* - Permanently delete account and all logged workouts.

### 3. Workout Logging Module (`/api/workouts`)
* `POST /api/workouts` *(Protected)* - Log a new exercise (workout_name, exercise_name, sets, reps, duration).
* `GET /api/workouts` *(Protected)* - Fetch all logged workouts.
* `GET /api/workouts/<id>` *(Protected)* - Fetch a specific workout's details.
* `PUT /api/workouts/<id>` *(Protected)* - Update an existing workout log.
* `DELETE /api/workouts/<id>` *(Protected)* - Remove a workout log.

### 4. Progress Telemetry Module (`/api/progress`)
* `POST /api/progress` *(Protected)* - Record a body weight/body fat checkpoint.
* `GET /api/progress` *(Protected)* - Fetch all historical progress checkpoints.
* `PUT /api/progress/<id>` *(Protected)* - Update a progress checkpoint.
* `DELETE /api/progress/<id>` *(Protected)* - Delete a progress checkpoint.

### 5. Analytics Dashboard Module (`/api/dashboard`)
* `GET /api/dashboard` *(Protected)* - Compiles total workouts count, cumulative calorie burn, latest biometrics, and weekly/monthly chart timelines.

### 6. Simulated Intelligent Core APIs
These endpoints are optimized for direct integration with the frontend, running fast, deterministic algorithms on the backend without heavy server overhead.
* `POST /api/predict` *(Protected)* - Forecast weight and muscle changes over 12 weeks based on goals.
* `POST /api/diet/generate` *(Protected)* - Compile a full 4-meal plan, daily calories target, and macros based on diet preferences.

---

## 🚀 Setup & Execution Guide

Follow these quick commands to spin up the local Flask REST API server:

### 1. Navigate to the backend directory:
```bash
cd backend
```

### 2. Activate the Python virtual environment:
* **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
* **macOS / Linux**:
  ```bash
  source venv/bin/activate
  ```

### 3. Install dependencies:
```bash
pip install -r requirements.txt
```

### 4. Start the Flask application launcher:
```bash
python run.py
```

*The Flask server is now live at [http://127.0.0.1:5000](http://127.0.0.1:5000). The local SQLite database (`instance/gym.db`) will auto-bootstrap on startup!*
