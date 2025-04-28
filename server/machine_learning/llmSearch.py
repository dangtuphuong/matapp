from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from machine_learning.model import get_answer

import json
import ast

from extension.mongo import mongo

ml_bp = Blueprint("ml_bp", __name__)

@ml_bp.route("/api/ML/llm_search", methods=["POST"])
@jwt_required()
def llm_search():
    current_email = get_jwt_identity()
    current_user = mongo.db.users.find_one({"email": current_email})

    user_query = request.json.get("query")

    pipeline_str = get_answer(user_query)

    try:
        pipeline = json.loads(pipeline_str)
    except json.JSONDecodeError:
        pipeline = ast.literal_eval(pipeline_str)

    print(pipeline)

    results = mongo.db.embeddings.aggregate(pipeline)
    result_json = []

    for result in results:
        result_json.append(result)

    return jsonify({ "result": str(result_json) }), 200
