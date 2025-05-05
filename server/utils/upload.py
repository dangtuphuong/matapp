import re


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
