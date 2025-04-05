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
    # Get user data from the request
    email = request.json.get("email")
    password = request.json.get("password")
    role = request.json.get("role", 1)  # Default role to 1 (user)

    # Check if user already exists
    if mongo.db.users.find_one({"email": email}):
        return jsonify({"message": "User already exists!"}), 400

    # Hash the password
    hashed_password = hash_password(password)

    # Create new user
    mongo.db.users.insert_one(
        {"email": email, "password": hashed_password, "role": role}
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

    user = mongo.db.users.find_one({"email": email})

    # If user does not exist or password is incorrect
    if not user or not check_password(user["password"], password):
        return jsonify({"message": "Invalid credentials!"}), 401

    # Create JWT token
    access_token = create_access_token(identity=user["email"])
    return jsonify(access_token=access_token), 200


@app.route("/api/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    user = mongo.db.users.find_one({"email": current_user})

    return jsonify({"email": user["email"], "role": user["role"]})


if __name__ == "__main__":
    app.run(debug=True)
