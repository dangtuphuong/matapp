from extensions import mongo


class MaterialModel:
    @staticmethod
    def get_all_materials(page=1, limit=10):
        materials_collection = mongo.db["materials"]

        # If page > 1, set the starting point for the query to the last _id from the previous page
        last_id = None
        if page > 1:
            # Calculate how many documents to skip to get to the start of the current page
            skip = (page - 1) * limit
            # Get the last material's _id from the previous page
            last_material = materials_collection.find().skip(skip - 1).limit(1)
            last_doc = last_material.next() if last_material.alive else None
            last_id = last_doc["_id"] if last_doc else None

        # Fetch materials starting after the last _id
        query = {}
        if last_id:
            query["_id"] = {"$gt": last_id}

        materials = materials_collection.find(query).limit(limit)

        materials_list = []
        for material in materials:
            material["_id"] = str(material["_id"])
            materials_list.append(material)

        # Get total count of materials for pagination info
        total_count = materials_collection.count_documents({})

        return materials_list, total_count

    @staticmethod
    def get_material_by_guid(mat_guid):
        # Fetch a single material by its matGUID
        materials_collection = mongo.db["materials"]
        material = materials_collection.find_one({"matGUID": mat_guid})

        if material:
            material["_id"] = str(material["_id"])

        return material
