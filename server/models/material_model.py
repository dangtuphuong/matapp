from extensions import mongo
import json
from datetime import datetime, timezone
from bson import ObjectId
from services.upload.parse_service import parse_properties
from models.category_model import CategoryModel
from models.property_model import PropertyModel


class MaterialModel:
    @staticmethod
    def get_all_materials(
        page=1, limit=10, searchTerm="", searchCategories=None, searchProperties=None
    ):
        materials_collection = mongo.db["materials"]
        searchCategories = searchCategories or []
        searchProperties = searchProperties or []
        conditions = []

        # Helper: Builds unit-based numeric range conditions
        def build_range_conditions(unit_key, unit_name, min_val, max_val):
            conds = []

            if unit_name:
                conds.append({f"{unit_key}.unit": unit_name})

            if min_val is not None:
                min_val = float(min_val)
                conds.append(
                    {
                        "$or": [
                            {
                                "$and": [
                                    {"%s.type" % unit_key: "absolute"},
                                    {f"{unit_key}.min": {"$gte": min_val}},
                                ]
                            },
                            {
                                "$and": [
                                    {"%s.type" % unit_key: "range"},
                                    {f"{unit_key}.min": {"$lte": min_val}},
                                    {f"{unit_key}.max": {"$gte": min_val}},
                                ]
                            },
                            {
                                "$and": [
                                    {"%s.type" % unit_key: "range"},
                                    {f"{unit_key}.min": {"$lte": min_val}},
                                    {f"{unit_key}.max": {"$exists": False}},
                                ]
                            },
                        ]
                    }
                )

            if max_val is not None:
                max_val = float(max_val)
                conds.append(
                    {
                        "$or": [
                            {
                                "$and": [
                                    {"%s.type" % unit_key: "absolute"},
                                    {f"{unit_key}.max": {"$lte": max_val}},
                                ]
                            },
                            {
                                "$and": [
                                    {"%s.type" % unit_key: "range"},
                                    {f"{unit_key}.min": {"$lte": max_val}},
                                    {f"{unit_key}.max": {"$gte": max_val}},
                                ]
                            },
                            {
                                "$and": [
                                    {"%s.type" % unit_key: "range"},
                                    {f"{unit_key}.max": {"$gte": max_val}},
                                    {f"{unit_key}.min": {"$exists": False}},
                                ]
                            },
                        ]
                    }
                )

            return conds

        # Text search
        if searchTerm:
            conditions.append(
                {"Material Name": {"$regex": searchTerm, "$options": "i"}}
            )

        # Category filtering
        filtered_categories = [cat.strip() for cat in searchCategories if cat.strip()]
        if filtered_categories:
            conditions.append({"Categories": {"$all": filtered_categories}})

        # Property filtering
        for prop in searchProperties:
            prop_type = prop.get("group")
            prop_name = prop.get("property")
            target_unit = prop.get("unit")
            min_val = prop.get("min")
            max_val = prop.get("max")
            text_val = prop.get("text_value")

            if not prop_name or not prop_type:
                continue

            field_path = f"parsed_properties.{prop_type}.{prop_name}"

            if text_val and prop_type == "Descriptive Properties":
                conditions.append(
                    {field_path: {"$elemMatch": {"$regex": text_val, "$options": "i"}}}
                )
                continue

            try:
                metric = build_range_conditions("metric", target_unit, min_val, max_val)
                english = build_range_conditions(
                    "english", target_unit, min_val, max_val
                )

                sub_conditions = []
                if metric:
                    sub_conditions.append({"$and": metric})
                if english:
                    sub_conditions.append({"$and": english})

                if sub_conditions:
                    conditions.append(
                        {
                            field_path: {
                                "$elemMatch": (
                                    {"$or": sub_conditions}
                                    if len(sub_conditions) > 1
                                    else sub_conditions[0]
                                )
                            }
                        }
                    )
            except (ValueError, TypeError):
                continue

        # Final query assembly
        query = (
            {"$and": conditions}
            if len(conditions) > 1
            else (conditions[0] if conditions else {})
        )

        skip = (page - 1) * limit
        materials_cursor = materials_collection.find(query).skip(skip).limit(limit)

        materials_list = []
        for material in materials_cursor:
            material["_id"] = str(material["_id"])
            materials_list.append(material)

        total_count = materials_collection.count_documents(query)
        return materials_list, total_count

    @staticmethod
    def get_material_by_guid(mat_guid):
        # Fetch a single material by its matGUID
        materials_collection = mongo.db["materials"]
        material = materials_collection.find_one({"matGUID": mat_guid})

        if material:
            material["_id"] = str(material["_id"])

        return material

    @staticmethod
    def aggregate_materials(pipeline):
        materials_collection = mongo.db["materials"]

        # Add a limit stage if not present
        if not any("$limit" in stage for stage in pipeline if isinstance(stage, dict)):
            pipeline.append({"$limit": 10})

        # Make sure matGUID in pipeline
        for stage in pipeline:
            if isinstance(stage, dict) and "$project" in stage:
                stage["$project"].setdefault("matGUID", 1)
                stage["$project"].setdefault("Material Name", 1)
                stage["$project"].setdefault("Material Notes", 1)

        cursor = materials_collection.aggregate(pipeline)

        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)

        return results

    @staticmethod
    def upload_files(files):
        if not files:
            raise ValueError("No files provided for upload.")

        results = []
        materials_collection = mongo.db["materials"]

        for file in files:
            filename = file.filename

            try:
                # --- Read and Parse JSON ---
                file.stream.seek(0)
                try:
                    json_data = json.load(file.stream)
                except json.JSONDecodeError as e:
                    results.append(
                        {
                            "filename": filename,
                            "status": "error",
                            "message": f"Invalid JSON format: {str(e)}",
                        }
                    )
                    continue
                except Exception as e:
                    results.append(
                        {
                            "filename": filename,
                            "status": "error",
                            "message": f"Error reading file stream: {str(e)}",
                        }
                    )
                    continue

                # --- MANDATORY FIELD CHECK: Material Name ---
                if "Material Name" not in json_data or not json_data["Material Name"]:
                    results.append(
                        {
                            "filename": filename,
                            "status": "skipped",
                            "message": "Skipped: 'Material Name' key is missing or empty in the JSON data.",
                        }
                    )
                    continue

                material_name = json_data["Material Name"]

                # --- Check for Existing Material (by matGUID first, then name) ---
                existing_material = None
                provided_mat_guid = json_data.get("matGUID")

                if provided_mat_guid:
                    existing_material = materials_collection.find_one(
                        {"matGUID": provided_mat_guid}
                    )
                    if existing_material:
                        results.append(
                            {
                                "filename": filename,
                                "status": "exists",
                                "message": f"Material with provided matGUID '{provided_mat_guid}' already exists.",
                                "existing_id": str(existing_material["_id"]),
                                "matGUID": provided_mat_guid,
                                "Material Name": existing_material.get("Material Name"),
                            }
                        )
                        continue

                # Check by name only if matGUID wasn't provided or didn't match
                existing_material = materials_collection.find_one(
                    {"Material Name": material_name}
                )
                if existing_material:
                    results.append(
                        {
                            "filename": filename,
                            "status": "exists",
                            "message": f"Material with name '{material_name}' already exists.",
                            "existing_id": str(existing_material["_id"]),
                            "Material Name": material_name,
                            "matGUID": existing_material.get("matGUID"),
                        }
                    )
                    continue

                # --- Process New Material ---
                mat_object_id = ObjectId()
                mat_guid_str = str(mat_object_id)

                # Parse properties
                properties = json_data.get("Properties", {})
                parsed = parse_properties(properties)

                # Update categories collection if needed
                categories = json_data.get("Categories", [])
                cats_update_result = CategoryModel.upload_categories(categories)

                # Update property_filters collection if needed (min, max value)
                filters_update_result = PropertyModel.upload_properties(properties)

                # Create the document to insert
                document = {
                    "_id": mat_object_id,
                    "matGUID": mat_guid_str,
                    **json_data,
                    "parsed_properties": parsed,
                    "upload_date": datetime.now(timezone.utc),
                }

                # Insert into MongoDB
                inserted = materials_collection.insert_one(document)

                results.append(
                    {
                        "filename": filename,
                        "inserted_id": str(inserted.inserted_id),
                        "matGUID": mat_guid_str,
                        "Material Name": material_name,
                        "categories_update": cats_update_result,
                        "props_filter_update": filters_update_result,
                        "status": "success",
                        "message": "File uploaded successfully",
                    }
                )

            except ValueError as e:
                results.append(
                    {
                        "filename": filename,
                        "status": "error",
                        "message": f"Data processing error: {str(e)}",
                    }
                )
            except Exception as e:
                results.append(
                    {
                        "filename": filename,
                        "status": "error",
                        "message": f"An unexpected error occurred: {str(e)}",
                    }
                )

        return results
