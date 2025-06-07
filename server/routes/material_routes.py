from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.material_model import MaterialModel

material_bp = Blueprint("material_routes", __name__)


# Route to fetch all materials
@material_bp.route("/materials", methods=["POST"])
def get_materials():
    try:
        data = request.get_json() or {}

        page = int(data.get("page", 1))
        limit = int(data.get("limit", 10))
        search_term = data.get("searchTerm", "")
        search_cats = data.get("searchCategories", [])
        search_props = data.get("searchProperties", [])

        materials, total_count = MaterialModel.get_all_materials(
            page, limit, search_term, search_cats, search_props
        )

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
        print("Error in get_materials:", e)
        return jsonify({"error": "Server error"}), 500


# Route to fetch a material by matGUID
@material_bp.route("/materials/<mat_guid>", methods=["GET"])
def get_material_by_guid(mat_guid):
    try:
        material = MaterialModel.get_material_by_guid(mat_guid)
        if material:
            return jsonify(material), 200
        return jsonify({"message": "Material not found"}), 404
    except Exception as e:
        print(e)
        return jsonify({"error": "Server error"}), 500
