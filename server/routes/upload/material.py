from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.material_model import MaterialModel

upload_bp = Blueprint("upload_routes", __name__)


@upload_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    if "material" not in request.files:
        return jsonify({"error": "No file provided for upload"}), 400

    file = request.files["material"]

    try:
        upload_result = MaterialModel.upload_file(
            file=file,
        )

        return (
            jsonify(
                {
                    "message": "File uploaded successfully",
                    "matGUID": upload_result["matGUID"],
                }
            ),
            200,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Error uploading file", "details": str(e)}), 500
