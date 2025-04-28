from extensions import mongo
from bson.objectid import ObjectId
from datetime import datetime, timezone


class User:
    @staticmethod
    def find_by_id(user_id):
        return mongo.db.users.find_one({"_id": ObjectId(user_id)})

    @staticmethod
    def find_by_email(email):
        return mongo.db.users.find_one({"email": email})

    @staticmethod
    def create_user(user_data):
        current_time = datetime.now(timezone.utc)
        user_data["created_at"] = current_time
        user_data["updated_at"] = current_time
        return mongo.db.users.insert_one(user_data)

    @staticmethod
    def get_all_users():
        return mongo.db.users.find({}, {"password": 0}).sort("firstName")

    @staticmethod
    def update_user(user_id, update_fields):
        return mongo.db.users.update_one(
            {"_id": ObjectId(user_id)}, {"$set": update_fields}
        )

    @staticmethod
    def reset_password(user_id, new_password):
        return mongo.db.users.update_one(
            {"_id": ObjectId(user_id)}, {"$set": {"password": new_password}}
        )

    @staticmethod
    def delete_user(user_id):
        return mongo.db.users.delete_one({"_id": ObjectId(user_id)})
