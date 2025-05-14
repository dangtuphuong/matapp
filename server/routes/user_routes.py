from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from datetime import timedelta, datetime
from models.user_model import User
from utils.auth import hash_password, check_password


user_bp = Blueprint("user", __name__)
VALID_ROLES = {"admin", "normal_user", "premium_user"}

# ------------ Auth Routes ------------


@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    dob = data.get("dateOfBirth")
    gender = data.get("gender")
    role = data.get("role", "normal_user").lower()

    if not email or not password:
        return jsonify({"message": "Email and password are required!"}), 400

    if role not in VALID_ROLES:
        return (
            jsonify(
                {"message": f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}"}
            ),
            400,
        )

    if User.find_by_email(email):
        return jsonify({"message": "User already exists!"}), 400

    hashed_password = hash_password(password)
    User.create_user(
        {
            "email": email,
            "password": hashed_password,
            "role": role,
            "firstName": first_name,
            "lastName": last_name,
            "dateOfBirth": dob,
            "gender": gender,
            "bookmarks": [],
        }
    )

    access_token = create_access_token(identity=email, expires_delta=timedelta(days=7))
    return (
        jsonify(
            {"message": "User created successfully!", "access_token": access_token}
        ),
        201,
    )


@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required!"}), 400

    user = User.find_by_email(email)
    if not user or not check_password(user["password"], password):
        return jsonify({"message": "Invalid credentials!"}), 401

    access_token = create_access_token(identity=email, expires_delta=timedelta(days=7))
    return (
        jsonify(
            access_token=access_token,
            firstName=user.get("firstName", ""),
            role=user.get("role", ""),
        ),
        200,
    )


# ------------ User Routes ------------


@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user_email = get_jwt_identity()
    user = User.find_by_email(current_user_email)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"_id": str(user["_id"]), **user})


@user_bp.route("/users", methods=["GET"])
@jwt_required()
def get_all_users():
    current_email = get_jwt_identity()
    current_user = User.find_by_email(current_email)

    if not current_user or current_user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    users = User.get_all_users()
    user_list = []
    for user in users:
        if user["email"] == current_email:
            continue
        user_list.append(
            {
                "_id": str(user["_id"]),
                "firstName": user.get("firstName", ""),
                "lastName": user.get("lastName", ""),
                "email": user.get("email", ""),
                "dateOfBirth": user.get("dateOfBirth", ""),
                "gender": user.get("gender", ""),
                "role": user.get("role", "normal_user"),
            }
        )
    return jsonify(user_list), 200


@user_bp.route("/users/<user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    current_email = get_jwt_identity()
    current_user = User.find_by_email(current_email)

    if not current_user or current_user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    update_fields = request.get_json()
    User.update_user(user_id, update_fields)
    return jsonify({"message": "User updated successfully"}), 200


@user_bp.route("/users/<user_id>/reset-password", methods=["POST"])
@jwt_required()
def reset_user_password(user_id):
    current_email = get_jwt_identity()
    current_user = User.find_by_email(current_email)

    if not current_user or current_user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    new_password = request.json.get("newPassword")
    if not new_password:
        return jsonify({"message": "New password is required"}), 400

    hashed = hash_password(new_password)
    User.reset_password(user_id, hashed)
    return jsonify({"message": "Password reset successful"}), 200


@user_bp.route("/users/<user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_email = get_jwt_identity()
    current_user = User.find_by_email(current_email)

    if not current_user or current_user["role"] != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    target_user = User.find_by_id(user_id)
    if not target_user:
        return jsonify({"message": "User not found"}), 404

    if target_user["email"] == current_email:
        return jsonify({"message": "You cannot delete yourself"}), 403

    User.delete_user(user_id)
    return jsonify({"message": "User deleted successfully"}), 200


# ------------ Bookmarks ------------


@user_bp.route("/bookmarks", methods=["POST"])
@jwt_required()
def toggle_bookmark():
    current_user_email = get_jwt_identity()
    user = User.find_by_email(current_user_email)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    mat_guid = data.get("matGUID")

    if not mat_guid:
        return jsonify({"message": "matGUID is required"}), 400

    bookmarks = user.get("bookmarks", [])

    # Check if the bookmark already exists
    existing_index = next(
        (
            i
            for i, b in enumerate(bookmarks)
            if b == mat_guid or (isinstance(b, dict) and b.get("matGUID") == mat_guid)
        ),
        None,
    )

    if existing_index is not None:
        # Remove existing bookmark
        bookmarks.pop(existing_index)
        action = "removed"
        is_bookmarked = False
    else:
        # Add new bookmark
        bookmarks.append(
            {"matGUID": mat_guid, "saved_at": datetime.utcnow().isoformat()}
        )
        action = "added"
        is_bookmarked = True

    User.update_user(user["_id"], {"bookmarks": bookmarks})
    return (
        jsonify(
            {
                "message": f"Bookmark {action} successfully",
                "is_bookmarked": is_bookmarked,
            }
        ),
        200,
    )


@user_bp.route("/bookmarks", methods=["GET"])
@jwt_required()
def get_bookmarks():
    current_user_email = get_jwt_identity()
    user = User.find_by_email(current_user_email)

    if not user:
        return jsonify({"message": "User not found"}), 404

    from models.material_model import MaterialModel

    bookmarks = user.get("bookmarks", [])
    result = []

    for bm in bookmarks:
        mat_guid = bm["matGUID"] if isinstance(bm, dict) else bm
        saved_at = bm.get("saved_at") if isinstance(bm, dict) else None

        material = MaterialModel.get_material_by_guid(mat_guid)
        if material:
            if saved_at:
                material["saved_at"] = saved_at
            result.append(material)

    return jsonify(result), 200


@user_bp.route("/bookmarks/<mat_guid>", methods=["DELETE"])
@jwt_required()
def delete_bookmark(mat_guid):
    current_user_email = get_jwt_identity()
    user = User.find_by_email(current_user_email)

    if not user:
        return jsonify({"message": "User not found"}), 404

    bookmarks = user.get("bookmarks", [])

    updated_bookmarks = [bm for bm in bookmarks if bm.get("matGUID") != mat_guid]

    if len(updated_bookmarks) == len(bookmarks):
        return jsonify({"message": "Bookmark not found"}), 404

    User.update_user(user["_id"], {"bookmarks": updated_bookmarks})
    return jsonify({"message": "Bookmark removed successfully"}), 200


# ------------ Update Profile Page ------------


@user_bp.route("/profile/update", methods=["PUT"])
@jwt_required()
def update_profile():
    current_user_email = get_jwt_identity()
    user = User.find_by_email(current_user_email)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    update_fields = {
        "firstName": data.get("firstName", user.get("firstName")),
        "lastName": data.get("lastName", user.get("lastName")),
        "email": data.get("email", user.get("email")),
    }

    User.update_user(user["_id"], update_fields)
    return jsonify({"message": "Profile updated successfully"}), 200
