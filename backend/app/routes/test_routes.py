from flask import Blueprint
from app import db
from app.models.user import User

test_bp = Blueprint("test_bp", __name__)

@test_bp.route("/test-user")
def test_user():
    try:
        user = User(
            name="anshu",
            email="anshu@gmail.com"
        )
        
        # We must generate a secure password hash, as the database column cannot be null!
        user.set_password("securepassword123")

        db.session.add(user)
        db.session.commit()

        return "User Stored Successfully in Neon PostgreSQL!", 201
    except Exception as e:
        db.session.rollback()
        return f"Failed to store user: {str(e)}", 500