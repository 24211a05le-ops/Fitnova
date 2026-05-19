from app.routes.auth_routes import auth_bp
from app.routes.user_routes import user_bp
from app.routes.workout_routes import workout_bp
from app.routes.progress_routes import progress_bp
from app.routes.dashboard_routes import dashboard_bp
from app.routes.prediction_routes import prediction_bp
from app.routes.diet_routes import diet_bp
from app.routes.test_routes import test_bp
from app.routes.weight_routes import weight_bp
from app.routes.ai_routes import ai_bp
from app.routes.ai_ml_routes import ai_ml_bp

# Expose all blueprints as a single collection for unified registration
all_blueprints = [
    auth_bp,
    user_bp,
    workout_bp,
    progress_bp,
    dashboard_bp,
    prediction_bp,
    diet_bp,
    test_bp,
    weight_bp,
    ai_bp,
    ai_ml_bp
]
