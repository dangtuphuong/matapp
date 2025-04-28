from extensions import mongo


class MaterialModel:
    @staticmethod
    def get_all_materials():
        # Fetch all materials from MongoDB
        materials_collection = mongo.db["materials"]
        materials = materials_collection.find()
        materials_list = []

        for material in materials:
            material["_id"] = str(material["_id"])
            materials_list.append(material)

        return materials_list

    @staticmethod
    def get_material_by_guid(mat_guid):
        # Fetch a single material by its matGUID
        materials_collection = mongo.db["materials"]
        material = materials_collection.find_one({"matGUID": mat_guid})

        if material:
            material["_id"] = str(material["_id"])

        return material
