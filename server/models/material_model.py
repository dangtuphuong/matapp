from extensions import mongo

class MaterialModel:
    @staticmethod
    def get_all_materials(page=1, limit=10, search_term=""):
        materials_collection = mongo.db["materials"]

        # Build the query
        query = {}
        if search_term:
            # Case-insensitive search for material name
            query["Material Name"] = {"$regex": search_term, "$options": "i"}  # 'i' for case-insensitive

        # Pagination Logic
        skip = (page - 1) * limit
        materials = materials_collection.find(query).skip(skip).limit(limit)

        materials_list = []
        for material in materials:
            material["_id"] = str(material["_id"])
            materials_list.append(material)

        # Get the total count of materials that match the query
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

