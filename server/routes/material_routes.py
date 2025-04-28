from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models.material_model import MaterialModel

material_bp = Blueprint("material_routes", __name__)


# Route to fetch all materials, with JWT token check
@material_bp.route("/materials", methods=["GET"])
@jwt_required()
def get_materials():
    try:
        materials = MaterialModel.get_all_materials()
        return jsonify(materials), 200
    except Exception as e:
        return jsonify({"error": "Server error"}), 500


# Route to fetch a material by matGUID, with JWT token check
@material_bp.route("/materials/<mat_guid>", methods=["GET"])
@jwt_required()
def get_material_by_guid(mat_guid):
    try:
        material = MaterialModel.get_material_by_guid(mat_guid)
        if material:
            return jsonify(material), 200
        return jsonify({"message": "Material not found"}), 404
    except Exception as e:
        return jsonify({"error": "Server error"}), 500
