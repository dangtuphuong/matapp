from extensions import mongo, redis_client
from datetime import datetime, timezone
from pymongo import UpdateOne
import pickle
import redis


class CategoryModel:
    @staticmethod
    def get_categories():
        # Try to get from Redis cache first
        if redis_client:
            try:
                cache_key = "categories:all"
                cached_categories = redis_client.get(cache_key)

                if cached_categories:
                    return pickle.loads(cached_categories)
            except (redis.RedisError, pickle.PickleError) as e:
                print(f"Redis error in get_categories: {str(e)}")

        # If not in cache or Redis is unavailable, fetch from MongoDB
        categories_collection = mongo.db["categories"]
        categories = categories_collection.find({})

        categories_list = []
        for category in categories:
            category["_id"] = str(category["_id"])
            categories_list.append(category)

        # Cache the result if Redis is available
        if redis_client:
            try:
                redis_client.setex(
                    "categories:all", 86400, pickle.dumps(categories_list)
                )
            except redis.RedisError as e:
                print(f"Redis error while caching categories: {str(e)}")

        return categories_list

    @staticmethod
    def upload_categories(category_names):
        if not category_names or not isinstance(category_names, list):
            return {"status": "skipped", "message": "Invalid input"}

        categories_collection = mongo.db["categories"]

        # Find all existing category names in the tree
        existing_categories = set()

        # Recursive function to extract names from nested structure
        def extract_names(category):
            existing_categories.add(category["name"])
            for child in category.get("children", []):
                extract_names(child)

        # Process all root categories
        for root_category in categories_collection.find({}):
            extract_names(root_category)

        # Identify missing categories
        missing_categories = [
            name for name in category_names if name not in existing_categories
        ]

        if not missing_categories:
            return {"status": "skipped", "message": "All categories already exist"}

        # Ensure Others category exists or create it
        other_category = categories_collection.find_one({"name": "Others"})
        if not other_category:
            other_category = {
                "name": "Others",
                "last_updated": datetime.now(timezone.utc),
            }
            categories_collection.insert_one(other_category)

        # Add missing categories under "Others"
        updates = []
        for name in missing_categories:
            updates.append(
                UpdateOne(
                    {"name": "Others"},
                    {
                        "$addToSet": {"children": {"name": name, "children": []}},
                        "$set": {"last_updated": datetime.now(timezone.utc)},
                    },
                )
            )

        # Execute bulk update
        result = categories_collection.bulk_write(updates)

        # Invalidate the cache after successful update
        if redis_client:
            try:
                redis_client.delete("categories:all")
            except redis.RedisError as e:
                print(f"Redis error while invalidating categories cache: {str(e)}")

        return {
            "status": "success",
            "added_to_other": missing_categories,
            "modified_count": result.modified_count,
        }
