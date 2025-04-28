import re
import json
import os
from pymongo import MongoClient
from tqdm import tqdm

client = MongoClient(
    "mongodb+srv://admin:Password@matdb.77rntge.mongodb.net/matdb?retryWrites=true&w=majority&appName=matdb"
)

db = client.matdb
materials_col = db.materials
filters_col = db.filters
categories_col = db.categories

FILTERS_JSON_PATH = "filters.json"


# === Helper function to parse values ===
def parse_property_value(value_str):
    if not isinstance(value_str, str):
        return {"type": "raw", "value": value_str}

    value_str = value_str.strip().replace("−", "-").replace(",", "")

    # Handle context like "@ RT"
    context = None
    if "@" in value_str:
        parts = value_str.split("@", 1)
        value_str = parts[0].strip()
        context = "@" + parts[1].strip()

    sci_num_pattern = r"[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?"

    # Match comparison: >=, <=, >, <
    match = re.match(rf"^(>=|<=|>|<)\s*({sci_num_pattern})\s*(\D.*)?$", value_str)
    if match:
        op = match.group(1)
        num = float(match.group(2))
        unit = match.group(3).strip() if match.group(3) else None
        result = {
            "type": "range",
            "unit": unit,
        }
        if op in (">=", ">"):
            result["min"] = num
        if op in ("<=", "<"):
            result["max"] = num
        if context:
            result["context"] = context
        return result

    # Match range: "1e-8 - 0.01 unit"
    match = re.match(
        rf"^({sci_num_pattern})\s*[-–]\s*({sci_num_pattern})(?:\s+([^\d\s][\w/%\-^]*)\s*)?$",
        value_str,
    )
    if match:
        result = {
            "type": "range",
            "min": float(match.group(1)),
            "max": float(match.group(2)),
            "unit": match.group(3).strip() if match.group(3) else None,
        }
        if context:
            result["context"] = context
        return result

    # Match ± uncertainty: "± 0.5 mm"
    match = re.match(rf"^±\s*({sci_num_pattern})\s*(.*)?$", value_str)
    if match:
        uncertainty = float(match.group(1))
        unit = match.group(2).strip() if match.group(2) else None
        result = {
            "type": "range",
            "min": -uncertainty,
            "max": uncertainty,
            "unit": unit,
        }
        if context:
            result["context"] = context
        return result

    # Match single value: "1.0e-5 S/cm"
    match = re.match(rf"^({sci_num_pattern})\s*(\D.*)?$", value_str)
    if match:
        value = float(match.group(1))
        unit = match.group(2).strip() if match.group(2) else None
        result = {
            "type": "absolute",
            "min": value,
            "max": value,
            "unit": unit,
        }
        if context:
            result["context"] = context
        return result

    # Fallback
    return {"type": "raw", "value": value_str, "context": context}


# === Main function to clean property data ===
def clean_material_properties(data):
    cleaned = {}

    for category, properties in data.items():
        cleaned[category] = {}

        for prop_name, values in properties.items():
            # Case 1: non-dict lists (e.g., Color: ["off white"])
            if isinstance(values, list) and all(isinstance(v, str) for v in values):
                cleaned[category][prop_name] = values
                continue

            # Case 2: properly structured list of dicts with Metric/English/Comments
            if isinstance(values, list) and all(isinstance(v, dict) for v in values):
                cleaned_list = []
                for entry in values:
                    cleaned_entry = {
                        "metric": parse_property_value(entry.get("Metric")),
                        "english": parse_property_value(entry.get("English")),
                        "comments": entry.get("Comments"),
                    }
                    cleaned_list.append(cleaned_entry)
                cleaned[category][prop_name] = cleaned_list
                continue

            # Fallback: keep original if unknown structure
            cleaned[category][prop_name] = values

    return cleaned


# -------------------- STEP 2: Property Filter Generator -------------------- #
def parse_value_range(value):
    if not isinstance(value, str):
        return None, None

    value = value.strip().replace("−", "-").replace(",", "")

    # Scientific number pattern
    sci_num = r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?"

    # Handle comparison
    match = re.match(rf"^(>=|<=|>|<)\s*({sci_num})", value)
    if match:
        op, number = match.groups()
        num = float(number)
        if op in (">=", ">"):
            return num, None
        elif op in ("<=", "<"):
            return None, num

    # Handle numeric range: "1.0e-8 - 1.0e-6"
    match = re.match(rf"^({sci_num})\s*[-–]\s*({sci_num})", value)
    if match:
        a, b = match.groups()
        return float(a), float(b)

    # Handle single number
    match = re.match(rf"^({sci_num})", value)
    if match:
        num = float(match.group(1))
        return num, num

    return None, None


def extract_unit(value):
    # Remove anything after '@'
    main_part = value.split("@")[0].strip()

    # Match numbers (including ranges like 0.003 - 0.005)
    number_pattern = r"([<>]=?\s*)?[-+]?\d*\.?\d+(?:\s*-\s*[-+]?\d*\.?\d+)?"
    match = re.search(number_pattern, main_part)

    if match:
        unit_candidate = main_part[match.end() :].strip()
        # Clean common noise (e.g., remove leading hyphens or extra spaces)
        unit_candidate = re.sub(r"^[\-\s]+", "", unit_candidate)
        return unit_candidate if unit_candidate else None
    return None


def upsert_property_filter(category_name, prop_name, unit, min_val, max_val):
    """Updates/creates a property filter in a local JSON file instead of MongoDB."""

    # Load existing filters or start fresh
    if os.path.exists(FILTERS_JSON_PATH):
        with open(FILTERS_JSON_PATH, "r", encoding="utf-8") as f:
            filters_data = json.load(f)
    else:
        filters_data = []

    # Find or create category
    category = next((cat for cat in filters_data if cat["name"] == category_name), None)

    if not category:
        new_category = {
            "_id": len(filters_data) + 1,
            "name": category_name,
            "properties": [
                {
                    "_id": 1,
                    "name": prop_name,
                    "units": [{"unit": unit, "min": min_val, "max": max_val}],
                }
            ],
        }
        filters_data.append(new_category)
    else:
        existing_item = next(
            (item for item in category["properties"] if item["name"] == prop_name),
            None,
        )

        if not existing_item:
            new_prop = {
                "_id": len(category["properties"]) + 1,
                "name": prop_name,
                "units": [{"unit": unit, "min": min_val, "max": max_val}],
            }
            category["properties"].append(new_prop)
        else:
            # Update or append unit range
            updated = False
            for u in existing_item["units"]:
                if u["unit"] == unit:
                    if min_val is not None and (u["min"] is None or min_val < u["min"]):
                        u["min"] = min_val
                    if max_val is not None and (u["max"] is None or max_val > u["max"]):
                        u["max"] = max_val
                    updated = True
                    break
            if not updated:
                existing_item["units"].append(
                    {"unit": unit, "min": min_val, "max": max_val}
                )

    # Save updated filter structure to file
    with open(FILTERS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(filters_data, f, indent=2, ensure_ascii=False)


def handle_non_numeric_property(category_name, prop_name):
    """Adds a non-numeric property to a local JSON file instead of MongoDB."""

    # Load existing filters or start fresh
    if os.path.exists(FILTERS_JSON_PATH):
        with open(FILTERS_JSON_PATH, "r", encoding="utf-8") as f:
            filters_data = json.load(f)
    else:
        filters_data = []

    # Check if the category exists
    category = next((cat for cat in filters_data if cat["name"] == category_name), None)

    if not category:
        # Add new category with one non-numeric property
        new_category = {
            "_id": len(filters_data) + 1,
            "name": category_name,
            "properties": [{"_id": 1, "name": prop_name}],
        }
        filters_data.append(new_category)
    else:
        # Check if name already exists
        existing_item = next(
            (item for item in category["properties"] if item["name"] == prop_name),
            None,
        )

        if not existing_item:
            new_prop = {"_id": len(category["properties"]) + 1, "name": prop_name}
            category["properties"].append(new_prop)

    # Write back to JSON
    with open(FILTERS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(filters_data, f, indent=2, ensure_ascii=False)


def process_filters(properties):
    for cat_name, props in properties.items():
        for prop_name, entries in props.items():
            # Handle Non-Numeric Properties (e.g., lists of strings)
            if isinstance(entries, list) and all(isinstance(v, str) for v in entries):
                handle_non_numeric_property(cat_name, prop_name)
            else:
                # Handle Numeric Properties
                for entry in entries:
                    for unit_type in ["Metric", "English"]:
                        value = entry.get(unit_type)
                        if value:
                            unit = extract_unit(value)
                            min_val, max_val = parse_value_range(value)
                            upsert_property_filter(
                                cat_name, prop_name, unit, min_val, max_val
                            )


# === Main loop: Fetch, clean, and store ===
all_materials = list(materials_col.find({}))

# for material in tqdm(all_materials, desc="Cleaning materials"):
#     # Preserve all original fields
#     cleaned_material = material.copy()

#     properties = material.get("Properties", {})
#     categories = material.get("Categories", [])

#     # Clean the properties
#     cleaned_properties = clean_material_properties(properties)

#     # Update only the parsed_properties field
#     update_fields = {"parsed_properties": cleaned_properties}

#     # Perform the update directly
#     materials_col.update_one({"_id": cleaned_material["_id"]}, {"$set": update_fields})

#     process_filters(properties)

#     print(f"Done with {material.get("_id")}")

# Loop through all .json files in folder
folder_path = "/Users/phuongdang/Documents/code/swinburne/COS80029_TAP/shared/matweb/Plastic/json-items"

for filename in tqdm(os.listdir(folder_path), desc="Importing materials"):
    if filename.endswith(".json"):
        file_path = os.path.join(folder_path, filename)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if not isinstance(data, dict):
                print(f"⚠️ Skipped {filename}: Not a JSON object")
                continue

            properties = data.get("Properties", {})
            parsed_properties = clean_material_properties(properties)

            # Inject parsed_properties into the document
            data["parsed_properties"] = parsed_properties

            if (
                data["Vendors"]
                == "No vendors are listed for this material. Please click here if you are a supplier and would like information on how to add your listing to this material."
            ):
                data["Vendors"] = ""

            materials_col.insert_one(data)

            process_filters(properties)

        except Exception as e:
            print(f"❌ Error importing {filename}: {e}")
