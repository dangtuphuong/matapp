from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
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
from bson import ObjectId

app = Flask(__name__)
bcrypt = Bcrypt(app)

# Enable CORS for all routes
CORS(app)

# MongoDB URI from the .env file (Make sure to have MongoDB running locally or use a MongoDB cloud URI)
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/matdb")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt_dummy_secret_key")
app.config["JWT_TOKEN_LOCATION"] = ["headers"]

# Initialize Flask-PyMongo and JWT
mongo = PyMongo(app)
jwt = JWTManager(app)


# Helper to hash passwords
def hash_password(password):
    return bcrypt.generate_password_hash(password).decode("utf-8")


# Helper to check password
def check_password(stored_password, input_password):
    return bcrypt.check_password_hash(stored_password, input_password)


@app.route("/api/register", methods=["POST"])
def register():
    email = request.json.get("email")
    password = request.json.get("password")
    
    # ✅ Force convert to int
    try:
        role = int(request.json.get("role", 1))
    except (ValueError, TypeError):
        role = 1  # default to normal user if bad input

    first_name = request.json.get("firstName")
    last_name = request.json.get("lastName")
    dob = request.json.get("dateOfBirth")
    gender = request.json.get("gender")

    if mongo.db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists!"}), 400

    hashed_password = hash_password(password)

    mongo.db.users.insert_one(
        {
            "email": email,
            "password": hashed_password,
            "role": role,
            "firstName": first_name,
            "lastName": last_name,
            "dateOfBirth": dob,
            "gender": gender,
        }
    )

    access_token = create_access_token(identity=email)

    return (
        jsonify({"message": "User created successfully!", "access_token": access_token}),
        201,
    )


@app.route("/api/login", methods=["POST"])
def login():
    email = request.json.get("email")
    password = request.json.get("password")

    user = mongo.db.users.find_one({"email": email})

    if not user or not check_password(user["password"], password):
        return jsonify({"message": "Invalid credentials!"}), 401

    access_token = create_access_token(identity=email)

    return jsonify(
        access_token=access_token,
        firstName=user.get("firstName", "")
    ), 200



@app.route("/api/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    user = mongo.db.users.find_one({"email": current_user})

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


@app.route("/api/users", methods=["GET"])
@jwt_required()
def get_all_users():
    current_email = get_jwt_identity()
    current_user = mongo.db.users.find_one({"email": current_email})
    
    if not current_user or current_user["role"] != 0:  # role 2 = Admin
        return jsonify({"message": "Unauthorized"}), 403

    users = mongo.db.users.find({}, {"password": 0}).sort("firstName")
    user_list = []
    for user in users:
        if user["email"] == current_email:
            continue  # Skip current admin from actions like delete
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

    mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields}
    )

    return jsonify({"message": "User updated successfully"}), 200



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
    mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hashed}}
    )

    return jsonify({"message": "Password reset successful"}), 200



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


if __name__ == "__main__":
    app.run(debug=True)
