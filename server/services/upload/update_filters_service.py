import re
from extensions import mongo
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import UpdateOne


def extract_unit(value):
    # Remove anything after '@'
    main_part = value.split("@")[0].strip()

    # Match numbers (including ranges like 0.003 - 0.005)
    number_pattern = r"([<>]=?\s*)?[-+]?\d*\.?\d+(?:\s*-\s*[-+]?\d*\.?\d+)?"
    match = re.search(number_pattern, main_part)

    if match:
        unit_candidate = main_part[match.end() :].strip()
        # Clean common noise (e.g., remove leading hyphens or extra spaces)
        unit_candidate = re.sub(r"^[\-\s]+", "", unit_candidate)
        return unit_candidate if unit_candidate else None
    return None


def parse_value_range(value):
    if not isinstance(value, str):
        return None, None

    value = value.strip().replace("−", "-").replace(",", "")

    # Scientific number pattern
    sci_num = r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?"

    # Handle comparison
    match = re.match(rf"^(>=|<=|>|<)\s*({sci_num})", value)
    if match:
        op, number = match.groups()
        num = float(number)
        if op in (">=", ">"):
            return num, None
        elif op in ("<=", "<"):
            return None, num

    # Handle numeric range: "1.0e-8 - 1.0e-6"
    match = re.match(rf"^({sci_num})\s*[-–]\s*({sci_num})", value)
    if match:
        a, b = match.groups()
        return float(a), float(b)

    # Handle single number
    match = re.match(rf"^({sci_num})", value)
    if match:
        num = float(match.group(1))
        return num, num

    return None, None


def update_property_filters_collection(input_properties):
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
                                (u for u in existing_units if u["unit"] == unit), None
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
