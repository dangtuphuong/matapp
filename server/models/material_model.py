from extensions import mongo
import re


class MaterialModel:
    @staticmethod
    def get_all_materials(
        page=1, limit=10, search_term="", search_cats=[], search_properties=[]
    ):
        materials_collection = mongo.db["materials"]
        query = {}
        conditions = []

        # Search term
        if search_term:
            conditions.append(
                {"Material Name": {"$regex": search_term, "$options": "i"}}
            )

        # Categories
        if search_cats:
            category_list = [cat.strip() for cat in search_cats]
            if category_list:
                conditions.append({"Categories": {"$all": category_list}})

        # Property filters
        for prop in search_properties:
            prop_name = prop.get("name")
            min_val = prop.get("min")
            max_val = prop.get("max")

            if not prop_name:
                continue

            # Assume we only search within Metric values for simplicity
            path = f"parsed_properties.Mechanical Properties.{prop_name}.0.metric.min.$numberDouble"

            range_condition = {}
            if isinstance(min_val, (int, float)):
                range_condition["$gte"] = str(min_val)
            if isinstance(max_val, (int, float)):
                range_condition["$lte"] = str(max_val)

            if range_condition:
                conditions.append({path: range_condition})

        # Combine all conditions
        if conditions:
            query = {"$and": conditions}

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

    @staticmethod
    def search_material(name_query):
        materials_collection = mongo.db["materials"]

        # Case-insensitive regex search
        query = {"Material Name": {"$regex": re.escape(name_query), "$options": "i"}}

        results = list(materials_collection.find(query))
        return results

    @staticmethod
    def filter_materials(categories=[], property_conditions=[]):
        materials_collection = mongo.db["materials"]
        query = []

        # Filter by categories
        if categories:
            query.append({"Categories": {"$in": categories}})

        # Add parsed_properties conditions
        for cond in property_conditions:
            section = cond["section"]  # e.g., "Physical Properties"
            name = cond["name"]  # e.g., "Density"
            value = cond["value"]  # e.g., 2.5
            operator = cond["operator"]  # e.g., "gte"
            unit_system = cond["unit_system"]  # e.g., "metric"

            op_map = {
                "lt": "$lt",
                "lte": "$lte",
                "eq": "$eq",
                "gte": "$gte",
                "gt": "$gt",
            }

            property_query = {
                f"parsed_properties.{section}.{name}.{unit_system}.min": {
                    op_map[operator]: value
                }
            }
            query.append(property_query)

        final_query = {"$and": query} if query else {}
        results = list(materials_collection.find(final_query))
        return results
