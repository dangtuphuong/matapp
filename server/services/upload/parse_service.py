import re


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


def clean_material_properties(data):
    cleaned = {}

    for category, properties in data.items():
        print(category, properties)
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


def parse_properties(properties):
    try:
        parsed_properties = clean_material_properties(properties)

        # Update property filters

        # Update categories

        return parsed_properties
    except Exception as e:
        print(f"Error parsing upload material: {e}")
        return {}
