from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from models.user_model import User
from models.setting_model import SettingModel

setting_bp = Blueprint("setting_routes", __name__)


# Route to fetch all setting, with JWT token check
@setting_bp.route("/settings", methods=["GET"])
@jwt_required()
def get_settings():
    try:
        settings = SettingModel.get_all_settings()

        return (jsonify({"settings": settings}), 200)
    except Exception as e:
        print(e)
        return jsonify({"error": "Server error"}), 500


@setting_bp.route("/update-settings", methods=["POST"])
@jwt_required()
def update_settings_route():
    current_email = get_jwt_identity()
    current_user = User.find_by_email(current_email)

    if not current_user or current_user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    try:
        settings = request.json.get("settings", {})
        result = SettingModel.update_settings(settings)

        return jsonify({"settings": result}), 200
    except Exception as e:
        print("Route error:", e)
        return jsonify({"error": "Server error"}), 500
