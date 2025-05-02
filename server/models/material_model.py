from extensions import mongo
import re


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
