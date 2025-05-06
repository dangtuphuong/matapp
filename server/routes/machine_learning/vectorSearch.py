from flask import Blueprint, jsonify, request, Response
from flask_jwt_extended import jwt_required
from sentence_transformers import SentenceTransformer
from bson.json_util import dumps

from extensions import mongo

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
print("Successfully import embedding model")

def get_embedding(data, precision="float32"):
   return model.encode(data, precision=precision).tolist()

def get_embedding_for_new_material(data):
    return model.encode(data)

vt_bp = Blueprint("vt_bp", __name__)

@vt_bp.route("/ML/vector_search", methods=["POST"])
@jwt_required()
def llm_search():
    user_query = request.json.get("query")
    limit = request.json.get("limit")
    skip = request.json.get("skip")

    print("skip =", skip, "limit =", limit)

    query_embedding = get_embedding(user_query)
    pipeline = [
        {
            "$vectorSearch": { 
                "index":       "embedding_index",
                "queryVector": query_embedding,
                "path":        "embedding",
                "exact":       True,
                "limit":       100 + skip + limit
            }
        },
        {
            "$project": {
                "matGUID": 1,
                "text":    1,
                "score":   { "$meta": "vectorSearchScore" }
            }
        },
        {
            "$group": {
                "_id":   "$matGUID",
                "text":  { "$first": "$text" },     # first text from the highest‐scoring hits
                "score": { "$max":   "$score" }     # highest score across all hits
            }
        },
        { "$sort": { "score": -1 } },
        { "$skip": skip },
        { "$limit": limit },
        {
            "$lookup": {
                "from":         "materials",
                "let":   { "guid": "$_id" }, 
                 "pipeline": [
                    { 
                    "$match": {
                        "$expr": { "$eq": ["$matGUID", "$$guid"] }
                    }
                    },
                    { "$limit": 1 }                   # ← only take the first matching material
                ],
                "as": "material"
            }
        },
        {
            "$unwind": {
                "path": "$material",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$project": {
                "_id":     0,
                "matGUID": 1,
                "score":   1,
                "material": 1
            }
        },
    ]

    docs = list(mongo.db.embeddings.aggregate(pipeline))
    json_str = dumps(docs)

    return Response(json_str, mimetype="application/json")