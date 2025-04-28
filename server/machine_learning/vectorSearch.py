from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sentence_transformers import SentenceTransformer

from extension.mongo import mongo

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
print("Successfully import embedding model")

def get_embedding(data, precision="float32"):
   return model.encode(data, precision=precision).tolist()

vt_bp = Blueprint("vt_bp", __name__)

@vt_bp.route("/api/ML/vector_search", methods=["POST"])
@jwt_required()
def llm_search():
    current_email = get_jwt_identity()
    current_user = mongo.db.users.find_one({"email": current_email})

    user_query = request.json.get("query")
    limit = request.json.get("limit")
    skip = request.json.get("skip")

    query_embedding = get_embedding(user_query)
    pipeline = [
        {
            "$vectorSearch": {
                    "index": "embedding_index",
                    "queryVector": query_embedding,
                    "path": "embedding",
                    "exact": True,
                    "limit": skip + limit
            }
        }, 
        { "$skip": skip },
        { "$limit": limit },
        {
            "$project": {
                "_id": 0,
                "matGUID": 1, 
                "text": 1,
                "score": {
                    "$meta": "vectorSearchScore"
                }
            }
        }
    ]

    results = mongo.db.embeddings.aggregate(pipeline)
    result_json = []

    for result in results:
        result_json.append(result)

    return jsonify({ "result": result_json }), 200