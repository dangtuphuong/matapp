from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from routes.machine_learning.model import get_answer

import json
import ast

from extensions import mongo

ml_bp = Blueprint("ml_bp", __name__)


@ml_bp.route("/ML/llm_search", methods=["POST"])
@jwt_required()
def llm_search():
    try:
        user_query = request.json.get("query")

        pipeline_str = get_answer(user_query)

        try:
            pipeline = json.loads(pipeline_str)
        except json.JSONDecodeError:
            pipeline = ast.literal_eval(pipeline_str)

        print(pipeline)

        results = mongo.db.materials.aggregate(pipeline)
        result_json = []

        for result in results:
            result["_id"] = str(result["_id"])
            result_json.append(result)

        return jsonify({"result": result_json}), 200
    except Exception as e:
        print("Error in llm_search:", e)
        return jsonify({"error": "Server error"}), 500
