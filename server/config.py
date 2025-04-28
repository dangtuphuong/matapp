import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/matdb")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt_dummy_secret_key")
    JWT_TOKEN_LOCATION = ["headers"]
