from extensions import mongo


class SettingModel:
    @staticmethod
    def get_all_settings():
        settings_collection = mongo.db["settings"]
        settings = settings_collection.find({})

        settings_list = []
        for setting in settings:
            setting["_id"] = str(setting["_id"])
            settings_list.append(setting)

        return settings_list[0]

    @staticmethod
    def update_settings(settings):
        try:
            settings_collection = mongo.db["settings"]
            first_doc = settings_collection.find_one()

            if first_doc:
                settings_collection.update_one(
                    {"_id": first_doc["_id"]}, {"$set": {"smart_search": settings}}
                )
                # Fetch the updated document
                updated_doc = settings_collection.find_one({"_id": first_doc["_id"]})
                return updated_doc
            else:
                inserted = settings_collection.insert_one({"smart_search": settings})
                new_doc = settings_collection.find_one({"_id": inserted.inserted_id})
                return new_doc
        except Exception as e:
            print("Update settings error:", e)
            return {"error": str(e)}
