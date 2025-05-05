from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from services.machine_learning.deepseek_service import get_answer
from models.material_model import MaterialModel
from utils.llm import clean_and_parse_pipeline

deepseek_bp = Blueprint("deepseek_bp", __name__)


@deepseek_bp.route("/deepseek_search", methods=["POST"])
@jwt_required()
def deepseek_search():
    try:
        # Validate request
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        user_query = request.json.get("query")
        if not user_query:
            return jsonify({"error": "Query parameter is required"}), 400

        # Get MongoDB pipeline from DeepSeek
        pipeline_str = get_answer(user_query)
        if not pipeline_str:
            return jsonify({"error": "Failed to generate query"}), 500

        print(f"Generated pipeline string: {pipeline_str}")

        # Clean the pipeline string (remove markdown code blocks)
        pipeline = clean_and_parse_pipeline(pipeline_str)

        # Ensure pipeline is a list
        if not isinstance(pipeline, list):
            return jsonify({"error": "Pipeline must be a list"}), 400

        results = MaterialModel.aggregate_materials(pipeline)

        return jsonify({"result": results}), 200

    except Exception as e:
        print(f"Error in deepseek_search: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
