from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from routes.machine_learning.geminiModel import get_answer
from extensions import mongo
import json
import ast

gemini_bp = Blueprint("gemini_bp", __name__)


@gemini_bp.route("/gemini_search", methods=["POST"])
@jwt_required()
def llm_search():
    try:
        # Validate request
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        user_query = request.json.get("query")
        if not user_query:
            return jsonify({"error": "Query parameter is required"}), 400

        # Get MongoDB pipeline from Gemini
        pipeline_str = get_answer(user_query)
        if not pipeline_str:
            return jsonify({"error": "Failed to generate query"}), 500

        print(f"Generated pipeline string: {pipeline_str}")

        # Clean the pipeline string (remove markdown code blocks)
        cleaned_str = pipeline_str.replace("```json", "").replace("```", "").strip()

        # Parse the pipeline (handle both JSON string and Python literal)
        try:
            pipeline = json.loads(cleaned_str)
        except json.JSONDecodeError:
            pipeline = ast.literal_eval(cleaned_str)

        # Ensure pipeline is a list
        if not isinstance(pipeline, list):
            raise ValueError("Pipeline must be a list")

        # Check if $limit already exists
        has_limit = any(
            "$limit" in stage for stage in pipeline if isinstance(stage, dict)
        )

        # Add a limit stage if not present
        if not has_limit:
            pipeline.append({"$limit": 20})

        results = mongo.db.materials.aggregate(pipeline)
        result_json = []

        for result in results:
            result["_id"] = str(result["_id"])
            result_json.append(result)

        return jsonify({"result": result_json}), 200

    except Exception as e:
        print(f"Error in gemini_search: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
