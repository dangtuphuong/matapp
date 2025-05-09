from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from routes.machine_learning.model import get_answer
from utils.llm import clean_and_parse_pipeline
from models.material_model import MaterialModel

from extensions import mongo

ml_bp = Blueprint("ml_bp", __name__)


@ml_bp.route("/ML/llm_search", methods=["POST"])
@jwt_required()
def llm_search():
    try:
        user_query = request.json.get("query")

        result = get_answer(user_query)

        # Check if generation was successful
        if not result["success"]:
            return jsonify({"error": result["error"]}), 500

        pipeline_str = result["content"]

        print(f"Generated pipeline string: {pipeline_str}")

        # Clean the pipeline string (remove markdown code blocks)
        pipeline = clean_and_parse_pipeline(pipeline_str)

        # Ensure pipeline is a list
        if not isinstance(pipeline, list):
            return jsonify({"error": "Pipeline must be a list"}), 400

        results = MaterialModel.aggregate_materials(pipeline)

        return jsonify({"result": results}), 200

    except Exception as e:
        print(f"Error in llm_search: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
