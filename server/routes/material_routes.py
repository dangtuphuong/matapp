from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.material_model import MaterialModel

material_bp = Blueprint("material_routes", __name__)


# Route to fetch all materials, with JWT token check
@material_bp.route("/materials", methods=["GET"])
@jwt_required()
def get_materials():
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))

        materials, total_count = MaterialModel.get_all_materials(page, limit)

        # Calculate total pages
        total_pages = (total_count + limit - 1) // limit

        return (
            jsonify(
                {
                    "materials": materials,
                    "total_count": total_count,
                    "total_pages": total_pages,
                    "current_page": page,
                }
            ),
            200,
        )
    except Exception as e:
        print(e)
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
        print(e)
        return jsonify({"error": "Server error"}), 500
