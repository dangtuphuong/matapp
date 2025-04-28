from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import os
from bson.objectid import ObjectId
from datetime import datetime, timezone
from dotenv import load_dotenv

from extension.mongo import mongo
from machine_learning.llmSearch import ml_bp
from machine_learning.vectorSearch import vt_bp

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
bcrypt = Bcrypt(app)

# Enable CORS for frontend-backend communication
CORS(app)

# Configuration for MongoDB and JWT
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/matdb")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt_dummy_secret_key")
app.config["JWT_TOKEN_LOCATION"] = ["headers"]

# Initialize database and JWT
mongo.init_app(app)
jwt = JWTManager(app)

# Register route
app.register_blueprint(ml_bp)
app.register_blueprint(vt_bp)

# Test MongoDB connection
try:
    mongo.cx.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection error: {e}")

VALID_ROLES = {"admin", "normal_user", "premium_user"}

# Helper to hash passwords
def hash_password(password):
    return bcrypt.generate_password_hash(password).decode("utf-8")

# Helper to verify password
def check_password(stored_password, input_password):
    return bcrypt.check_password_hash(stored_password, input_password)

# Register a new user
@app.route("/api/register", methods=["POST"])
def register():
    email = request.json.get("email")
    password = request.json.get("password")
    first_name = request.json.get("firstName")
    last_name = request.json.get("lastName")
    dob = request.json.get("dateOfBirth")
    gender = request.json.get("gender")
    
    try:
        role = request.json.get("role", "normal_user").lower()
    except (ValueError, TypeError):
        role = "normal_user"

    if not email or not password:
        return jsonify({"message": "Email and password are required!"}), 400

    if role not in VALID_ROLES:
        return jsonify({"message": f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}"}), 400

    if mongo.db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists!"}), 400

    hashed_password = hash_password(password)

    current_time = datetime.now(timezone.utc)

    # Create new user
    mongo.db.users.insert_one({
        "email": email,
        "password": hashed_password,
        "role": role,
        "firstName": first_name,
        "lastName": last_name,
        "dateOfBirth": dob,
        "gender": gender,
        "created_at": current_time,
        "updated_at": current_time
    })

    access_token = create_access_token(identity=email)

    return jsonify({"message": "User created successfully!", "access_token": access_token}), 201

# Login a user
@app.route("/api/login", methods=["POST"])
def login():
    email = request.json.get("email")
    password = request.json.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required!"}), 400

    user = mongo.db.users.find_one({"email": email})
    if not user or not check_password(user["password"], password):
        return jsonify({"message": "Invalid credentials!"}), 401

    # Create JWT token
    access_token = create_access_token(identity=email)

    return jsonify(access_token=access_token, firstName=user.get("firstName", "")), 200


# Get the profile of the current user
@app.route("/api/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user_email = get_jwt_identity()
    user = mongo.db.users.find_one({"email": current_user_email})

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "email": user["email"],
        "role": user["role"],
        "firstName": user.get("firstName", ""),
        "lastName": user.get("lastName", ""),
        "dateOfBirth": user.get("dateOfBirth", ""),
        "gender": user.get("gender", "")
    })

# Admin: Get all users except self
@app.route("/api/users", methods=["GET"])
@jwt_required()
def get_all_users():
    current_email = get_jwt_identity()
    current_user = mongo.db.users.find_one({"email": current_email})
    
    if not current_user or current_user["role"] != 0:
        return jsonify({"message": "Unauthorized"}), 403

    users = mongo.db.users.find({}, {"password": 0}).sort("firstName")
    user_list = []
    for user in users:
        if user["email"] == current_email:
            continue  # Skip the current admin
        user_data = {
            "_id": str(user["_id"]),
            "firstName": user.get("firstName", ""),
            "lastName": user.get("lastName", ""),
            "email": user.get("email", ""),
            "dateOfBirth": user.get("dateOfBirth", ""),
            "gender": user.get("gender", ""),
            "role": user.get("role", 1)
        }
        user_list.append(user_data)

    return jsonify(user_list), 200

# Admin: Update user info
@app.route("/api/users/<user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    current_email = get_jwt_identity()
    current_user = mongo.db.users.find_one({"email": current_email})
    
    if not current_user or current_user["role"] != 0:
        return jsonify({"message": "Unauthorized"}), 403

    update_fields = {
        "firstName": request.json.get("firstName", ""),
        "lastName": request.json.get("lastName", ""),
        "email": request.json.get("email", ""),
        "dateOfBirth": request.json.get("dateOfBirth", ""),
        "gender": request.json.get("gender", "")
    }

    mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_fields})
    return jsonify({"message": "User updated successfully"}), 200

# Admin: Reset user's password
@app.route("/api/users/<user_id>/reset-password", methods=["POST"])
@jwt_required()
def reset_user_password(user_id):
    current_email = get_jwt_identity()
    current_user = mongo.db.users.find_one({"email": current_email})

    if not current_user or current_user["role"] != 0:
        return jsonify({"message": "Unauthorized"}), 403

    new_password = request.json.get("newPassword", "")
    if not new_password:
        return jsonify({"message": "New password is required"}), 400

    hashed = hash_password(new_password)
    mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": hashed}})
    return jsonify({"message": "Password reset successful"}), 200

# Admin: Delete user (cannot delete self)
@app.route("/api/users/<user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_email = get_jwt_identity()
    current_user = mongo.db.users.find_one({"email": current_email})

    if not current_user or current_user["role"] != 0:
        return jsonify({"message": "Unauthorized"}), 403

    target_user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not target_user:
        return jsonify({"message": "User not found"}), 404

    if target_user["email"] == current_email:
        return jsonify({"message": "You cannot delete yourself"}), 403

    mongo.db.users.delete_one({"_id": ObjectId(user_id)})
    return jsonify({"message": "User deleted successfully"}), 200

@app.route("/api/material/detail/<mat_id>", methods=["GET"])
@jwt_required()
def get_material_detail(mat_id):
    current_email = get_jwt_identity()
    current_user = mongo.db.users.find_one({"email": current_email})

    cursor = mongo.db.materials.find({ "matGUID": mat_id }, { "_id": False })

    materials = list(cursor)

    return jsonify({ "material": materials[0] }), 200

if __name__ == "__main__":
    app.run(debug=True)
