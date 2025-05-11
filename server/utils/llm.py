import json
import re
import ast
from sentence_transformers import SentenceTransformer


def clean_and_parse_pipeline(pipeline_str):
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", pipeline_str, re.DOTALL)
    cleaned_str = (
        match.group(1)
        if match
        else pipeline_str.replace("```json", "").replace("```", "").strip()
    )
    try:
        return json.loads(cleaned_str)
    except json.JSONDecodeError:
        return ast.literal_eval(cleaned_str)


# Load embedding sentence-transformers model
embeddings_model = None


def get_embeddings_model():
    global embeddings_model
    if embeddings_model is None:
        embeddings_model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Successfully loaded SentenceTransformer model")
    return embeddings_model
