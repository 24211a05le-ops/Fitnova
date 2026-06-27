from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.controllers.app_controller import get_app_overview, get_exercise_library


app_bp = Blueprint("app_data", __name__, url_prefix="/api/app")

app_bp.route("/overview", methods=["GET"])(jwt_required()(get_app_overview))
app_bp.route("/exercises", methods=["GET"])(jwt_required()(get_exercise_library))
