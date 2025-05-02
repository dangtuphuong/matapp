from extensions import mongo


class CategoryModel:
    @staticmethod
    def get_categories():
        categories_collection = mongo.db["categories"]

        categories = categories_collection.find({})

        categories_list = []
        for category in categories:
            category["_id"] = str(category["_id"])
            categories_list.append(category)

        return categories_list
