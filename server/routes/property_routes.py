from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.property_model import PropertyModel

property_bp = Blueprint("property_routes", __name__)


# Route to fetch all properties
@property_bp.route("/properties", methods=["GET"])
def get_properties():
    try:
        properties = PropertyModel.get_properties()

        return (jsonify({"properties": properties}), 200)
    except Exception as e:
        print(e)
        return jsonify({"error": "Server error"}), 500
