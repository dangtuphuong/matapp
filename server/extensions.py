from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import redis
import os

mongo = PyMongo()
jwt = JWTManager()
bcrypt = Bcrypt()
cors = CORS()

# Redis configuration with basic error handling
try:
    redis_client = redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        decode_responses=False,  # Keep False since we use pickle
    )
except redis.RedisError as e:
    print(f"Redis connection error: {str(e)}")
    redis_client = None
