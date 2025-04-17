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
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
bcrypt = Bcrypt(app)

# Enable CORS for all routes
CORS(app)

# Configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/matdb")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt_dummy_secret_key")
app.config["JWT_TOKEN_LOCATION"] = ["headers"]

# Initialize Flask-PyMongo and JWT
mongo = PyMongo(app)
jwt = JWTManager(app)

# Test MongoDB connection
try:
    mongo.cx.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
    print(mongo.db.list_collection_names())
except Exception as e:
    print(f"MongoDB connection error: {e}")

VALID_ROLES = {"admin", "normal_user", "premium_user"}

# Helper to hash passwords
def hash_password(password):
    return bcrypt.generate_password_hash(password).decode("utf-8")


# Helper to check password
def check_password(stored_password, input_password):
    return bcrypt.check_password_hash(stored_password, input_password)


@app.route("/api/register", methods=["POST"])
def register():
    # Get user data from the request
    email = request.json.get("email")
    password = request.json.get("password")
    role = request.json.get("role", "normal_user").lower()

    if not email or not password:
        return jsonify({"message": "Email and password are required!"}), 400

    if role not in VALID_ROLES:
        return jsonify({"message": f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}"}), 400

    # Check if user already exists
    if mongo.db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists!"}), 400

    # Hash the password
    hashed_password = hash_password(password)

    current_time = datetime.now(timezone.utc)

    # Create new user
    mongo.db.users.insert_one(
        {
            "email": email,
            "password": hashed_password,
            "role": role,
            "created_at": current_time,
            "updated_at": current_time
        }
    )

    # Generate JWT token
    access_token = create_access_token(identity=email)

    # Return the access token
    return (
        jsonify(
            {"message": "User created successfully!", "access_token": access_token}
        ),
        201,
    )


@app.route("/api/login", methods=["POST"])
def login():
    email = request.json.get("email")
    password = request.json.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required!"}), 400

    user = mongo.db.users.find_one({"email": email})

    # If user does not exist or password is incorrect
    if not user or not check_password(user["password"], password):
        return jsonify({"message": "Invalid credentials!"}), 401

    # Create JWT token
    access_token = create_access_token(identity=user["email"])

    return jsonify({
        "message": "Login successful!",
        "access_token": access_token
    }), 200


@app.route("/api/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user_email = get_jwt_identity()
    user = mongo.db.users.find_one({"email": current_user_email})

    if not user:
        return jsonify({"message": "User not found!"}), 404

    return jsonify(user), 200


if __name__ == "__main__":
    app.run(debug=True)
