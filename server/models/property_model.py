from extensions import mongo


class PropertyModel:
    @staticmethod
    def get_properties():
        properties_collection = mongo.db["property_filters"]

        properties = properties_collection.find({})

        properties_list = []
        for property in properties:
            property["_id"] = str(property["_id"])
            properties_list.append(property)

        return properties_list
