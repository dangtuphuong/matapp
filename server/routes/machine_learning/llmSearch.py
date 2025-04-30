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

    user_query = request.json.get("query")

    pipeline_str = get_answer(user_query)

    try:
        pipeline = json.loads(pipeline_str)
    except json.JSONDecodeError:
        pipeline = ast.literal_eval(pipeline_str)

    results = mongo.db.materials.aggregate(pipeline)
    result_json = []

    for result in results:
        result_json.append(result)
    
    print(result)

    return jsonify({ "result": str(result_json) }), 200
