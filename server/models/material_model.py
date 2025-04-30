from extensions import mongo
import re


class MaterialModel:
    @staticmethod
    def get_all_materials(
        page=1, limit=10, searchTerm="", searchCategories=[], searchProperties=[]
    ):
        materials_collection = mongo.db["materials"]
        query = {}
        conditions = []

        # Search term
        if searchTerm:
            conditions.append(
                {"Material Name": {"$regex": searchTerm, "$options": "i"}}
            )

        # Categories
        if searchCategories:
            category_list = [cat.strip() for cat in searchCategories if cat.strip()]
            if category_list:
                conditions.append({"Categories": {"$all": category_list}})

        # Property filters
        for prop in searchProperties:
            prop_type = prop.get("category")
            prop_name = prop.get("property")
            target_unit = prop.get("unit")
            min_val = prop.get("min")
            max_val = prop.get("max")

            if not prop_name or not prop_type:
                continue

            # Build the property condition
            prop_conditions = []

            try:
                # Handle metric system
                metric_conditions = []
                if target_unit:
                    metric_conditions.append({"metric.unit": target_unit})

                if min_val is not None:
                    min_val = float(min_val)
                    min_conditions = [
                        # Absolute value ≥ min_val
                        {
                            "$and": [
                                {"metric.type": "absolute"},
                                {"metric.min": {"$gte": min_val}},
                            ]
                        },
                        # Range includes min_val (min ≤ min_val ≤ max)
                        {
                            "$and": [
                                {"metric.type": "range"},
                                {"metric.min": {"$lte": min_val}},
                                {"metric.max": {"$gte": min_val}},
                            ]
                        },
                        # Open-ended range with min ≤ min_val
                        {
                            "$and": [
                                {"metric.type": "range"},
                                {"metric.min": {"$lte": min_val}},
                                {"metric.max": {"$exists": False}},
                            ]
                        },
                    ]
                    metric_conditions.append({"$or": min_conditions})

                if max_val is not None:
                    max_val = float(max_val)
                    max_conditions = [
                        # Absolute value ≤ max_val
                        {
                            "$and": [
                                {"metric.type": "absolute"},
                                {"metric.max": {"$lte": max_val}},
                            ]
                        },
                        # Range includes max_val (min ≤ max_val ≤ max)
                        {
                            "$and": [
                                {"metric.type": "range"},
                                {"metric.min": {"$lte": max_val}},
                                {"metric.max": {"$gte": max_val}},
                            ]
                        },
                        # Open-ended range with max ≥ max_val
                        {
                            "$and": [
                                {"metric.type": "range"},
                                {"metric.max": {"$gte": max_val}},
                                {"metric.min": {"$exists": False}},
                            ]
                        },
                    ]
                    metric_conditions.append({"$or": max_conditions})

                if metric_conditions:
                    prop_conditions.append({"$and": metric_conditions})

                # Handle english system (same logic as metric)
                english_conditions = []
                if target_unit:
                    english_conditions.append({"english.unit": target_unit})

                if min_val is not None:
                    min_val = float(min_val)
                    min_conditions = [
                        {
                            "$and": [
                                {"english.type": "absolute"},
                                {"english.min": {"$gte": min_val}},
                            ]
                        },
                        {
                            "$and": [
                                {"english.type": "range"},
                                {"english.min": {"$lte": min_val}},
                                {"english.max": {"$gte": min_val}},
                            ]
                        },
                        {
                            "$and": [
                                {"english.type": "range"},
                                {"english.min": {"$lte": min_val}},
                                {"english.max": {"$exists": False}},
                            ]
                        },
                    ]
                    english_conditions.append({"$or": min_conditions})

                if max_val is not None:
                    max_val = float(max_val)
                    max_conditions = [
                        {
                            "$and": [
                                {"english.type": "absolute"},
                                {"english.max": {"$lte": max_val}},
                            ]
                        },
                        {
                            "$and": [
                                {"english.type": "range"},
                                {"english.min": {"$lte": max_val}},
                                {"english.max": {"$gte": max_val}},
                            ]
                        },
                        {
                            "$and": [
                                {"english.type": "range"},
                                {"english.max": {"$gte": max_val}},
                                {"english.min": {"$exists": False}},
                            ]
                        },
                    ]
                    english_conditions.append({"$or": max_conditions})

                if english_conditions:
                    prop_conditions.append({"$and": english_conditions})

                if prop_conditions:
                    conditions.append(
                        {
                            f"parsed_properties.{prop_type}.{prop_name}": {
                                "$elemMatch": (
                                    {"$or": prop_conditions}
                                    if len(prop_conditions) > 1
                                    else prop_conditions[0]
                                )
                            }
                        }
                    )

            except (ValueError, TypeError):
                continue

        # Combine all conditions
        if conditions:
            query = {"$and": conditions} if len(conditions) > 1 else conditions[0]

        # Pagination
        skip = (page - 1) * limit
        materials = materials_collection.find(query).skip(skip).limit(limit)

        materials_list = []
        for material in materials:
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
