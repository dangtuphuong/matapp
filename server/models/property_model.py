from extensions import mongo, redis_client
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import UpdateOne
import pickle
import redis

from utils.upload import parse_value_range, extract_unit


class PropertyModel:
    @staticmethod
    def get_properties():
        # Try to get from Redis cache first
        if redis_client:
            try:
                cache_key = "property_filters:all"
                cached_properties = redis_client.get(cache_key)

                if cached_properties:
                    return pickle.loads(cached_properties)
            except (redis.RedisError, pickle.PickleError) as e:
                print(f"Redis error in get_properties: {str(e)}")

        # If not in cache or Redis is unavailable, fetch from MongoDB
        properties_collection = mongo.db["property_filters"]
        properties = properties_collection.find({})

        properties_list = []
        for property in properties:
            property["_id"] = str(property["_id"])
            properties_list.append(property)

        # Cache the result if Redis is available
        if redis_client:
            try:
                redis_client.setex(
                    "property_filters:all", 86400, pickle.dumps(properties_list)
                )
            except redis.RedisError as e:
                print(f"Redis error while caching properties: {str(e)}")

        return properties_list

    @staticmethod
    def upload_properties(input_properties):
        if not isinstance(input_properties, dict):
            return {"status": "error", "message": "Input must be a dictionary"}

        property_filters_collection = mongo.db["property_filters"]
        operations = []
        now = datetime.now(timezone.utc)

        for group_name, properties in input_properties.items():
            if not isinstance(properties, dict):
                continue

            # First get existing group data if available
            existing_group = (
                property_filters_collection.find_one({"name": group_name}) or {}
            )
            existing_properties = {
                prop["name"]: prop for prop in existing_group.get("properties", [])
            }

            # Prepare group update
            group_update = {
                "$setOnInsert": {
                    "_id": ObjectId(),
                    "name": group_name,
                    "created_at": now,
                    "type": "property_group",
                },
                "$set": {"last_updated": now},
            }

            # Process individual properties
            for prop_name, prop_values in properties.items():
                if not isinstance(prop_values, list):
                    continue

                # Initialize units array for this property
                units_update = []
                existing_units = existing_properties.get(prop_name, {}).get("units", [])

                for val in prop_values:
                    if isinstance(val, dict):
                        for unit_type in ["Metric", "English"]:
                            value = val.get(unit_type)
                            if value:
                                current_min, current_max = parse_value_range(value)
                                unit = extract_unit(value)

                                # Check if unit exists in database
                                existing_unit = next(
                                    (u for u in existing_units if u["unit"] == unit),
                                    None,
                                )

                                if existing_unit:
                                    # Update min/max if needed
                                    new_min = (
                                        min(existing_unit["min"], current_min)
                                        if existing_unit.get("min") is not None
                                        else current_min
                                    )
                                    new_max = (
                                        max(existing_unit["max"], current_max)
                                        if existing_unit.get("max") is not None
                                        else current_max
                                    )

                                    units_update.append(
                                        {"unit": unit, "min": new_min, "max": new_max}
                                    )
                                else:
                                    # Add new unit entry
                                    units_update.append(
                                        {
                                            "unit": unit,
                                            "min": current_min,
                                            "max": current_max,
                                        }
                                    )

                # Prepare property update
                if units_update:
                    prop_filter = {"name": group_name, "properties.name": prop_name}

                    if prop_name in existing_properties:
                        # Update existing property
                        operations.append(
                            UpdateOne(
                                prop_filter,
                                {
                                    "$set": {
                                        "properties.$.units": units_update,
                                        "last_updated": now,
                                    }
                                },
                            )
                        )
                    else:
                        # Add new property
                        group_update.setdefault("$addToSet", {}).setdefault(
                            "properties", {}
                        ).setdefault("$each", []).append(
                            {"name": prop_name, "units": units_update}
                        )
                else:
                    if prop_name not in existing_properties:
                        # Add new property without units
                        group_update.setdefault("$addToSet", {}).setdefault(
                            "properties", {}
                        ).setdefault("$each", []).append(
                            {
                                "name": prop_name,
                            }
                        )

            # Add group update if there are new properties
            if "$addToSet" in group_update:
                operations.append(
                    UpdateOne({"name": group_name}, group_update, upsert=True)
                )

        # Execute all operations
        if operations:
            result = property_filters_collection.bulk_write(operations)
            return {
                "status": "success",
                "upserted_count": result.upserted_count,
                "modified_count": result.modified_count,
            }

        return {"status": "skipped", "message": "No valid properties found"}
