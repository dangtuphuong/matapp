from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.material_model import MaterialModel

upload_bp = Blueprint("upload_routes", __name__)


@upload_bp.route("/upload", methods=["POST"])
@jwt_required()
def handle_upload():
    if "materials" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    files = request.files.getlist("materials")

    if not files or all(f.filename == "" for f in files):
        return jsonify({"error": "No selected files"}), 400

    try:
        upload_results = MaterialModel.upload_files(files)

        return jsonify(upload_results), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Error uploading files", "details": str(e)}), 500
