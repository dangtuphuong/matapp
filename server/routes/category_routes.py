from flask import Blueprint, request, jsonify
from models.category_model import CategoryModel

category_bp = Blueprint("category_routes", __name__)


# Route to fetch all categories
@category_bp.route("/categories", methods=["GET"])
def get_categories():
    try:
        categories = CategoryModel.get_categories()

        return (jsonify({"categories": categories}), 200)
    except Exception as e:
        print(e)
        return jsonify({"error": "Server error"}), 500
